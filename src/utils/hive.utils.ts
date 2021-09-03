import {
  Asset,
  ClaimRewardBalanceOperation,
  Client,
  ExtendedAccount,
  PrivateKey,
} from '@hiveio/dhive';
import {
  setErrorMessage,
  setSuccessMessage,
} from '@popup/actions/message.actions';
import KeychainApi from '@popup/api/keychain';
import { store } from '@popup/store';
import { ActiveAccount } from 'src/interfaces/active-account.interface';
import { CollateralizedConversion } from 'src/interfaces/collaterelized-conversion.interface';
import { Delegator } from 'src/interfaces/delegations.interface';
import { GlobalProperties } from 'src/interfaces/global-properties.interface';
import { Rpc } from 'src/interfaces/rpc.interface';
import FormatUtils from 'src/utils/format.utils';

const DEFAULT_RPC = 'https://api.hive.blog';
const HIVE_VOTING_MANA_REGENERATION_SECONDS = 432000;
const HIVE_100_PERCENT = 10000;

let client = new Client(DEFAULT_RPC);

const getClient = (): Client => {
  return client;
};
const setRpc = (rpc: Rpc) => {
  client = new Client(rpc.uri === 'DEFAULT' ? DEFAULT_RPC : rpc.uri);
};

const getVP = (account: ExtendedAccount) => {
  if (!account.name) {
    return null;
  }
  const estimated_max =
    (getEffectiveVestingSharesPerAccount(account) -
      parseFloat(account.vesting_withdraw_rate as string)) *
    1000000;
  const current_mana = parseFloat(
    account.voting_manabar.current_mana as string,
  );
  const last_update_time = account.voting_manabar.last_update_time;
  const diff_in_seconds = Math.round(Date.now() / 1000 - last_update_time);
  let estimated_mana =
    current_mana +
    (diff_in_seconds * estimated_max) / HIVE_VOTING_MANA_REGENERATION_SECONDS;
  if (estimated_mana > estimated_max) {
    estimated_mana = estimated_max;
  }
  const estimated_pct = (estimated_mana / estimated_max) * 100;
  return estimated_pct;
};

const getEffectiveVestingSharesPerAccount = (account: ExtendedAccount) => {
  const effective_vesting_shares =
    parseFloat((account.vesting_shares as string).replace(' VESTS', '')) +
    parseFloat(
      (account.received_vesting_shares as string).replace(' VESTS', ''),
    ) -
    parseFloat(
      (account.delegated_vesting_shares as string).replace(' VESTS', ''),
    );
  return effective_vesting_shares;
};

const getVotingDollarsPerAccount = (
  voteWeight: number,
  properties: GlobalProperties,
  account: ExtendedAccount,
  full: boolean,
) => {
  if (!properties.globals || !account.name) {
    return null;
  }
  const vp = getVP(account)! * 100;
  const rewardBalance = getRewardBalance(properties);
  const recentClaims = getRecentClaims(properties);
  const hivePrice = getHivePrice(properties);
  const votePowerReserveRate = getVotePowerReserveRate(properties);

  if (rewardBalance && recentClaims && hivePrice && votePowerReserveRate) {
    const effective_vesting_shares = Math.round(
      getEffectiveVestingSharesPerAccount(account) * 1000000,
    );
    const current_power = full ? 10000 : vp;
    const weight = voteWeight * 100;

    const max_vote_denom =
      (votePowerReserveRate * HIVE_VOTING_MANA_REGENERATION_SECONDS) /
      (60 * 60 * 24);
    let used_power = Math.round((current_power * weight) / HIVE_100_PERCENT);
    used_power = Math.round((used_power + max_vote_denom - 1) / max_vote_denom);
    const rshares = Math.round(
      (effective_vesting_shares * used_power) / HIVE_100_PERCENT,
    );
    const voteValue = ((rshares * rewardBalance) / recentClaims) * hivePrice;
    return isNaN(voteValue) ? '0' : voteValue.toFixed(2);
  } else {
    return;
  }
};
export const getRC = async (account: ExtendedAccount) => {
  const rcAcc = await getClient().rc.findRCAccounts([account.name]);
  const rc = await getClient().rc.calculateRCMana(rcAcc[0]);
  return rc;
};

const getRewardBalance = (properties: GlobalProperties) => {
  return parseFloat(properties.rewardFund!.reward_balance);
};

const getRecentClaims = (properties: GlobalProperties) => {
  return parseInt(properties.rewardFund!.recent_claims, 10);
};

const getHivePrice = (properties: GlobalProperties) => {
  return (
    parseFloat(properties.price!.base + '') /
    parseFloat(properties.price!.quote + '')
  );
};

const getVotePowerReserveRate = (properties: GlobalProperties) => {
  return properties.globals!.vote_power_reserve_rate;
};

const getTimeBeforeFull = (votingPower: number) => {
  let fullInString;
  let remainingPowerToGet = 100.0 - votingPower;

  // 1% every 72minutes
  let minutesNeeded = remainingPowerToGet * 72;
  if (minutesNeeded === 0) {
    return chrome.i18n.getMessage('popup_utils_full');
  } else {
    let fullInDays = parseInt((minutesNeeded / 1440).toString());
    let fullInHours = parseInt(
      ((minutesNeeded - fullInDays * 1440) / 60).toString(),
    );
    let fullInMinutes = parseInt(
      (minutesNeeded - fullInDays * 1440 - fullInHours * 60).toString(),
    );

    fullInString =
      (fullInDays === 0
        ? ' '
        : fullInDays +
          (fullInDays > 1
            ? ` ${chrome.i18n.getMessage('days')} `
            : ` ${chrome.i18n.getMessage('day')} `)) +
      (fullInHours === 0
        ? ' '
        : fullInHours +
          (fullInHours > 1
            ? ` ${chrome.i18n.getMessage('hours')} `
            : ` ${chrome.i18n.getMessage('hour')} `)) +
      (fullInMinutes === 0
        ? ' '
        : fullInMinutes +
          (fullInMinutes > 1
            ? ` ${chrome.i18n.getMessage('minutes')} `
            : ` ${chrome.i18n.getMessage('minute')} `));
  }
  return chrome.i18n.getMessage('full_in', [
    fullInString.replace(/\s+/g, ' ').trim(),
  ]);
};

export const getConversionRequests = async (name: string) => {
  const [hbdConversions, hiveConversions] = await Promise.all([
    getClient().database.call('get_conversion_requests', [name]),
    getClient().database.call('get_collateralized_conversion_requests', [name]),
  ]);

  return [
    ...hiveConversions.map((e: CollateralizedConversion) => ({
      amount: e.collateral_amount,
      conversion_date: e.conversion_date,
      id: e.id,
      owner: e.owner,
      requestid: e.requestid,
      collaterized: true,
    })),
    ...hbdConversions,
  ].sort(
    (a, b) =>
      new Date(a.conversion_date).getTime() -
      new Date(b.conversion_date).getTime(),
  );
};

export const getDelegators = async (name: string) => {
  return (
    (await KeychainApi.get(`/hive/delegators/${name}`)).data as Delegator[]
  )
    .filter((e) => e.vesting_shares !== 0)
    .sort((a, b) => b.vesting_shares - a.vesting_shares);
};

export const getDelegatees = async (name: string) => {
  return (await getClient().database.getVestingDelegations(name, '', 1000))
    .filter((e) => parseFloat(e.vesting_shares + '') !== 0)
    .sort(
      (a, b) =>
        parseFloat(b.vesting_shares + '') - parseFloat(a.vesting_shares + ''),
    );
};

const claimRewards = async (
  activeAccount: ActiveAccount,
  rewardHive: string | Asset,
  rewardHBD: string | Asset,
  rewardVests: string | Asset,
): Promise<boolean> => {
  console.log(rewardHive, rewardHBD, rewardVests);
  try {
    await getClient().broadcast.sendOperations(
      [
        [
          'claim_reward_balance',
          {
            account: activeAccount.name,
            reward_hive: rewardHive,
            reward_hbd: rewardHBD,
            reward_vests: rewardVests,
          },
        ] as ClaimRewardBalanceOperation,
      ],
      PrivateKey.fromString(activeAccount.keys.posting as string),
    );
    const rewardHp =
      FormatUtils.toHP(
        rewardVests.toString().replace('VESTS', ''),
        store.getState().globalProperties.globals,
      ) + ' HP';

    store.dispatch(
      setSuccessMessage('popup_html_claim_success', [
        [rewardHBD, rewardHive, rewardHp].join(', '),
      ]),
    );
    return true;
  } catch (err) {
    store.dispatch(setErrorMessage('popup_html_claim_error'));
    return false;
  }
};

const HiveUtils = {
  getClient,
  setRpc,
  getVP,
  getVotingDollarsPerAccount,
  getTimeBeforeFull,
  getConversionRequests,
  claimRewards,
};

export default HiveUtils;

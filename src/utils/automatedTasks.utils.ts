import { BackgroundCommand } from '@reference-data/background-message-key.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const getClaims = async (username: string) => {
  const values = await LocalStorageUtils.getMultipleValueFromLocalStorage([
    LocalStorageKeyEnum.CLAIM_ACCOUNTS,
    LocalStorageKeyEnum.CLAIM_REWARDS,
  ]);

  const accountValue = values[LocalStorageKeyEnum.CLAIM_ACCOUNTS]
    ? values[LocalStorageKeyEnum.CLAIM_ACCOUNTS][username]
    : false;
  const rewardValue = values[LocalStorageKeyEnum.CLAIM_REWARDS]
    ? values[LocalStorageKeyEnum.CLAIM_REWARDS][username]
    : false;

  return {
    [LocalStorageKeyEnum.CLAIM_ACCOUNTS]: accountValue,
    [LocalStorageKeyEnum.CLAIM_REWARDS]: rewardValue,
  };
};

const saveClaims = async (
  claimRewards: boolean,
  claimAccount: boolean,
  username: string,
) => {
  let allRewards = await getAllClaimRewards();
  let allAccounts = await getAllClaimAccounts();

  allRewards = allRewards ?? {};
  allAccounts = allAccounts ?? {};

  allRewards = {
    ...allRewards,
    [username]: claimRewards,
  };
  allAccounts = {
    ...allAccounts,
    [username]: claimAccount,
  };

  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.CLAIM_REWARDS,
    allRewards,
  );
  LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.CLAIM_ACCOUNTS,
    allAccounts,
  );

  chrome.runtime.sendMessage({
    command: BackgroundCommand.UPDATE_CLAIMS,
    value: {
      claimRewards: allRewards,
      claimAccounts: allAccounts,
    },
  });
};

const getAllClaimAccounts = async () => {
  return await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.CLAIM_ACCOUNTS,
  );
};
const getAllClaimRewards = async () => {
  return await LocalStorageUtils.getValueFromLocalStorage(
    LocalStorageKeyEnum.CLAIM_REWARDS,
  );
};

const initBackgroundClaims = async () => {
  let allRewards = await getAllClaimRewards();
  let allAccounts = await getAllClaimAccounts();
  chrome.runtime.sendMessage({
    command: BackgroundCommand.UPDATE_CLAIMS,
    value: {
      claimRewards: allRewards,
      claimAccounts: allAccounts,
    },
  });
};

const AutomatedTasksUtils = {
  getClaims,
  saveClaims,
  initBackgroundClaims,
};

export default AutomatedTasksUtils;

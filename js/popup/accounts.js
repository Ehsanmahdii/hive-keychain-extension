const REVEAL_PRIVATE = chrome.i18n.getMessage("popup_accounts_reveal_private");
const TO = chrome.i18n.getMessage("popup_html_transfer_to");
const FROM = chrome.i18n.getMessage("popup_html_transfer_from");
const NO_RECENT_TRANSFERS = chrome.i18n.getMessage(
  "popup_accounts_no_recent_transfers"
);
const INCORRECT_KEY = chrome.i18n.getMessage("popup_accounts_incorrect_key");
const INCORRECT_USER = chrome.i18n.getMessage("popup_accounts_incorrect_user");
const FILL = chrome.i18n.getMessage("popup_accounts_fill");
const PROPOSAL_ID = 174;
const PROPOSAL_POST =
  "https://peakd.com/hive/@keychain/hive-keychain-proposal-3-dhf";
// All functions regarding the handling of a particular account

// The public key could be supplied by the user or derived from the private key
// using hive.auth.wifToPublic().  The structures returned by
// hive.api.getAccounts() will have 'posting' and 'active' members each each
// of which is a perm_info structure.  These can be passed as the second
// parameter.  dpub will be the public key you wish to test.
function getPubkeyWeight(
  dpub /* Public key string */,
  perm_info /*permission info structure*/
) {
  for (let n in perm_info.key_auths) {
    const kw = perm_info.key_auths[n];
    const lpub = kw["0"];
    // later: maybe for multisig we should handle when weight threshold is too low by contacting the cosigner
    if (dpub == lpub) {
      return kw["1"];
    }
  } // for
  return 0;
}

// Load account information
const loadAccount = async (name, options) => {
  console.log(`Load account ${name}`);
  if (options) await options;
  activeAccount = accountsList.get(name);
  console.log(activeAccount);
  activeAccount.init();
  $("#recipient").autocomplete({
    source: to_autocomplete[activeAccount.getName()],
    minLength: 2,
    appendTo: "#autocomplete_container",
  });
  $("#send_form").toggle(activeAccount.hasKey("active"));
  $("#show_add_active").toggle(!activeAccount.hasKey("active"));
  $(".wallet_infos .main_currency").html("...");
  $("#vm_pct").html("...");
  $("#vm_val").html("");
  $("#rc").html("...");
  const [vm, full] = await activeAccount.getVotingMana();
  $("#vm_pct").html(vm + "%");
  $("#vm_info").attr("title", full);

  const witness_votes = await activeAccount.getAccountInfo("witness_votes");
  const proxy = await activeAccount.getAccountInfo("proxy");

  showUserData();
  claimRewards();
  prepareWitnessDiv(witness_votes, proxy);
  prepareDelegationTab();
  preparePowerUpDown();
  showTokenBalances();
  proposeVotes(name, witness_votes, proxy);
  // proposeWitnessVote(witness_votes, proxy);
  // checkProposalVote(name);
  getAccountHistory();
};

// Display all the account data
const showUserData = async () => {
  console.log("show bal");
  showBalances();
  const balance =
    $("#currency_send .select-selected").text() === "HIVE"
      ? await activeAccount.getHive()
      : await activeAccount.getHBD();
  $(".transfer_balance div").eq(1).html(numberWithCommas(balance));
  $("#amt_send_max")
    .unbind("click")
    .click(() => {
      $("#amt_send").val(balance);
    });
  const [vd, rc] = [
    await activeAccount.getVotingDollars(100),
    await activeAccount.getRC(),
  ];
  $("#vm_val").text(" ($" + vd + ")");

  $("#rc").html(rc.estimated_pct + "%");
  const full = rc.fullin;
  $("#rc_info").attr("title", full);
  const accountValue = await activeAccount.getAccountValue();
  if (accountValue) {
    $("#account_value_amt").html(accountValue);
  } else {
    $("#account_value_amt").html(
      chrome.i18n.getMessage("popup_accounts_no_bittrex")
    );
  }
};

const getAccountHistory = async () => {
  const transfers = await activeAccount.getTransfers();
  $("#acc_transfers div").eq(1).empty();
  if (transfers.length != 0) {
    for (transfer of transfers) {
      let memo = transfer[1].op[1].memo;
      let timestamp = transfer[1].timestamp;
      let date = new Date(timestamp);
      timestamp =
        date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
      if (memo[0] == "#") {
        if (activeAccount.hasKey("memo")) {
          try {
            memo = window.decodeMemo(activeAccount.getKey("memo"), memo);
          } catch (e) {}
        } else memo = chrome.i18n.getMessage("popup_accounts_add_memo");
      }
      var transfers_element = $(
        "<div class='transfer_row'><span class='transfer_date' title='" +
          transfer[1].timestamp +
          "'>" +
          timestamp +
          "</span><span class='transfer_val'>" +
          (transfer[1].op[1].from == activeAccount.getName() ? "-" : "+") +
          " " +
          transfer[1].op[1].amount.split(" ")[0] +
          "</span><span class='transfer_name'>" +
          (transfer[1].op[1].from == activeAccount.getName()
            ? `${TO}: @` + transfer[1].op[1].to
            : `${FROM}: @` + transfer[1].op[1].from) +
          "</span><span class='transfer_cur'>" +
          transfer[1].op[1].amount.split(" ")[1] +
          "</span></div>"
      );

      var memo_element = $("<div class='memo'></div>");
      memo_element.text(memo);
      transfers_element.append(memo_element);
      $("#acc_transfers div").eq(1).append(transfers_element);
    }
    $(".transfer_row").click(function () {
      $(".memo").eq($(this).index()).slideToggle();
    });
  } else
    $("#acc_transfers div")
      .eq(1)
      .append(`<div class="transfer_row">${NO_RECENT_TRANSFERS}</div>`);
};
// Adding accounts. Private keys can be entered individually or by the mean of the
// master key, in which case user can chose which keys to store, mk will then be
// discarded.
$("#add_account_by_auth").click(async () => {
  const name = $("#username_auth").val();
  const auth = $("#authorized_acc_auth").val();
  const authAccount = accountsList.get(auth);
  if (!username || !auth) {
    showError(chrome.i18n.getMessage("popup_accounts_fill"));
  } else if (!authAccount)
    showError(chrome.i18n.getMessage("popup_no_auth_account", [auth]));
  else if (accountsList.get(name))
    showError(
      chrome.i18n.getMessage("popup_accounts_already_registered", [name])
    );
  else {
    const account = new Account({ name, keys: {} });
    account.init();
    let hasAuth = 0;
    for (const key of ["posting", "active"]) {
      const keyInfo = await account.getAccountInfo(key);
      console.log(keyInfo);
      if (keyInfo.account_auths.find((e) => e.includes(auth))) {
        hasAuth = 1;
        account.setKey(key, authAccount.getKey(key));
        account.setKey(`${key}Pubkey`, `@${auth}`);
      }
    }
    console.log(account.getKeys());
    if (hasAuth) {
      accountsList.add(account).save(mk);
      initializeMainMenu();
      initializeVisibility();
    } else
      showError(chrome.i18n.getMessage("popup_accounts_no_auth", [auth, name]));
  }
});

$("#check_add_account").click(function () {
  $("#master_check").css("display", "none");
  const username = $("#username").val();
  const pwd = $("#pwd").val();
  if (username !== "" && pwd !== "") {
    if (accountsList && accountsList.get(username)) {
      showError(
        chrome.i18n.getMessage("popup_accounts_already_registered", [username])
      );
    } else
      hive.api.getAccounts([username], function (err, result) {
        if (result.length != 0) {
          const active_info = result["0"].active;
          const posting_info = result["0"].posting;
          const pub_memo = result["0"].memo_key;
          if (hive.auth.isWif(pwd)) {
            const pub_unknown = hive.auth.wifToPublic(pwd);
            if (pub_unknown == pub_memo) {
              addAccount({
                name: username,
                keys: {
                  memo: pwd,
                  memoPubkey: pub_memo,
                },
              });
            } else if (getPubkeyWeight(pub_unknown, posting_info)) {
              addAccount({
                name: username,
                keys: {
                  posting: pwd,
                  postingPubkey: pub_unknown,
                },
              });
            } else if (getPubkeyWeight(pub_unknown, active_info)) {
              addAccount({
                name: username,
                keys: {
                  active: pwd,
                  activePubkey: pub_unknown,
                },
              });
            }
          } else {
            const keys = hive.auth.getPrivateKeys(username, pwd, [
              "posting",
              "active",
              "memo",
            ]);
            const has_active =
              getPubkeyWeight(keys.activePubkey, active_info) != 0;
            const has_posting =
              getPubkeyWeight(keys.postingPubkey, posting_info) != 0;
            if (
              has_active > 0 ||
              has_posting > 0 ||
              keys.memoPubkey == pub_memo
            ) {
              $("#posting_key").prop("checked", has_posting);
              $("#posting_key").prop("disabled", !has_posting);
              $("#active_key").prop("checked", has_active);
              $("#active_key").prop("disabled", !has_active);
              $("#memo_key").prop("checked", keys.memoPubkey == pub_memo);
              $("#memo_key").prop("disabled", keys.memoPubkey != pub_memo);
              $("#add_account_div").hide();
              $("#master_check").show();
            } else {
              showError(INCORRECT_KEY);
            }
          }
        } else {
          showError(INCORRECT_USER);
        }
      });
  } else {
    showError(FILL);
  }
});

// If master key was entered, handle which keys to save.
$("#save_master").click(function () {
  if (
    $("#posting_key").prop("checked") ||
    $("#active_key").prop("checked") ||
    $("#memo_key").prop("checked")
  ) {
    let permissions = [];
    if ($("#posting_key").prop("checked")) permissions.push("posting");
    if ($("#active_key").prop("checked")) permissions.push("active");
    if ($("#memo_key").prop("checked")) permissions.push("memo");
    const keys = hive.auth.getPrivateKeys(
      $("#username").val(),
      $("#pwd").val(),
      permissions
    );
    addAccount({
      name: $("#username").val(),
      keys: keys,
    });
  }
});

// Add new account to Chrome local storage (encrypted with AES)
const addAccount = (account) => {
  accountsList.add(new Account(account)).save(mk);
  console.log("init");
  initializeMainMenu();
  initializeVisibility();
};

// Display Add Copy or delete individual keys
const manageKeys = (name) => {
  let index = -1;
  let account = accountsList.getList().filter((obj, i) => {
    if (obj.getName() === name) {
      index = i;
      return obj;
    }
  })[0];
  console.log(`keychain://add_account=${JSON.stringify(account.account)}`);
  const keys = account.getKeys();
  $(".public_key").html("");
  $(".private_key").html("");
  for (keyName in keys) {
    if (keyName.includes("posting")) {
      $(".img_add_key").eq(0).hide();
      $(".remove_key").eq(0).show();
      if (keyName.includes("Pubkey"))
        $(".public_key").eq(0).html(account.getKey(keyName));
      else
        $(".private_key").eq(0).html(REVEAL_PRIVATE).css("font-size", "12px");
    } else if (keyName.includes("active")) {
      $(".img_add_key").eq(1).hide();
      $(".remove_key").eq(1).show();
      if (keyName.includes("Pubkey"))
        $(".public_key").eq(1).html(account.getKey(keyName));
      else
        $(".private_key").eq(1).html(REVEAL_PRIVATE).css("font-size", "12px");
    } else if (keyName.includes("memo")) {
      $(".remove_key").eq(2).show();
      $(".img_add_key").eq(2).hide();
      if (keyName.includes("Pubkey"))
        $(".public_key").eq(2).html(account.getKey(keyName));
      else
        $(".private_key").eq(2).html(REVEAL_PRIVATE).css("font-size", "12px");
    }
  }
  if ($(".private_key").eq(0).html() === "") {
    $(".img_add_key").eq(0).show();
    $(".remove_key").eq(0).hide();
  }
  if ($(".private_key").eq(1).html() === "") {
    $(".img_add_key").eq(1).show();
    $(".remove_key").eq(1).hide();
  }
  if ($(".private_key").eq(2).html() === "") {
    $(".img_add_key").eq(2).show();
    $(".remove_key").eq(2).hide();
  }
  let timeout = null;
  $(".public_key")
    .unbind("click")
    .click(function () {
      if (timeout != null) clearTimeout(timeout);
      $("#copied").hide();
      $("#fake_input").val($(this).html());
      $("#fake_input").select();
      document.execCommand("copy");
      $("#copied").slideDown(600);
      timeout = setTimeout(function () {
        $("#copied").slideUp(600);
      }, 6000);
    });

  $(".private_key")
    .unbind("click")
    .click(function () {
      if (timeout != null) clearTimeout(timeout);
      if ($(this).html() == REVEAL_PRIVATE) {
        const type = $(this).prev().attr("id");
        const key = accountsList.getById(index).getKey(type);
        $(this).html(key).css("font-size", "10px");
      } else {
        $("#copied").hide();
        $("#fake_input").val($(this).html());
        $("#fake_input").select();
        document.execCommand("copy");
        $("#copied").slideDown(600);
        timeout = setTimeout(function () {
          $("#copied").slideUp(600);
        }, 6000);
      }
    });

  $(".remove_key")
    .unbind("click")
    .click(function () {
      accountsList.getById(index).deleteKey($(this).attr("id"));
      accountsList.getById(index).deleteKey(`${$(this).attr("id")}Pubkey`);
      accountsList.save(mk);
      if (!Object.keys(accountsList.getById(index).getKeys()).length) {
        deleteAccount(index);
      } else {
        manageKeys(name);
      }
    });
  // Delete account and all its keys
  $("#delete_account")
    .unbind("click")
    .click(function () {
      deleteAccount(index);
    });
  $("#show_qr")
    .unbind("click")
    .click(function () {
      $("#qrcode_export").html(
        kjua({
          text: `keychain://add_account=${JSON.stringify(
            accountsList.getById(index).account
          )}`,
          quiet: 0,
          back: "rgba(255, 255, 255, 0.7)",
        })
      );
      $("#show_qr").hide();
    });
  let adding_key = null;
  $(".img_add_key")
    .unbind("click")
    .click(function () {
      adding_key = $(this)
        .prevAll(".keys_info_type")
        .attr("id")
        .split("_")[0]
        .toLowerCase();
      $("#add_key_div p span").html(adding_key);
      $("#manage_keys").hide();
      $("#add_key_div").show();
    });

  // Try to add the new key
  $("#add_new_key")
    .unbind("click")
    .click(function () {
      const keys = accountsList.getById(index).getKeys();
      const pwd = $("#new_key").val();

      hive.api.getAccounts([name], function (err, result) {
        if (result.length != 0) {
          const active_info = result["0"].active;
          const posting_info = result["0"].posting;
          const pub_memo = result["0"].memo_key;
          if (hive.auth.isWif(pwd)) {
            const pub_unknown = hive.auth.wifToPublic(pwd);
            if (adding_key == "memo" && pub_unknown == pub_memo) {
              if (keys.hasOwnProperty("memo"))
                showError(
                  chrome.i18n.getMessage("popup_accounts_already_have_key", [
                    chrome.i18n.getMessage("memo"),
                  ])
                );
              else addKeys(index, "memo", pwd, pub_memo, name);
            } else if (
              adding_key == "posting" &&
              getPubkeyWeight(pub_unknown, posting_info)
            ) {
              if (keys.hasOwnProperty("posting"))
                showError(
                  chrome.i18n.getMessage("popup_accounts_already_have_key", [
                    chrome.i18n.getMessage("posting"),
                  ])
                );
              else addKeys(index, "posting", pwd, pub_unknown, name);
            } else if (
              adding_key == "active" &&
              getPubkeyWeight(pub_unknown, active_info)
            ) {
              if (keys.hasOwnProperty("active"))
                showError(
                  chrome.i18n.getMessage("popup_accounts_already_have_key", [
                    chrome.i18n.getMessage("active"),
                  ])
                );
              else addKeys(index, "active", pwd, pub_unknown, name);
            } else {
              console.log(adding_key);
              console.log(
                adding_key,
                chrome.i18n.getMessage(adding_key),
                chrome.i18n.getMessage("popup_accounts_not_your_key", [
                  chrome.i18n.getMessage(adding_key),
                ])
              );
              showError(
                chrome.i18n.getMessage("popup_accounts_not_your_key", [
                  chrome.i18n.getMessage(adding_key),
                ])
              );
            }
          } else {
            const keys = hive.auth.getPrivateKeys(name, pwd, [
              "posting",
              "active",
              "memo",
            ]);
            console.log(keys);
            switch (adding_key) {
              case "memo":
                pub = pub_memo;
                weight = keys.memoPubkey == pub_memo ? 1 : 0;
                break;
              case "active":
                pub = keys.activePubkey;
                weight = getPubkeyWeight(keys.activePubkey, active_info);
                break;
              case "posting":
                pub = keys.postingPubkey;
                weight = getPubkeyWeight(keys.postingPubkey, posting_info);
                break;
            }
            if (weight) addKeys(index, adding_key, keys[adding_key], pub, name);
            else {
              showError(chrome.i18n.getMessage("popup_accounts_not_wif"));
            }
          } // else
        } else {
          showError(chrome.i18n.getMessage("popup_accounts_try_again"));
        } // if/else
      }); // getAccounts
    }); // .click
}; // manageKeys

// Add the new keys to the display and the encrypted storage
const addKeys = (i, key, priv, pub, name) => {
  accountsList.getById(i).setKey(key, priv);
  accountsList.getById(i).setKey(`${key}Pubkey`, pub);
  accountsList.save(mk);
  manageKeys(name);
  $("#add_key_div").hide();
  $("#new_key").val("");
  $(".error_div").hide();
  $("#manage_keys").show();
};

// show balance for this account
const showBalances = async () => {
  $("#wallet_amt .wallet_infos")
    .eq(0)
    .find("div")
    .eq(0)
    .html(numberWithCommas(await activeAccount.getHive()));

  $("#wallet_amt .wallet_infos")
    .eq(1)
    .find("div")
    .eq(0)
    .html(numberWithCommas(await activeAccount.getHBD()));
  $("#wallet_amt .wallet_infos")
    .eq(2)
    .find("div")
    .eq(0)
    .html(numberWithCommas(await activeAccount.getHP()));

  if ((await activeAccount.getHiveSavings()) !== "0.000") {
    $("#wallet_amt .wallet_infos")
      .eq(0)
      .find("div")
      .eq(1)
      .html(numberWithCommas(`+ ${await activeAccount.getHiveSavings()}`));
    $("#wallet_amt .wallet_infos")
      .eq(0)
      .find("div")
      .eq(1)
      .prop(
        "title",
        `This amount is stored in savings and is subject to a 3 days withdraw period.`
      );
  } else {
    $("#wallet_amt .wallet_infos").eq(0).find("div").eq(1).html("");
  }
  if ((await activeAccount.getHBDSavings()) !== "0.000") {
    $("#wallet_amt .wallet_infos")
      .eq(1)
      .find("div")
      .eq(1)
      .html(numberWithCommas(`+ ${await activeAccount.getHBDSavings()}`));
    $("#wallet_amt .wallet_infos")
      .eq(1)
      .find("div")
      .eq(1)
      .prop(
        "title",
        `This amount is stored in savings and is subject to a 3 days withdraw period. It will increase with a ${
          (await activeAccount.props.getProp("hbd_interest_rate")) / 100
        }% interest.`
      );
  } else {
    $("#wallet_amt .wallet_infos").eq(1).find("div").eq(1).html("");
  }
  $("#balance_loader").hide();
};

// Delete account (and encrypt the rest)
const deleteAccount = (i) => {
  accountsList.delete(i).save(mk);
  $(".settings_child").hide();
  initializeMainMenu();
  initializeVisibility();
};

const claimRewards = async () => {
  console.log(`Check claim rewards for ${activeAccount.getName()}`);
  const [reward_hbd, reward_hp, reward_hive, rewardText] =
    await activeAccount.getAvailableRewards();
  if (hasReward(reward_hbd, reward_hp, reward_hive)) {
    $("#claim_rewards button").prop("disabled", false);
    $("#claim").show();
    $("#claim")
      .unbind("click")
      .click(function () {
        $("#claim_rewards").show();
        $("#claim_rewards p").html(rewardText);
        $("#redeem_rewards")
          .unbind("click")
          .click(function () {
            $("#claim_rewards button").prop("disabled", true);
            if (activeAccount.hasKey("posting"))
              activeAccount.claimRewards((res, err) => {
                console.log(res, err);
                $("#claim_rewards").hide();
                $("#claim_rewards button").prop("disabled", false);
                initializeMainMenu();
              });
            else showError(chrome.i18n.getMessage("popup_accounts_err_claim"));
          });
        $(".close_claim")
          .unbind("click")
          .click(function () {
            $("#claim_rewards").hide();
          });
      });
  } else $("#claim").hide();
};

const proposeWitnessVote = (witness_votes, proxy) => {
  if (
    !proxy &&
    (!witness_votes.includes("stoodkev") ||
      !witness_votes.includes("yabapmatt") ||
      !witness_votes.includes("aggroed"))
  ) {
    $("#stoodkev img").attr(
      "src",
      "../images/icon_witness-vote" +
        (witness_votes.includes("stoodkev") ? "" : "_default") +
        ".svg"
    );
    $("#yabapmatt img").attr(
      "src",
      "../images/icon_witness-vote" +
        (witness_votes.includes("yabapmatt") ? "" : "_default") +
        ".svg"
    );
    $("#aggroed img").attr(
      "src",
      "../images/icon_witness-vote" +
        (witness_votes.includes("aggroed") ? "" : "_default") +
        ".svg"
    );

    if (!witness_votes.includes("yabapmatt"))
      $("#yabapmatt").click(function () {
        voteFor("yabapmatt");
      });

    if (!witness_votes.includes("stoodkev"))
      $("#stoodkev").click(function () {
        voteFor("stoodkev");
      });

    if (!witness_votes.includes("aggroed"))
      $("#aggroed").click(function () {
        voteFor("aggroed");
      });

    setTimeout(function () {
      $("#witness_votes").show();
      $("#witness_votes").animate(
        {
          opacity: 1,
        },
        500
      );
    }, 2000);
  } else {
    $("#witness_votes").animate(
      {
        opacity: 0,
      },
      500,
      function () {
        $("#witness_votes").hide();
      }
    );
  }
};

const proposeVotes = async (name, witness_votes, proxy) => {
  hive.api
    .listProposalVotesAsync(
      [PROPOSAL_ID, name],
      1,
      "by_proposal_voter",
      "ascending",
      "all"
    )
    .then((votes) => {
      console.log("votes", votes);
      if (votes[0].voter !== name && !proxy) {
        console.log("show");
        $("#proposal_vote").show();
        $("#proposal_voter")
          .unbind("click")
          .click(() => {
            $("#proposal_voter").prop("disabled", true);

            hive.broadcast.send(
              {
                operations: [
                  [
                    "update_proposal_votes",
                    {
                      voter: name,
                      proposal_ids: [`${PROPOSAL_ID}`],
                      approve: "true",
                    },
                  ],
                ],
                extensions: [],
              },
              { active: activeAccount.getKey("active") },
              (err, res) => {
                $("#proposal_vote").hide();
                if (err) {
                  showError("Something went wrong!");
                  console.log(err);
                } else
                  showConfirm("Succesfully voted for the Keychain proposal!");
              }
            );
          });
      } else {
        $("#proposal_vote").hide();
        proposeWitnessVote(witness_votes, proxy);
      }
    });
};

$("#proposal_read").click(() => {
  var win = window.open(PROPOSAL_POST, "_blank");
  win.focus();
});

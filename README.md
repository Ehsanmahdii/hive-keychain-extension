<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

- [About Keychain][1]
- [Usage][2]
- [Operations][3]
  - [hive_keychain][4]
    - [requestHandshake][5]
      - [Parameters][6]
    - [requestEncodeMessage][7]
      - [Parameters][8]
    - [requestVerifyKey][9]
      - [Parameters][10]
    - [requestSignBuffer][11]
      - [Parameters][12]
    - [requestAddAccountAuthority][13]
      - [Parameters][14]
    - [requestRemoveAccountAuthority][15]
      - [Parameters][16]
    - [requestAddKeyAuthority][17]
      - [Parameters][18]
    - [requestRemoveKeyAuthority][19]
      - [Parameters][20]
    - [requestBroadcast][21]
      - [Parameters][22]
    - [requestSignTx][23]
      - [Parameters][24]
    - [requestSignedCall][25]
      - [Parameters][26]
    - [requestPost][27]
      - [Parameters][28]
    - [requestVote][29]
      - [Parameters][30]
    - [requestCustomJson][31]
      - [Parameters][32]
    - [requestTransfer][33]
      - [Parameters][34]
    - [requestSendToken][35]
      - [Parameters][36]
    - [requestDelegation][37]
      - [Parameters][38]
    - [requestWitnessVote][39]
      - [Parameters][40]
    - [requestProxy][41]
      - [Parameters][42]
    - [requestPowerUp][43]
      - [Parameters][44]
    - [requestPowerDown][45]
      - [Parameters][46]
    - [requestCreateClaimedAccount][47]
      - [Parameters][48]
    - [requestCreateProposal][49]
      - [Parameters][50]
    - [requestRemoveProposal][51]
      - [Parameters][52]
    - [requestUpdateProposalVote][53]
      - [Parameters][54]
    - [requestAddAccount][55]
      - [Parameters][56]
    - [requestConversion][57]
      - [Parameters][58]
    - [requestRecurrentTransfer][59]
      - [Parameters][60]

## About Keychain

![][61]

Putting private keys directly into websites is not safe or secure, even ones run by reputable community members. Yet this is currently how nearly every Hive-based site or service currently works. On top of that, most Hive users likely use their master password which is even worse.

The Vessel desktop wallet software is a secure alternative, but it is too difficult to use for the majority of Hive users and does not easily interact with websites - which is Hive's primary use case.

On Ethereum, you never have to enter your private key into a website to use a dApp. You can just use a browser extension like Metamask, which dApp websites can interface with to securely store your keys and broadcast transactions to the blockchain.

Hive Keychain aims to bring the security and ease-of-use of Metamask to the Hive blockchain platform.

### Installation

You can download and install the latest published version of the extension for the following browsers:

- Google Chrome (or Opera/Brave): [on Chrome Store][62]
  - Export your keys from Steem keychain (in settings)
  - Download this repository as zip
  - Unzip the downloaded folder
  - Right click on any existing extension > Manage my extensions.
  - Activate developer mode.
  - Click "Load Unpacked" and select the unzipped folder.
  - Import your keys (use the same master password)
- Firefox: [on Firefox Addon Store][63]

### Features

The Hive Keychain extension includes the following features:

- Store an unlimited number of Hive account keys, encrypted with AES
- View balances, transaction history, voting power, and resource credits
- Send HIVE and HBD transfers, manage witness votes, and update HP delegation right from the extension
- Manage your Hive Engine tokens
- Power up or down
- Securely interact with Hive-based websites that have integrated with Hive Keychain
- Manage transaction confirmation preferences by account and by website
- Locks automatically on browser shutdown or manually using the lock button

### Website Integration

a
Websites can currently request the Hive Keychain extension to perform the following functions / broadcast operations:

- Send a handshake to make sure the extension is installed
- Decrypt a message encrypted by a Hive account private key (commonly used for "logging in")
- Post a comment (top level or reply)
- Broadcast a vote
- Broadcast a custom JSON operation
- Send a transfer
- Send Hive Engine tokens
- Send Delegations
- Power up/down
- Vote for witnesses
- Create/Remove/Vote for proposals
- Create claimed accounts
- Sign Tx

## Usage

## Example

An example of a web page that interacts with the extension is included in the "example" folder in the repo. You can test it by running a local HTTP server and going to [http://localhost:1337/main.html][64] in your browser.

`cd example`
`python -m http.server 1337 //or any other method to run a static server`

NOTE: On localhost, it will run on port 1337.

## Using Keychain for logins

To login, you can encode a message from your backend and verify that the user can decode it using the `requestVerifyKey` method.
See an example in this project by @howo (@steempress witness):

[Frontend][65]

[Backend][66]

Alternatively, you can use `requestSignTx` and verify the signature on your backend.

## @hiveio/keychain

This [npm module][67] makes it easy to add Keychain support within the browser. It also includes helpful functions to check whether Keychain was used before. It was developed by @therealwolf (witness).

## Operations

The Hive Keychain extension will inject a "hive_keychain" JavaScript into all web pages opened in the browser while the extension is running. You can therefore check if the current user has the extension installed using the following code:

### hive_keychain

Use the `hive_keychain` methods listed below to issue requests to the Hive blockchain.

#### requestHandshake

This function is called to verify Keychain installation on a user's device

##### Parameters

- `callback` **[function][68]** Confirms Keychain installation

#### requestEncodeMessage

This function is called to verify that the user has a certain authority over an account, by requesting to decode a message

##### Parameters

- `username` **[String][69]** Hive account to perform the request
- `receiver` **[String][69]** Account that will decode the string
- `message` **[String][69]** Message to be encrypted
- `key` **[String][69]** Type of key. Can be 'Posting','Active' or 'Memo'
- `callback` **[function][68]** Keychain's response to the request
- `rpc` **[String][69]** Override user's RPC settings (optional, default `null`)

#### requestVerifyKey

This function is called to verify that the user has a certain authority over an account, by requesting to decode a message

##### Parameters

- `account` **[String][69]** Hive account to perform the request
- `message` **[String][69]** Message to be decoded by the account
- `key` **[String][69]** Type of key. Can be 'Posting','Active' or 'Memo'
- `callback` **[function][68]** Keychain's response to the request
- `rpc` **[String][69]** Override user's RPC settings (optional, default `null`)

#### requestSignBuffer

Requests a message to be signed with proper authority

##### Parameters

- `account` **[String][69]** Hive account to perform the request. If null, user can choose the account from a dropdown (optional, default `null`)
- `message` **[String][69]** Message to be signed by the account
- `key` **[String][69]** Type of key. Can be 'Posting','Active' or 'Memo'
- `callback` **[function][68]** Keychain's response to the request
- `rpc` **[String][69]** Override user's RPC settings (optional, default `null`)
- `title` **[String][69]** Override "Sign message" title (optional, default `null`)

#### requestAddAccountAuthority

Requests to add account authority over another account. For more information about multisig, please read [https://peakd.com/utopian-io/@stoodkev/how-to-set-up-and-use-multisignature-accounts-on-steem-blockchain][70]

##### Parameters

- `account` **[String][69]** Hive account to perform the request
- `authorizedUsername` **[String][69]** Authorized account
- `role` **[String][69]** Type of authority. Can be 'Posting','Active' or 'Memo'
- `weight` **[number][71]** Weight of the authority
- `callback` **[function][68]** Keychain's response to the request
- `rpc` **[String][69]** Override user's RPC settings (optional, default `null`)

#### requestRemoveAccountAuthority

Requests to remove an account authority over another account. For more information about multisig, please read [https://peakd.com/utopian-io/@stoodkev/how-to-set-up-and-use-multisignature-accounts-on-steem-blockchain][70]

##### Parameters

- `account` **[String][69]** Hive account to perform the request
- `authorizedUsername` **[String][69]** Account to lose authority
- `role` **[String][69]** Type of authority. Can be 'Posting','Active' or 'Memo'
- `callback` **[function][68]** Keychain's response to the request
- `rpc` **[String][69]** Override user's RPC settings (optional, default `null`)

#### requestAddKeyAuthority

Requests to add a new key authority to an account. For more information about multisig, please read [https://peakd.com/utopian-io/@stoodkev/how-to-set-up-and-use-multisignature-accounts-on-steem-blockchain][70]

##### Parameters

- `account` **[String][69]** Hive account to perform the request
- `authorizedKey` **[String][69]** New public key to be associated with the account
- `role` **[String][69]** Type of authority. Can be 'Posting','Active' or 'Memo'
- `weight` **[number][71]** Weight of the key authority
- `callback` **[function][68]** Keychain's response to the request
- `rpc` **[String][69]** Override user's RPC settings (optional, default `null`)

#### requestRemoveKeyAuthority

Requests to remove a key to an account. For more information about multisig, please read [https://peakd.com/utopian-io/@stoodkev/how-to-set-up-and-use-multisignature-accounts-on-steem-blockchain][70]

##### Parameters

- `account` **[String][69]** Hive account to perform the request
- `authorizedKey` **[String][69]** Key to be removed (public key).
- `role` **[String][69]** Type of authority. Can be 'Posting','Active' or 'Memo'.
- `callback` **[function][68]** Keychain's response to the request
- `rpc` **[String][69]** Override user's RPC settings (optional, default `null`)

#### requestBroadcast

Generic broadcast request

##### Parameters

- `account` **[String][69]** Hive account to perform the request
- `operations` **[Array][72]** Array of operations to be broadcasted
- `key` **[String][69]** Type of key. Can be 'Posting','Active' or 'Memo'
- `callback` **[function][68]** Keychain's response to the request
- `rpc` **[String][69]** Override user's RPC settings (optional, default `null`)

#### requestSignTx

Requests to sign a transaction with a given authority

##### Parameters

- `account` **[String][69]** Hive account to perform the request
- `tx` **[Object][73]** Unsigned transaction
- `key` **[String][69]** Type of key. Can be 'Posting','Active' or 'Memo'
- `callback` **[function][68]** Keychain's response to the request
- `rpc` **[String][69]** Override user's RPC settings (optional, default `null`)

#### requestSignedCall

Requests a signed call

##### Parameters

- `account` **[String][69]** Hive account to perform the request
- `method` **[String][69]** Method of the call
- `params` **[String][69]** Parameters of the call
- `key` **[String][69]** Type of key. Can be 'Posting','Active' or 'Memo'
- `callback` **[function][68]** Keychain's response to the request
- `rpc` **[String][69]** Override user's RPC settings (optional, default `null`)

#### requestPost

Requests to broadcast a blog post/comment

##### Parameters

- `account` **[String][69]** Hive account to perform the request
- `title` **[String][69]** Title of the blog post
- `body` **[String][69]** Content of the blog post
- `parent_perm` **[String][69]** Permlink of the parent post. Main tag for a root post
- `parent_account` **[String][69]** Author of the parent post. Pass null for root post
- `json_metadata` **[Object][73]** Parameters of the call
- `permlink` **[String][69]** Permlink of the blog post
- `comment_options` **[Object][73]** Options attached to the blog post. Consult Hive documentation to learn more about it
- `callback` **[function][68]** Keychain's response to the request
- `rpc` **[String][69]** Override user's RPC settings (optional, default `null`)

#### requestVote

Requests a vote

##### Parameters

- `account` **[String][69]** Hive account to perform the request
- `permlink` **[String][69]** Permlink of the blog post
- `author` **[String][69]** Author of the blog post
- `weight` **[Number][71]** Weight of the vote, comprised between -10,000 (-100%) and 10,000 (100%)
- `callback` **[function][68]** Keychain's response to the request
- `rpc` **[String][69]** Override user's RPC settings (optional, default `null`)

#### requestCustomJson

Requests a custom JSON broadcast

##### Parameters

- `account` **[String][69]** Hive account to perform the request. If null, user can choose the account from a dropdown (optional, default `null`)
- `id` **[String][69]** Type of custom_json to be broadcasted
- `key` **[String][69]** Type of key. Can be 'Posting','Active' or 'Memo'
- `json` **[String][69]** Stringified custom json
- `display_msg` **[String][69]** Message to display to explain to the user what this broadcast is about
- `callback` **[function][68]** Keychain's response to the request
- `rpc` **[String][69]** Override user's RPC settings (optional, default `null`)

#### requestTransfer

Requests a transfer

##### Parameters

- `account` **[String][69]** Hive account to perform the request
- `to` **[String][69]** Hive account to receive the transfer
- `amount` **[String][69]** Amount to be transfered. Requires 3 decimals.
- `memo` **[String][69]** The memo will be automatically encrypted if starting by '#' and the memo key is available on Keychain. It will also overrule the account to be enforced, regardless of the 'enforce' parameter
- `currency` **[String][69]** 'HIVE' or 'HBD'
- `callback` **[function][68]** Keychain's response to the request
- `enforce` **[boolean][74]** If set to true, user cannot chose to make the transfer from another account (optional, default `false`)
- `rpc` **[String][69]** Override user's RPC settings (optional, default `null`)

#### requestSendToken

Requests a token transfer

##### Parameters

- `account` **[String][69]** Hive account to perform the request
- `to` **[String][69]** Hive account to receive the transfer
- `amount` **[String][69]** Amount to be transfered. Requires 3 decimals.
- `memo` **[String][69]** Memo attached to the transfer
- `currency` **[String][69]** Token to be sent
- `callback` **[function][68]** Keychain's response to the request
- `rpc` **[String][69]** Override user's RPC settings (optional, default `null`)

#### requestDelegation

Requests a delegation broadcast

##### Parameters

- `username`
- `delegatee` **[String][69]** Account to receive the delegation
- `amount` **[String][69]** Amount to be transfered. Requires 3 decimals for HP, 6 for VESTS.
- `unit` **[String][69]** HP or VESTS
- `callback` **[function][68]** Keychain's response to the request
- `rpc` **[String][69]** Override user's RPC settings (optional, default `null`)
- `account` **[String][69]** Hive account to perform the request. If null, user can choose the account from a dropdown (optional, default `null`)

#### requestWitnessVote

Requests a witness vote broadcast

##### Parameters

- `username`
- `witness` **[String][69]** Account to receive the witness vote
- `vote` **[boolean][74]** Set to true to vote for the witness, false to unvote
- `callback` **[function][68]** Keychain's response to the request
- `rpc` **[String][69]** Override user's RPC settings (optional, default `null`)
- `account` **[String][69]** Hive account to perform the request. If null, user can choose the account from a dropdown (optional, default `null`)

#### requestProxy

Select an account as proxy

##### Parameters

- `username`
- `proxy` **[String][69]** Account to become the proxy. Empty string ('') to remove a proxy
- `callback` **[function][68]** Keychain's response to the request
- `rpc` **[String][69]** Override user's RPC settings (optional, default `null`)
- `account` **[String][69]** Hive account to perform the request. If null, user can choose the account from a dropdown (optional, default `null`)

#### requestPowerUp

Request a power up

##### Parameters

- `username` **[String][69]** Hive account to perform the request
- `recipient` **[String][69]** Account to receive the power up
- `hive` **[String][69]** Amount of HIVE to be powered up
- `callback` **[function][68]** Keychain's response to the request
- `rpc` **[String][69]** Override user's RPC settings (optional, default `null`)

#### requestPowerDown

Request a power down

##### Parameters

- `username` **[String][69]** Hive account to perform the request
- `hive_power` **[String][69]** Amount of HIVE to be powered down
- `callback` **[function][68]** Keychain's response to the request
- `rpc` **[String][69]** Override user's RPC settings (optional, default `null`)

#### requestCreateClaimedAccount

Request the creation of an account using claimed tokens

##### Parameters

- `username` **[String][69]** Hive account to perform the request
- `new_account` **[String][69]** New account to be created
- `owner` **[object][73]** owner authority object
- `active` **[object][73]** active authority object
- `posting` **[object][73]** posting authority object
- `memo` **[String][69]** public memo key
- `callback` **[function][68]** Keychain's response to the request
- `rpc` **[String][69]** Override user's RPC settings (optional, default `null`)

#### requestCreateProposal

Request the creation of a DHF proposal

##### Parameters

- `username` **[String][69]** Hive account to perform the request
- `receiver` **[String][69]** Account receiving the funding if the proposal is voted
- `subject` **[String][69]** Title of the DAO
- `permlink` **[String][69]** Permlink to the proposal description
- `daily_pay` **[String][69]** Daily amount to be received by `receiver`
- `start` **[String][69]** Starting date
- `end` **[String][69]** Ending date
- `extensions` **[String][69]** Stringified Array of extensions
- `callback` **[function][68]** Keychain's response to the request
- `rpc` **[String][69]** Override user's RPC settings (optional, default `null`)

#### requestRemoveProposal

Request the removal of a DHF proposal

##### Parameters

- `username` **[String][69]** Hive account to perform the request
- `proposal_ids` **[String][69]** Stringified Array of ids of the proposals to be removed
- `extensions` **[String][69]** Stringified Array of extensions
- `callback` **[function][68]** Keychain's response to the request
- `rpc` **[String][69]** Override user's RPC settings (optional, default `null`)

#### requestUpdateProposalVote

Vote/Unvote a DHF proposal

##### Parameters

- `username` **[String][69]** Hive account to perform the request
- `proposal_ids` **[String][69]** Stringified Array of Ids of the proposals to be voted
- `approve` **[boolean][74]** Set to true to support the proposal, false to remove a vote
- `extensions` **[String][69]** Stringified Array of extensions
- `callback` **[function][68]** Keychain's response to the request
- `rpc` **[String][69]** Override user's RPC settings (optional, default `null`)

#### requestAddAccount

Add a new account to Keychain

##### Parameters

- `username` **[String][69]** username of the account to be added
- `keys` **[Object][73]** private keys of the account : {active:'...',posting:'...',memo:'...'}. At least one must be specified.
- `callback`

#### requestConversion

Request currency conversion

##### Parameters

- `username` **[String][69]** Hive account to perform the request
- `amount` **[String][69]** amount to be converted.
- `collaterized` **[Boolean][74]** true to convert HIVE to HBD. false to convert HBD to HIVE.
- `callback` **[function][68]** Keychain's response to the request
- `rpc` **[String][69]** Override user's RPC settings (optional, default `null`)

#### requestRecurrentTransfer

Request recurrent transfer

##### Parameters

- `username` **[String][69]** Hive account to perform the request (optional, default `null`)
- `to` **[String][69]** Hive account receiving the transfers.
- `amount` **[String][69]** amount to be sent on each execution.
- `currency` **[String][69]** HIVE or HBD on mainnet.
- `memo` **[String][69]** transfer memo
- `recurrence` **[Number][71]** How often will the payment be triggered (in hours).
- `executions` **[Number][71]** The times the recurrent payment will be executed.
- `callback` **[function][68]** Keychain's response to the request
- `rpc` **[String][69]** Override user's RPC settings (optional, default `null`)

[1]: #about-keychain
[2]: #usage
[3]: #operations
[4]: #hive_keychain
[5]: #requesthandshake
[6]: #parameters
[7]: #requestencodemessage
[8]: #parameters-1
[9]: #requestverifykey
[10]: #parameters-2
[11]: #requestsignbuffer
[12]: #parameters-3
[13]: #requestaddaccountauthority
[14]: #parameters-4
[15]: #requestremoveaccountauthority
[16]: #parameters-5
[17]: #requestaddkeyauthority
[18]: #parameters-6
[19]: #requestremovekeyauthority
[20]: #parameters-7
[21]: #requestbroadcast
[22]: #parameters-8
[23]: #requestsigntx
[24]: #parameters-9
[25]: #requestsignedcall
[26]: #parameters-10
[27]: #requestpost
[28]: #parameters-11
[29]: #requestvote
[30]: #parameters-12
[31]: #requestcustomjson
[32]: #parameters-13
[33]: #requesttransfer
[34]: #parameters-14
[35]: #requestsendtoken
[36]: #parameters-15
[37]: #requestdelegation
[38]: #parameters-16
[39]: #requestwitnessvote
[40]: #parameters-17
[41]: #requestproxy
[42]: #parameters-18
[43]: #requestpowerup
[44]: #parameters-19
[45]: #requestpowerdown
[46]: #parameters-20
[47]: #requestcreateclaimedaccount
[48]: #parameters-21
[49]: #requestcreateproposal
[50]: #parameters-22
[51]: #requestremoveproposal
[52]: #parameters-23
[53]: #requestupdateproposalvote
[54]: #parameters-24
[55]: #requestaddaccount
[56]: #parameters-25
[57]: #requestconversion
[58]: #parameters-26
[59]: #requestrecurrenttransfer
[60]: #parameters-27
[61]: http://u.cubeupload.com/arcange/yOdI5g.png
[62]: https://chrome.google.com/webstore/detail/hive-keychain/jcacnejopjdphbnjgfaaobbfafkihpep
[63]: https://addons.mozilla.org/en-GB/firefox/addon/hive-keychain/
[64]: http://localhost:1337/main.html
[65]: https://github.com/drov0/downvote-control-tools-front/blob/c453b81d482421e5ae006c25502c491dbebdc180/src/components/Login.js#L34
[66]: https://github.com/drov0/downvote-control-tool-back/blob/master/routes/auth.js#L159
[67]: https://www.npmjs.com/package/@hiveio/keychain
[68]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function
[69]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String
[70]: https://peakd.com/utopian-io/@stoodkev/how-to-set-up-and-use-multisignature-accounts-on-steem-blockchain
[71]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number
[72]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array
[73]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object
[74]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean

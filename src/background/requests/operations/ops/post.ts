import { getRequestHandler } from '@background/requests';
import {
  beautifyErrorMessage,
  createMessage,
} from '@background/requests/operations/operations.utils';
import {
  CommentOperation,
  CommentOptionsOperation,
  PrivateKey,
} from '@hiveio/dhive';
import { RequestId, RequestPost } from '@interfaces/keychain.interface';

export const broadcastPost = async (data: RequestPost & RequestId) => {
  let err, result;
  const client = getRequestHandler().getHiveClient();
  const key = getRequestHandler().key;
  try {
    if (data.comment_options === '') {
      result = await client.broadcast.comment(
        {
          parent_author: data.parent_username || '',
          parent_permlink: data.parent_perm,
          author: data.username,
          permlink: data.permlink,
          title: data.title || '',
          body: data.body,
          json_metadata: data.json_metadata,
        },
        PrivateKey.from(key!),
      );
    } else {
      const operations = [
        [
          'comment',
          {
            parent_author: data.parent_username,
            parent_permlink: data.parent_perm,
            author: data.username,
            permlink: data.permlink,
            title: data.title,
            body: data.body,
            json_metadata: data.json_metadata,
          },
        ] as CommentOperation,
        [
          'comment_options',
          JSON.parse(data.comment_options),
        ] as CommentOptionsOperation,
      ];
      result = await client.broadcast.sendOperations(
        operations,
        PrivateKey.from(key!),
      );
    }
  } catch (e) {
    err = e;
  } finally {
    const err_message = beautifyErrorMessage(err);
    const message = createMessage(
      err,
      result,
      data,
      chrome.i18n.getMessage('bgd_ops_post'),
      err_message,
    );
    return message;
  }
};

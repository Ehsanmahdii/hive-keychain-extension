import React from 'react';
import ButtonComponent from 'src/common-ui/button/button.component';
import DialogHeader from 'src/dialog/components/dialog-header/dialog-header.component';

type Props = {
  data: ResultMessage;
};

type ResultMessage = {
  msg: { message: string; success: boolean };
};

const RequestResponse = ({ data }: Props) => {
  console.log(data);
  return (
    <>
      <DialogHeader
        title={
          data.msg.success
            ? `${chrome.i18n.getMessage('dialog_header_success')} !`
            : `${chrome.i18n.getMessage('dialog_header_error')} !`
        }
      />
      <p>{data.msg.message}</p>

      <ButtonComponent
        label={'dialog_ok'}
        onClick={() => {
          window.close();
        }}
      />
    </>
  );
};

export default RequestResponse;

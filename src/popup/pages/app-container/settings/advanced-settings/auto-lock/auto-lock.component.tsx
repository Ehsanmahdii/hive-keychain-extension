import { Autolock, AutoLockType } from '@interfaces/autolock.interface';
import { setSuccessMessage } from '@popup/actions/message.actions';
import { goBack } from '@popup/actions/navigation.actions';
import { RootState } from '@popup/store';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import SwitchComponent from 'src/common-ui/switch/switch.component';
import AutolockUtils from 'src/utils/autolock.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';
import './auto-lock.component.scss';

const AutoLock = ({ setSuccessMessage, goBack }: PropsFromRedux) => {
  const [selectedType, setSelectedType] = useState(AutoLockType.DEFAULT);
  const [interval, setInterval] = useState(10);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const autolock: Autolock = await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.AUTOLOCK,
    );
    setSelectedType(
      autolock && autolock.type ? autolock.type : AutoLockType.DEFAULT,
    );
    setInterval(autolock && autolock.mn ? autolock.mn : 10);
  };

  const save = async () => {
    LocalStorageUtils.saveValueInLocalStorage(LocalStorageKeyEnum.AUTOLOCK, {
      type: selectedType,
      mn: interval,
    });
    AutolockUtils.initBackgroundAutolock();
    setSuccessMessage('popup_html_save_successful');
    goBack();
  };

  return (
    <div className="auto-lock-page">
      <PageTitleComponent
        title="popup_html_autolock"
        isBackButtonEnabled={true}
      />

      <SwitchComponent
        title="popup_html_al_default_title"
        hint="popup_html_al_default_info"
        checked={selectedType === AutoLockType.DEFAULT}
        onChange={() =>
          setSelectedType(AutoLockType.DEFAULT)
        }></SwitchComponent>
      <SwitchComponent
        title="popup_html_al_locked_title"
        hint="popup_html_al_locked_info"
        checked={selectedType === AutoLockType.DEVICE_LOCK}
        onChange={() =>
          setSelectedType(AutoLockType.DEVICE_LOCK)
        }></SwitchComponent>
      <SwitchComponent
        title="popup_html_al_idle_title"
        hint="popup_html_al_idle_info"
        checked={selectedType === AutoLockType.IDLE_LOCK}
        onChange={() =>
          setSelectedType(AutoLockType.IDLE_LOCK)
        }></SwitchComponent>

      {selectedType === AutoLockType.IDLE_LOCK && (
        <InputComponent
          value={interval}
          onChange={setInterval}
          placeholder="10"
          type={InputType.NUMBER}
          onEnterPress={() => save()}
        />
      )}

      <ButtonComponent label={'popup_html_save'} onClick={() => save()} />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {};
};

const connector = connect(mapStateToProps, { setSuccessMessage, goBack });
type PropsFromRedux = ConnectedProps<typeof connector>;

export const AutoLockComponent = connector(AutoLock);

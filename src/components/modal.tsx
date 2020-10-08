import React, { useState } from 'react';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';

const ModalExample = ({modal, setModal, modalInner}) => {

  const toggle = () => setModal(!modal)

  return (
    <Modal isOpen={modal} toggle={toggle}>
      {modalInner}
    </Modal>
  );
}

export default ModalExample;
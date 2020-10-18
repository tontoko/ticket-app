import React from 'react'
import { Modal } from 'reactstrap'

const ModalExample = ({ modal, setModal, modalInner }) => {
  const toggle = () => setModal(!modal)

  return (
    <Modal isOpen={modal} toggle={toggle}>
      {modalInner}
    </Modal>
  )
}

export default ModalExample

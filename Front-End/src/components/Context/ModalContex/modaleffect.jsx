import React, { createContext, useState, useContext } from "react";

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);  // For 'add' or 'edit'
  const [isAnimating, setIsAnimating] = useState(false);

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);  // Ensure the animation duration is accounted for
  };

  const closeModal = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setModalType(null);
      setIsAnimating(false);
    }, 300);  // Ensure animation duration for closing
  };

  return (
    <ModalContext.Provider value={{ isModalOpen, modalType, isAnimating, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

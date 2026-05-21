import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Modal } from '../components/Modal';

interface ModalContextType {
  showAlert: (message: string, title?: string) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: 'Pozor!',
    message: '',
  });

  const showAlert = useCallback((message: string, title: string = 'Pozor!') => {
    setModalState({
      isOpen: true,
      title,
      message,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <ModalContext.Provider value={{ showAlert }}>
      {children}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
      />
    </ModalContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useAlert must be used within a ModalProvider');
  }
  return context;
}

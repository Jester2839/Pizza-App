import React from 'react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  isLarge?: boolean;
}

export const AdminModal: React.FC<AdminModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  isLarge 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${isLarge ? 'modal-content--large' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close-icon" onClick={onClose}>
            <i className="ph ph-x"></i>
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && <div className="modal-footer modal-footer--end">{footer}</div>}
      </div>
    </div>
  );
};
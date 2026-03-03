import React from 'react';
import { Modal } from './Modal';
import { ActionButton } from './ActionButton';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps 
{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Delete',
    cancelText = 'Cancel'
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="flex flex-col items-center justify-center pt-2 pb-6 px-4 text-center">
                <div className="bg-red-50 text-red-500 rounded-full p-4 mb-5 border border-red-100 shadow-sm">
                    <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 mb-8 max-w-sm">{message}</p>
                
                <div className="flex items-center gap-3 w-full">
                    <ActionButton 
                        variant="secondary" 
                        onClick={onClose} 
                        className="w-full justify-center"
                    >
                        {cancelText}
                    </ActionButton>
                    <ActionButton 
                        variant="danger" 
                        onClick={() => { onConfirm(); onClose(); }} 
                        className="w-full justify-center"
                    >
                        {confirmText}
                    </ActionButton>
                </div>
            </div>
        </Modal>
    );
};

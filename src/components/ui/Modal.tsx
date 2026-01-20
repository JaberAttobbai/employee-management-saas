'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from "@/lib/utils";
import Button from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-lg bg-white shadow-lg animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between border-b p-4">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-4">
                    {children}
                </div>

                {footer && (
                    <div className="border-t p-4 flex justify-end gap-2 bg-gray-50 rounded-b-lg">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}

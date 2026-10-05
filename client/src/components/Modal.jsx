import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Universal Centered Modal Component
 * Uses React Portal to mount to document.body, ensuring:
 * - 100% viewport coverage by backdrop (dimming sidebar + content equally)
 * - Dead-center horizontal & vertical alignment across all screen sizes
 * - Trapped background scroll while open
 * - Clean Escape key dismissal
 */
export default function Modal({
  title,
  eyebrow = 'MASTER EXPORT PRO',
  onClose,
  children,
  footer,
  large = false,
  maxWidth
}) {
  // Lock body scroll and listen for Escape key
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('has-modal-open');

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    const handleBeforePrint = () => {
      document.body.style.overflow = 'visible';
    };

    const handleAfterPrint = () => {
      document.body.style.overflow = 'hidden';
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.classList.remove('has-modal-open');
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [onClose]);

  const modalNode = (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`modal ${large ? 'large-modal' : ''}`}
        style={maxWidth ? { width: `min(${maxWidth}, 94vw)` } : undefined}
      >
        <div className="modal-head">
          <div>
            {eyebrow && <div className="eyebrow">{eyebrow}</div>}
            <h2>{title}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
}

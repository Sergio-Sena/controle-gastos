import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--surface-overlay)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 'var(--z-modal)',
        padding: 'clamp(1rem, 3vw, 2rem)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        className="animate-scale-in"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-2xl)',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: 'clamp(1rem, 3vw, 1.5rem)',
          borderBottom: '1px solid var(--border-primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
            fontWeight: 'bold',
            color: 'var(--text-primary)'
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              transition: 'all var(--transition-base)',
              lineHeight: 1
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: 'clamp(1rem, 3vw, 1.5rem)',
          overflowY: 'auto',
          flex: 1
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

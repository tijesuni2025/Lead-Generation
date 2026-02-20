

export const ModalOverlay = ({ children, onClose, maxWidth = 500 }) => (
  <div 
    onClick={onClose} 
    style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(2, 4, 9, 0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '40px 24px', overflowY: 'auto',
    }}
  >
    <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth, marginBottom: 40 }}>
      {children}
    </div>
  </div>
);
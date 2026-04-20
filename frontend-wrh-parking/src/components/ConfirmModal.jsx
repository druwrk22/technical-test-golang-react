const ConfirmModal = ({ show, onClose, onConfirm, title, message, type = 'danger' }) => {
  if (!show) return null;

  return (
    <div className="wrh-modal-overlay" onClick={onClose}>
      <div className="wrh-modal-card" onClick={e => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">{title}</h4>
          <button className="btn-close" onClick={onClose} aria-label="Close"></button>
        </div>
        
        <p className="fs-5 mb-4">{message}</p>
        
        <div className="d-flex gap-2 justify-content-end">
          <button className="wrh-btn px-4" onClick={onClose}>
            Batal
          </button>
          <button className={`wrh-btn px-4 ${type === 'danger' ? 'danger' : 'primary'}`} onClick={onConfirm}>
            {type === 'danger' ? 'Ya, Akhiri' : 'Oke'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
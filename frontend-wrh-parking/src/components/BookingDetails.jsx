import TimerDisplay from './TimerDisplay';

const BookingDetails = ({ bookings, onEndSession }) => {
  if (bookings.length === 0) return <p className="text-center mt-4 fw-bold text-muted">Belum ada pemesanan aktif.</p>;

  return (
    <div className="wrh-card mt-4">
      <h3 className="mb-3 fw-bold">📋 Rincian Pemesanan Aktif</h3>
      <div className="row g-3">
        {bookings.map(b => (
          <div key={b.id} className="col-12">
            <div className="p-3 border border-3 border-dark bg-white d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 wrh-card">
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="badge badge-wrh bg-warning text-dark">A-{b.spotId}</span>
                  <span className="fw-bold fs-5">{b.plate}</span>
                </div>
                <small className="d-block text-muted">👤 {b.name} | ⏱️ {b.duration} menit</small>
              </div>
              <TimerDisplay startTime={b.startTime} duration={b.duration} />
              <button className="wrh-btn danger btn-sm" onClick={() => onEndSession(b.id, b.spotId)}>
                🛑 Akhiri
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingDetails;
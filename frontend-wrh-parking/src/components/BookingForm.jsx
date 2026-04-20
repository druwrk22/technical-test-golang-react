import { useState } from 'react';
import { DURATIONS } from '../utils/constants';

const BookingForm = ({ selectedSpot, onSubmit, onClear }) => {
  const [form, setForm] = useState({ name: '', plate: '', duration: DURATIONS[0] });
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSpot) return alert('Pilih spot parkir terlebih dahulu!');
    onSubmit(form);
    setShowConfirm(true);
    setForm({ name: '', plate: '', duration: DURATIONS[0] });
    setTimeout(onClear, 1500);
  };

  return (
    <div className="wrh-card mt-4">
      <h3 className="mb-3 fw-bold">📝 Form Pemesanan</h3>
      
      {showConfirm && (
        <div className="alert alert-success border border-3 border-dark fw-bold mb-3 wrh-card py-2">
          ✅ Pemesanan Berhasil! Silakan parkir di tempat yang dipilih.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label fw-bold">Nama Pemesan</label>
          <input type="text" className="form-control wrh-input" 
                 value={form.name} onChange={e => setForm({...form, name: e.target.value})} 
                 required placeholder="Contoh: Andaru Triadi"/>
        </div>
        <div className="mb-3">
          <label className="form-label fw-bold">Nomor Kendaraan</label>
          <input type="text" className="form-control wrh-input" 
                 value={form.plate} onChange={e => setForm({...form, plate: e.target.value.toUpperCase()})} 
                 required placeholder="Contoh: B 5310 THA"/>
        </div>
        <div className="mb-3">
          <label className="form-label fw-bold">Durasi Parkir (Menit)</label>
          <select className="form-select wrh-select" value={form.duration} onChange={e => setForm({...form, duration: Number(e.target.value)})}>
            {DURATIONS.map(m => <option key={m} value={m}>{m} Menit</option>)}
          </select>
        </div>
        <div className="d-grid gap-2">
          <button type="submit" className="wrh-btn primary" disabled={!selectedSpot}>
            {selectedSpot ? `Booking Spot A-${selectedSpot}` : 'Pilih Spot Dulu'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
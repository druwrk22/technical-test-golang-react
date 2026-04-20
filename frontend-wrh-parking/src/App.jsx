import { useState, useEffect, useMemo } from 'react';
import ParkingMap from './components/ParkingMap';
import BookingForm from './components/BookingForm';
import BookingDetails from './components/BookingDetails';
import ConfirmModal from './components/ConfirmModal';
import HistoryList from './components/HistoryList'; 
import { SPOT_CONFIG } from './utils/constants';

const App = () => {
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('parkingBookings');
    return saved ? JSON.parse(saved) : [];
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('parkingHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedSpot, setSelectedSpot] = useState(null);
  const [activeView, setActiveView] = useState('map');
  
  const [modalState, setModalState] = useState({
    show: false,
    bookingId: null,
    spotId: null
  });

  useEffect(() => {
    localStorage.setItem('parkingBookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('parkingHistory', JSON.stringify(history));
  }, [history]);

  const spotsStatus = useMemo(() => {
    const status = {};
    SPOT_CONFIG.forEach(s => status[s.id] = { occupied: false });
    bookings.forEach(b => status[b.spotId] = { occupied: true });
    return status;
  }, [bookings]);

  const handleBooking = (formData) => {
    const newBooking = { id: Date.now(), spotId: selectedSpot, ...formData, startTime: Date.now() };
    setBookings(prev => [...prev, newBooking]);
  };

  const openCancelModal = (bookingId, spotId) => {
    setModalState({ show: true, bookingId, spotId });
  };

  const confirmCancel = () => {
    const bookingToCancel = bookings.find(b => b.id === modalState.bookingId);
    
    if (bookingToCancel) {
      const completedBooking = {
        ...bookingToCancel,
        endTime: Date.now() 
      };
      
      setHistory(prev => [completedBooking, ...prev]);
    }

    setBookings(prev => prev.filter(b => b.id !== modalState.bookingId));
    setModalState({ show: false, bookingId: null, spotId: null });
  };

  const closeModal = () => {
    setModalState({ show: false, bookingId: null, spotId: null });
  };

  return (
    <div className="container py-4">
      <header className="wrh-card mb-4 text-center">
        <h1 className="display-5 fw-bold mb-0"> <span style={{color:'#ffcc00'}}>WRH</span> PARKING</h1>
        <p className="mb-0 text-muted fw-semibold">Sistem Pengelolaan Parkir Truck Warehouse</p>
      </header>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
            <h4 className="fw-bold mb-0">Denah Parkir</h4>
            
            <div className="d-flex gap-2">
              <button 
                className={`btn btn-sm wrh-btn ${activeView === 'history' ? 'primary' : ''}`} 
                onClick={() => setActiveView(activeView === 'history' ? 'map' : 'history')}
              >
                History
              </button>
              
              <button 
                className={`btn btn-sm wrh-btn ${activeView === 'details' ? 'primary' : ''}`} 
                onClick={() => setActiveView(activeView === 'details' ? 'map' : 'details')}
              >
                 Detail Aktif
              </button>
            </div>
          </div>
          
          {activeView === 'map' && (
            <ParkingMap spots={spotsStatus} onSelectSpot={setSelectedSpot} selectedSpot={selectedSpot} />
          )}
          {activeView === 'details' && (
            <BookingDetails bookings={bookings} onEndSession={openCancelModal} />
          )}
          {activeView === 'history' && (
            <HistoryList history={history} />
          )}
        </div>

        <div className="col-lg-5">
          <BookingForm selectedSpot={selectedSpot} onSubmit={handleBooking} onClear={() => setSelectedSpot(null)} />
          
          <div className="mt-4 wrh-card bg-light">
            <h5 className="fw-bold">ℹ️ Panduan Warna</h5>
            <ul className="list-unstyled mb-0 d-flex flex-wrap gap-2">
              <li className="d-flex align-items-center gap-1"> <span className="badge badge-wrh bg-success text-dark">KOSONG</span></li>
              <li className="d-flex align-items-center gap-1">🔴 <span className="badge badge-wrh bg-danger text-dark">TERISI</span></li>
              <li className="d-flex align-items-center gap-1">🔵 <span className="badge badge-wrh bg-primary text-dark">DIPILIH</span></li>
            </ul>
          </div>
        </div>
      </div>

      <ConfirmModal 
        show={modalState.show}
        onClose={closeModal}
        onConfirm={confirmCancel}
        title=" Akhiri Parkir?"
        message={`Yakin ingin mengakhiri sesi parkir di spot A-${modalState.spotId}? Data akan dipindah ke riwayat.`}
        type="danger"
      />
    </div>
  );
};

export default App;
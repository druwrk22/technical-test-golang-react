const HistoryList = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="wrh-card text-center py-5">
        <h4 className="text-muted">📭 Belum ada riwayat parkir</h4>
        <p>Riwayat akan muncul setelah sesi parkir diakhiri.</p>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="wrh-card mt-4">
      <h3 className="mb-4 fw-bold">📜 Log Riwayat Parkir</h3>
      <div className="table-responsive">
        <table className="table table-bordered border-dark mb-0" style={{ borderCollapse: 'separate', borderSpacing: '0 10px' }}>
          <thead className="table-dark">
            <tr>
              <th className="border-0" style={{ borderTopLeftRadius: '0', borderBottomLeftRadius: '0' }}>Spot</th>
              <th className="border-0">Kendaraan</th>
              <th className="border-0">Waktu Masuk</th>
              <th className="border-0">Waktu Keluar</th>
              <th className="border-0">Durasi Asli</th>
              <th className="border-0" style={{ borderTopRightRadius: '0', borderBottomRightRadius: '0' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => {
              const durationMs = item.endTime - item.startTime;
              const usedMinutes = Math.round(durationMs / 1000 / 60);
              const isOvertime = usedMinutes > item.duration;

              return (
                <tr key={item.id} className="align-middle">
                  <td className="fw-bold">A-{item.spotId}</td>
                  <td className="fw-bold">{item.plate}</td>
                  <td>{formatDate(item.startTime)}</td>
                  <td>{formatDate(item.endTime)}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <span>{item.duration} mnt</span>
                      <i className="bi bi-arrow-right"></i>
                      <span className={isOvertime ? "text-danger fw-bold" : "text-success"}>
                        {usedMinutes} mnt
                      </span>
                    </div>
                  </td>
                  <td>
                    {isOvertime ? (
                      <span className="badge badge-wrh bg-danger text-dark">️ Overtime</span>
                    ) : (
                      <span className="badge badge-wrh bg-success text-dark">✅ Tepat Waktu</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryList;
import { useEffect, useState } from 'react';
import api from '../api/client';

const StaffDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [blood, setBlood] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: '' });

  useEffect(() => {
    const load = async () => {
      setStatus({ loading: true, error: '' });
      try {
        const [apptRes, bloodRes, medRes] = await Promise.all([
          api.get('/api/appointments'),
          api.get('/api/blood'),
          api.get('/api/medicines'),
        ]);
        setAppointments(apptRes.data.appointments || []);
        setBlood(bloodRes.data.stock || []);
        setMedicines(medRes.data.medicines || []);
        setStatus({ loading: false, error: '' });
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to load staff data';
        setStatus({ loading: false, error: message });
      }
    };
    load();
  }, []);

  return (
    <section>
      <h2>Staff Dashboard</h2>
      {status.loading ? <p>Loading...</p> : null}
      {status.error ? <p className="notice error">{status.error}</p> : null}
      <div className="grid">
        <div className="card">
          <h3>Appointments</h3>
          <p>Total: {appointments.length}</p>
        </div>
        <div className="card">
          <h3>Blood Stock</h3>
          <p>Groups: {blood.length}</p>
        </div>
        <div className="card">
          <h3>Medicines</h3>
          <p>Items: {medicines.length}</p>
        </div>
      </div>

      <div className="card">
        <h3>Recent Appointments</h3>
        {appointments.slice(0, 5).map((item) => (
          <div key={item._id} className="row">
            <div>{item.department}</div>
            <div>{new Date(item.appointmentDate).toLocaleDateString()} · {item.timeSlot}</div>
            <div>Status: {item.status}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StaffDashboard;

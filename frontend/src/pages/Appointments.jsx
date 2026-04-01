import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';

const statusOptions = ['pending', 'approved', 'rescheduled', 'cancelled', 'completed'];

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [hasProfile, setHasProfile] = useState(true);
  const [form, setForm] = useState({
    doctor: '',
    department: '',
    appointmentDate: '',
    timeSlot: '',
    reason: '',
  });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ appointmentDate: '', timeSlot: '', status: '', notes: '' });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const isPublic = user?.role === 'public';
  const isDoctor = user?.role === 'doctor';
  const isNurse = user?.role === 'nurse';
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      setStatus((s) => ({ ...s, loading: true, error: '', success: '' }));
      try {
        const [apptRes, docRes] = await Promise.all([
          api.get('/api/appointments'),
          api.get('/api/doctors'),
        ]);
        setAppointments(apptRes.data.appointments || []);
        setDoctors(docRes.data.doctors || []);
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to load appointments';
        setStatus({ loading: false, error: message, success: '' });
        return;
      }

      if (isPublic) {
        try {
          await api.get('/api/patients/me');
          setHasProfile(true);
        } catch (err) {
          if (err.response?.status === 404) {
            setHasProfile(false);
          }
        }
      }

      setStatus({ loading: false, error: '', success: '' });
    };
    load();
  }, [isPublic]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'doctor') {
      const selected = doctors.find((d) => d._id === value);
      setForm((prev) => ({
        ...prev,
        doctor: value,
        department: selected?.department || '',
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateBooking = () => {
    const errors = [];
    if (!form.doctor) errors.push('Doctor is required');
    if (!form.department) errors.push('Department is required');
    if (!form.appointmentDate) errors.push('Date is required');
    if (!form.timeSlot) errors.push('Time slot is required');
    return errors;
  };

  const validateEdit = () => {
    const errors = [];
    if (isDoctor || isAdmin) {
      if (!editForm.appointmentDate) errors.push('Date is required');
      if (!editForm.timeSlot) errors.push('Time slot is required');
    }
    if (!editForm.status) errors.push('Status is required');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateBooking();
    if (errors.length) {
      setStatus({ loading: false, error: errors.join('. '), success: '' });
      return;
    }
    setStatus({ loading: true, error: '', success: '' });
    try {
      const payload = {
        doctor: form.doctor,
        department: form.department,
        appointmentDate: form.appointmentDate,
        timeSlot: form.timeSlot,
        reason: form.reason,
      };
      const { data } = await api.post('/api/appointments', payload);
      setAppointments((prev) => [data.appointment, ...prev]);
      setStatus({ loading: false, error: '', success: 'Appointment booked.' });
      setForm({ doctor: '', department: '', appointmentDate: '', timeSlot: '', reason: '' });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to book appointment';
      setStatus({ loading: false, error: message, success: '' });
    }
  };

  const startEdit = (appt) => {
    setEditId(appt._id);
    setEditForm({
      appointmentDate: appt.appointmentDate?.slice(0, 10) || '',
      timeSlot: appt.timeSlot || '',
      status: appt.status || 'pending',
      notes: appt.notes || '',
    });
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const saveEdit = async (id) => {
    const errors = validateEdit();
    if (errors.length) {
      setStatus({ loading: false, error: errors.join('. '), success: '' });
      return;
    }
    setStatus({ loading: true, error: '', success: '' });
    try {
      const payload = {};
      if (isDoctor || isAdmin) {
        payload.appointmentDate = editForm.appointmentDate;
        payload.timeSlot = editForm.timeSlot;
        payload.status = editForm.status;
        payload.notes = editForm.notes;
      }
      if (isNurse) {
        payload.status = editForm.status;
        payload.notes = editForm.notes;
      }

      const { data } = await api.put(`/api/appointments/${id}`, payload);
      setAppointments((prev) => prev.map((a) => (a._id === id ? data.appointment : a)));
      setStatus({ loading: false, error: '', success: 'Appointment updated.' });
      setEditId(null);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update appointment';
      setStatus({ loading: false, error: message, success: '' });
    }
  };

  if (!localStorage.getItem('token')) {
    return (
      <section>
        <h2>Appointments</h2>
        <p className="notice">Please login to view your appointments.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Appointments</h2>
      {isPublic && !hasProfile ? (
        <p className="notice">Create your patient profile first to book appointments.</p>
      ) : null}

      {isPublic ? (
        <div className="card">
          <h3>Book Appointment</h3>
          {status.error ? <p className="notice error">{status.error}</p> : null}
          {status.success ? <p className="notice success">{status.success}</p> : null}
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Doctor
              <select name="doctor" value={form.doctor} onChange={handleChange} disabled={!hasProfile}>
                <option value="">Select doctor</option>
                {doctors.map((doc) => (
                  <option value={doc._id} key={doc._id}>
                    {doc.user?.name || 'Doctor'} ({doc.department})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Department
              <input name="department" type="text" value={form.department} onChange={handleChange} readOnly />
            </label>
            <label>
              Date
              <input name="appointmentDate" type="date" value={form.appointmentDate} onChange={handleChange} disabled={!hasProfile} />
            </label>
            <label>
              Time Slot
              <input name="timeSlot" type="text" placeholder="10:00 - 10:30" value={form.timeSlot} onChange={handleChange} disabled={!hasProfile} />
            </label>
            <label>
              Reason
              <input name="reason" type="text" value={form.reason} onChange={handleChange} disabled={!hasProfile} />
            </label>
            <button className="btn primary" type="submit" disabled={status.loading || !hasProfile}>
              {status.loading ? 'Booking...' : 'Book Appointment'}
            </button>
          </form>
        </div>
      ) : null}

      {status.loading ? <p>Loading...</p> : null}
      {status.error ? <p className="notice error">{status.error}</p> : null}

      <div className="grid">
        {appointments.map((item) => (
          <div className="card appointment-card" key={item._id}>
            <h3>{item.department}</h3>
            <p>{new Date(item.appointmentDate).toLocaleDateString()} · {item.timeSlot}</p>
            <p>Status: {item.status}</p>
            {(isDoctor || isNurse || isAdmin) ? (
              <div className="inline-actions">
                {editId === item._id ? (
                  <div className="form">
                    {(isDoctor || isAdmin) ? (
                      <>
                        <label>
                          Date
                          <input name="appointmentDate" type="date" value={editForm.appointmentDate} onChange={handleEditChange} />
                        </label>
                        <label>
                          Time Slot
                          <input name="timeSlot" type="text" value={editForm.timeSlot} onChange={handleEditChange} />
                        </label>
                      </>
                    ) : null}
                    <label>
                      Status
                      <select name="status" value={editForm.status} onChange={handleEditChange}>
                        {statusOptions.map((opt) => (
                          <option value={opt} key={opt}>{opt}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Notes
                      <input name="notes" type="text" value={editForm.notes} onChange={handleEditChange} />
                    </label>
                    <div className="inline-buttons">
                      <button className="btn primary" type="button" onClick={() => saveEdit(item._id)}>
                        Save
                      </button>
                      <button className="btn ghost" type="button" onClick={() => setEditId(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="btn ghost" type="button" onClick={() => startEdit(item)}>
                    Edit
                  </button>
                )}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Appointments;

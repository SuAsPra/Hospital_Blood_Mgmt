import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const appointmentStatuses = ['pending', 'approved', 'rescheduled', 'cancelled', 'completed'];
const orderStatuses = ['pending', 'paid', 'not_shipped', 'shipped', 'delivered', 'closed', 'cancelled'];

const formatDate = (value) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return '-';
  }
};

const formatAvailability = (slots = []) => {
  if (!slots.length) return 'Not set';
  return slots.map((slot) => `${slot.day.toUpperCase()} ${slot.startTime}-${slot.endTime}`).join(', ');
};

const csvToArray = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const humanizeStatus = (value) => value.replaceAll('_', ' ');

const AdminDashboard = () => {
  const [data, setData] = useState({
    doctors: [],
    patients: [],
    appointments: [],
    blood: [],
    orders: [],
  });
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  const [medicalForm, setMedicalForm] = useState({ allergies: '', conditions: '' });
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [appointmentForm, setAppointmentForm] = useState({
    appointmentDate: '',
    timeSlot: '',
    status: 'pending',
    notes: '',
  });
  const [orderDrafts, setOrderDrafts] = useState({});
  const [bloodReduceDraft, setBloodReduceDraft] = useState({});
  const [status, setStatus] = useState({ loading: true, error: '', success: '' });

  const loadDashboard = async (showLoader = true) => {
    if (showLoader) {
      setStatus({ loading: true, error: '', success: '' });
    } else {
      setStatus((prev) => ({ ...prev, error: '' }));
    }

    try {
      const [docs, patients, appointments, blood, orders] = await Promise.all([
        api.get('/api/admin/doctors'),
        api.get('/api/admin/patients'),
        api.get('/api/admin/appointments'),
        api.get('/api/admin/blood'),
        api.get('/api/admin/orders'),
      ]);

      setData({
        doctors: docs.data.doctors || [],
        patients: patients.data.patients || [],
        appointments: appointments.data.appointments || [],
        blood: blood.data.blood || [],
        orders: orders.data.orders || [],
      });
      setStatus((prev) => ({ ...prev, loading: false, error: '' }));
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load admin dashboard';
      setStatus({ loading: false, error: message, success: '' });
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const totals = useMemo(
    () => ({
      doctors: data.doctors.length,
      patients: data.patients.length,
      appointments: data.appointments.length,
      orders: data.orders.length,
      bloodGroups: data.blood.length,
    }),
    [data]
  );

  const fetchDoctorProfile = async (doctorId) => {
    setStatus((prev) => ({ ...prev, loading: false, error: '', success: '' }));
    try {
      const { data: payload } = await api.get(`/api/admin/doctors/${doctorId}`);
      setDoctorProfile(payload.doctor || null);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch doctor profile';
      setStatus((prev) => ({ ...prev, error: message }));
    }
  };

  const openPatientEditor = (patient) => {
    setEditingPatient(patient);
    setMedicalForm({
      allergies: (patient.medicalHistory?.allergies || []).join(', '),
      conditions: (patient.medicalHistory?.conditions || []).join(', '),
    });
  };

  const savePatientMedicalHistory = async () => {
    if (!editingPatient) return;
    setStatus((prev) => ({ ...prev, error: '', success: '' }));
    try {
      await api.put(`/api/admin/patients/${editingPatient.id}/medical-history`, {
        allergies: csvToArray(medicalForm.allergies),
        conditions: csvToArray(medicalForm.conditions),
      });
      setEditingPatient(null);
      await loadDashboard(false);
      setStatus((prev) => ({ ...prev, success: 'Patient medical history updated.' }));
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update medical history';
      setStatus((prev) => ({ ...prev, error: message }));
    }
  };

  const openAppointmentEditor = (appointment) => {
    setEditingAppointment(appointment);
    setAppointmentForm({
      appointmentDate: appointment.date ? appointment.date.slice(0, 10) : '',
      timeSlot: appointment.timeSlot || '',
      status: appointment.status || 'pending',
      notes: appointment.notes || '',
    });
  };

  const saveAppointment = async () => {
    if (!editingAppointment) return;
    setStatus((prev) => ({ ...prev, error: '', success: '' }));
    try {
      await api.put(`/api/admin/appointments/${editingAppointment.id}`, appointmentForm);
      setEditingAppointment(null);
      await loadDashboard(false);
      setStatus((prev) => ({ ...prev, success: 'Appointment updated.' }));
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update appointment';
      setStatus((prev) => ({ ...prev, error: message }));
    }
  };

  const updateOrderStatus = async (orderId, currentStatus) => {
    const nextStatus = orderDrafts[orderId] || currentStatus;
    setStatus((prev) => ({ ...prev, error: '', success: '' }));
    try {
      await api.put(`/api/admin/orders/${orderId}`, { status: nextStatus });
      await loadDashboard(false);
      setStatus((prev) => ({ ...prev, success: 'Order status updated.' }));
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update order status';
      setStatus((prev) => ({ ...prev, error: message }));
    }
  };

  const reduceBlood = async (bloodId) => {
    const units = Number(bloodReduceDraft[bloodId] || 0);
    if (units <= 0) {
      setStatus((prev) => ({ ...prev, error: 'Units must be greater than 0' }));
      return;
    }

    setStatus((prev) => ({ ...prev, error: '', success: '' }));
    try {
      await api.patch(`/api/admin/blood/${bloodId}/reduce`, { units });
      setBloodReduceDraft((prev) => ({ ...prev, [bloodId]: '' }));
      await loadDashboard(false);
      setStatus((prev) => ({ ...prev, success: 'Blood stock reduced.' }));
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reduce blood supply';
      setStatus((prev) => ({ ...prev, error: message }));
    }
  };

  const toggleBloodClose = async (bloodId, isClosed) => {
    setStatus((prev) => ({ ...prev, error: '', success: '' }));
    try {
      await api.patch(`/api/admin/blood/${bloodId}/close`, { isClosed: !isClosed });
      await loadDashboard(false);
      setStatus((prev) => ({
        ...prev,
        success: !isClosed ? 'Blood supply closed.' : 'Blood supply reopened.',
      }));
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update blood group state';
      setStatus((prev) => ({ ...prev, error: message }));
    }
  };

  return (
    <section className="admin-page">
      <h2>Admin Dashboard</h2>
      {status.loading ? <p>Loading dashboard...</p> : null}
      {status.error ? <p className="notice error">{status.error}</p> : null}
      {status.success ? <p className="notice success">{status.success}</p> : null}

      <div className="admin-kpis">
        <div className="card">
          <h3>Total Doctors</h3>
          <p>{totals.doctors}</p>
        </div>
        <div className="card">
          <h3>Total Patients</h3>
          <p>{totals.patients}</p>
        </div>
        <div className="card">
          <h3>Appointments</h3>
          <p>{totals.appointments}</p>
        </div>
        <div className="card">
          <h3>Orders</h3>
          <p>{totals.orders}</p>
        </div>
      </div>

      <div className="card">
        <h3>Doctors</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialization</th>
                <th>Availability</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.doctors.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.name || '-'}</td>
                  <td>{doc.specialization || '-'}</td>
                  <td>{formatAvailability(doc.availability || [])}</td>
                  <td>{doc.contact?.email || '-'} / {doc.contact?.phone || '-'}</td>
                  <td>
                    <button className="btn ghost" type="button" onClick={() => fetchDoctorProfile(doc.id)}>
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {doctorProfile ? (
        <div className="card">
          <div className="row">
            <h3>{doctorProfile.name || 'Doctor Profile'}</h3>
            <button className="btn ghost" type="button" onClick={() => setDoctorProfile(null)}>
              Close
            </button>
          </div>
          <p>Department: {doctorProfile.department || '-'}</p>
          <p>Specialization: {doctorProfile.specialization || '-'}</p>
          <p>Room: {doctorProfile.room || '-'}</p>
          <p>Experience: {doctorProfile.experienceYears ?? '-'} years</p>
          <p>Phone: {doctorProfile.phone || '-'}</p>
          <p>Email: {doctorProfile.email || '-'}</p>
          <p>Availability: {formatAvailability(doctorProfile.availability || [])}</p>
        </div>
      ) : null}

      <div className="card">
        <h3>Patients</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Blood Group</th>
                <th>Medical History</th>
                <th>Admission</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.patients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.name || '-'}</td>
                  <td>{patient.age ?? '-'}</td>
                  <td>{patient.gender || '-'}</td>
                  <td>{patient.bloodGroup || '-'}</td>
                  <td>
                    Allergies: {(patient.medicalHistory?.allergies || []).join(', ') || 'None'}
                    <br />
                    Conditions: {(patient.medicalHistory?.conditions || []).join(', ') || 'None'}
                  </td>
                  <td>{patient.admissionStatus || '-'}</td>
                  <td>
                    <button className="btn ghost" type="button" onClick={() => openPatientEditor(patient)}>
                      Edit History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingPatient ? (
        <div className="card">
          <h3>Edit Medical History: {editingPatient.name || 'Patient'}</h3>
          <div className="form">
            <label>
              Allergies (comma-separated)
              <input
                type="text"
                value={medicalForm.allergies}
                onChange={(e) => setMedicalForm((prev) => ({ ...prev, allergies: e.target.value }))}
              />
            </label>
            <label>
              Conditions (comma-separated)
              <input
                type="text"
                value={medicalForm.conditions}
                onChange={(e) => setMedicalForm((prev) => ({ ...prev, conditions: e.target.value }))}
              />
            </label>
            <div className="inline-buttons">
              <button className="btn primary" type="button" onClick={savePatientMedicalHistory}>
                Save
              </button>
              <button className="btn ghost" type="button" onClick={() => setEditingPatient(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="card">
        <h3>Appointments</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time Slot</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.patient || '-'}</td>
                  <td>{appointment.doctor || '-'}</td>
                  <td>{formatDate(appointment.date)}</td>
                  <td>{appointment.timeSlot || '-'}</td>
                  <td>{appointment.status || '-'}</td>
                  <td>
                    <button className="btn ghost" type="button" onClick={() => openAppointmentEditor(appointment)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingAppointment ? (
        <div className="card">
          <h3>Edit Appointment</h3>
          <div className="form">
            <label>
              Date
              <input
                type="date"
                value={appointmentForm.appointmentDate}
                onChange={(e) => setAppointmentForm((prev) => ({ ...prev, appointmentDate: e.target.value }))}
              />
            </label>
            <label>
              Time Slot
              <input
                type="text"
                value={appointmentForm.timeSlot}
                onChange={(e) => setAppointmentForm((prev) => ({ ...prev, timeSlot: e.target.value }))}
              />
            </label>
            <label>
              Status
              <select
                value={appointmentForm.status}
                onChange={(e) => setAppointmentForm((prev) => ({ ...prev, status: e.target.value }))}
              >
                {appointmentStatuses.map((item) => (
                  <option value={item} key={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Notes
              <input
                type="text"
                value={appointmentForm.notes}
                onChange={(e) => setAppointmentForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </label>
            <div className="inline-buttons">
              <button className="btn primary" type="button" onClick={saveAppointment}>
                Save
              </button>
              <button className="btn ghost" type="button" onClick={() => setEditingAppointment(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="card">
        <h3>Orders</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Patient</th>
                <th>Total</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((order) => (
                <tr key={order._id}>
                  <td>#{order._id.slice(-6)}</td>
                  <td>{order.user?.name || order.user?.email || '-'}</td>
                  <td>₹{order.total || 0}</td>
                  <td>{humanizeStatus(order.status || 'pending')}</td>
                  <td>
                    <div className="inline-buttons">
                      <select
                        value={orderDrafts[order._id] || order.status}
                        onChange={(e) =>
                          setOrderDrafts((prev) => ({ ...prev, [order._id]: e.target.value }))
                        }
                      >
                        {orderStatuses.map((statusValue) => (
                          <option value={statusValue} key={statusValue}>
                            {humanizeStatus(statusValue)}
                          </option>
                        ))}
                      </select>
                      <button
                        className="btn ghost"
                        type="button"
                        onClick={() => updateOrderStatus(order._id, order.status)}
                      >
                        Save
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>Blood Bank Status</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Blood Group</th>
                <th>Total</th>
                <th>Reserved</th>
                <th>Available</th>
                <th>Nearest Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.blood.map((item) => (
                <tr key={item.id}>
                  <td>{item.bloodGroup}</td>
                  <td>{item.totalUnits}</td>
                  <td>{item.reservedUnits}</td>
                  <td>{item.availableUnits}</td>
                  <td>{formatDate(item.nearestExpiry)}</td>
                  <td>{item.isClosed ? 'Closed' : 'Open'}</td>
                  <td>
                    <div className="inline-buttons">
                      <input
                        className="qty-input"
                        type="number"
                        min="1"
                        placeholder="Units"
                        value={bloodReduceDraft[item.id] || ''}
                        onChange={(e) =>
                          setBloodReduceDraft((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                      />
                      <button className="btn ghost" type="button" onClick={() => reduceBlood(item.id)}>
                        Reduce
                      </button>
                      <button
                        className="btn ghost"
                        type="button"
                        onClick={() => toggleBloodClose(item.id, item.isClosed)}
                      >
                        {item.isClosed ? 'Reopen' : 'Close'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;

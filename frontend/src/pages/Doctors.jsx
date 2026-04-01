import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';

const Doctors = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [doctors, setDoctors] = useState([]);
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [detailsLoadingId, setDetailsLoadingId] = useState('');
  const [status, setStatus] = useState({ loading: true, error: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/api/doctors');
        setDoctors(data.doctors || []);
        setStatus({ loading: false, error: '' });
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to load doctors';
        setStatus({ loading: false, error: message });
      }
    };
    load();
  }, []);

  const viewDoctorProfile = async (doctorId) => {
    if (!isAdmin) return;
    setDetailsLoadingId(doctorId);
    setStatus((prev) => ({ ...prev, error: '' }));
    try {
      const { data } = await api.get(`/api/admin/doctors/${doctorId}`);
      setDoctorDetails(data.doctor || null);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load doctor details';
      setStatus((prev) => ({ ...prev, error: message }));
    } finally {
      setDetailsLoadingId('');
    }
  };

  return (
    <section>
      <h2>Doctors</h2>
      {status.loading ? <p>Loading...</p> : null}
      {status.error ? <p className="notice error">{status.error}</p> : null}

      {isAdmin && doctorDetails ? (
        <div className="card">
          <div className="row">
            <h3>{doctorDetails.name || 'Doctor Profile'}</h3>
            <button className="btn ghost" type="button" onClick={() => setDoctorDetails(null)}>
              Close
            </button>
          </div>
          <p>Department: {doctorDetails.department || '-'}</p>
          <p>Specialization: {doctorDetails.specialization || '-'}</p>
          <p>Experience: {doctorDetails.experienceYears ?? '-'} years</p>
          <p>Room: {doctorDetails.room || '-'}</p>
          <p>Phone: {doctorDetails.phone || '-'}</p>
          <p>Email: {doctorDetails.email || '-'}</p>
          <p>
            Availability:{' '}
            {(doctorDetails.availability || [])
              .map((slot) => `${slot.day?.toUpperCase()} ${slot.startTime}-${slot.endTime}`)
              .join(', ') || 'Not set'}
          </p>
        </div>
      ) : null}

      <div className="grid">
        {doctors.map((doc) => (
          <div className="card" key={doc._id}>
            {doc.photoUrl ? <img className="card-image" src={doc.photoUrl} alt={doc.user?.name || 'Doctor'} /> : null}
            <h3>{doc.user?.name || 'Doctor'}</h3>
            <p>{doc.specialization} · {doc.department}</p>
            <p>{doc.isAvailable ? 'Available' : 'Unavailable'}</p>
            {isAdmin ? (
              <button
                className="btn ghost"
                type="button"
                onClick={() => viewDoctorProfile(doc._id)}
                disabled={detailsLoadingId === doc._id}
              >
                {detailsLoadingId === doc._id ? 'Loading...' : 'View Profile'}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Doctors;

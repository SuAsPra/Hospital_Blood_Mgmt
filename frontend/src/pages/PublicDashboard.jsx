import { useEffect, useState } from 'react';
import api from '../api/client';

const PublicDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    dateOfBirth: '',
    gender: 'male',
    bloodGroup: 'O+',
    address: '',
  });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/api/patients/me');
        setProfile(data.patient);
      } catch (err) {
        if (err.response?.status !== 404) {
          setStatus((prev) => ({ ...prev, error: 'Failed to load profile' }));
        }
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });
    try {
      const { data } = await api.post('/api/patients', form);
      setProfile(data.patient);
      setStatus({ loading: false, error: '', success: 'Profile created.' });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create profile';
      setStatus({ loading: false, error: message, success: '' });
    }
  };

  return (
    <section>
      <h2>Patient Dashboard</h2>
      {profile ? (
        <div className="card">
          <h3>My Profile</h3>
          <p>Blood Group: {profile.bloodGroup || '—'}</p>
          <p>Admission Status: {profile.admissionStatus}</p>
          <p>Allergies: {(profile.allergies || []).join(', ') || 'None'}</p>
          <p>Conditions: {(profile.conditions || []).join(', ') || 'None'}</p>
        </div>
      ) : (
        <div className="card">
          <h3>Create Patient Profile</h3>
          {status.error ? <p className="notice error">{status.error}</p> : null}
          {status.success ? <p className="notice success">{status.success}</p> : null}
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Date of Birth
              <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
            </label>
            <label>
              Gender
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              Blood Group
              <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </label>
            <label>
              Address
              <input name="address" type="text" value={form.address} onChange={handleChange} />
            </label>
            <button className="btn primary" type="submit" disabled={status.loading}>
              {status.loading ? 'Saving...' : 'Create Profile'}
            </button>
          </form>
        </div>
      )}
      <div className="grid">
        <div className="card"><h3>My Appointments</h3><p>View upcoming visits</p></div>
        <div className="card"><h3>My Orders</h3><p>Track medicine delivery</p></div>
        <div className="card"><h3>Medical Records</h3><p>Basic history and notes</p></div>
      </div>
    </section>
  );
};

export default PublicDashboard;

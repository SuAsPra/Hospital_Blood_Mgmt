import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';

const BloodStock = () => {
  const { user } = useAuth();
  const canRequest = user && (user.role === 'public' || user.role === 'doctor');
  const [stock, setStock] = useState([]);
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({
    type: 'donation',
    bloodGroup: 'O+',
    units: 1,
    urgency: 'medium',
    notes: '',
  });
  const [status, setStatus] = useState({ loading: true, error: '', success: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/api/blood');
        setStock(data.stock || []);
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to load blood stock';
        setStatus({ loading: false, error: message, success: '' });
        return;
      }

      if (canRequest) {
        try {
          const { data } = await api.get('/api/blood/requests/me');
          setRequests(data.requests || []);
        } catch (err) {
          // ignore
        }
      }

      setStatus({ loading: false, error: '', success: '' });
    };

    load();
  }, [canRequest]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });
    try {
      const payload = {
        type: form.type,
        bloodGroup: form.bloodGroup,
        units: Number(form.units),
        urgency: form.urgency,
        notes: form.notes,
      };
      const { data } = await api.post('/api/blood/requests', payload);
      setRequests((prev) => [data.request, ...prev]);
      setStatus({ loading: false, error: '', success: 'Submitted successfully.' });
      setForm((prev) => ({ ...prev, units: 1, notes: '' }));
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to submit request';
      setStatus({ loading: false, error: message, success: '' });
    }
  };

  return (
    <section>
      <h2>Blood Availability</h2>
      {status.loading ? <p>Loading...</p> : null}
      {status.error ? <p className="notice error">{status.error}</p> : null}
      {status.success ? <p className="notice success">{status.success}</p> : null}

      <div className="grid">
        {stock.map((item) => (
          <div className="card" key={item._id}>
            <strong>{item.bloodGroup}</strong>
            <p>Total: {item.totalUnits} units</p>
            <p>Available: {Math.max(0, (item.totalUnits || 0) - (item.reservedUnits || 0))} units</p>
            <p>{item.isClosed ? 'Temporarily Closed' : 'Open'}</p>
          </div>
        ))}
      </div>

      {canRequest ? (
        <div className="card">
          <h3>Blood Donation / Request</h3>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Type
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="donation">Donation</option>
                <option value="request">Request</option>
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
              Units
              <input name="units" type="number" min="1" value={form.units} onChange={handleChange} />
            </label>
            <label>
              Urgency
              <select name="urgency" value={form.urgency} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </label>
            <label>
              Notes
              <input name="notes" type="text" value={form.notes} onChange={handleChange} />
            </label>
            <button className="btn primary" type="submit" disabled={status.loading}>
              {status.loading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      ) : (
        <p className="notice">Login as patient or doctor to request/donate blood.</p>
      )}

      {canRequest ? (
        <div className="card">
          <h3>My Blood Requests</h3>
          {requests.length === 0 ? <p>No requests yet.</p> : null}
          {requests.map((req) => (
            <div className="row" key={req._id}>
              <div>{req.type.toUpperCase()}</div>
              <div>{req.bloodGroup} · {req.units} units</div>
              <div>Status: {req.status}</div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default BloodStock;

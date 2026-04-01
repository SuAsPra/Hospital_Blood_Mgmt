import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState({ loading: false, error: '' });

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password.trim()) {
      setStatus({ loading: false, error: 'Email and password are required' });
      return;
    }

    setStatus({ loading: true, error: '' });
    try {
      const { data } = await api.post('/api/admin/login', form);
      login(data.token);
      navigate('/admin');
    } catch (err) {
      const message = err.response?.data?.message || 'Admin login failed';
      setStatus({ loading: false, error: message });
    }
  };

  return (
    <section className="card auth-card">
      <h2>Admin Login</h2>
      {status.error ? <p className="notice error">{status.error}</p> : null}
      <form className="form" onSubmit={onSubmit}>
        <label>
          Admin Email
          <input
            name="email"
            type="email"
            placeholder="admin@medicare.com"
            value={form.email}
            onChange={onChange}
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            placeholder="********"
            value={form.password}
            onChange={onChange}
          />
        </label>
        <button className="btn primary" type="submit" disabled={status.loading}>
          {status.loading ? 'Signing in...' : 'Sign in as Admin'}
        </button>
      </form>
    </section>
  );
};

export default AdminLogin;

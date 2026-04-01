import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';

const DoctorLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const errors = [];
    if (!form.email.trim()) errors.push('Email is required');
    if (!form.password.trim()) errors.push('Password is required');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (errors.length) {
      setStatus({ loading: false, error: errors.join('. '), success: '' });
      return;
    }
    setStatus({ loading: true, error: '', success: '' });
    try {
      const { data } = await api.post('/api/auth/login', form);
      if (data.user?.role !== 'doctor') {
        setStatus({ loading: false, error: 'This login is only for doctors', success: '' });
        return;
      }
      login(data.token);
      setStatus({ loading: false, error: '', success: 'Logged in successfully.' });
      navigate('/appointments');
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setStatus({ loading: false, error: message, success: '' });
    }
  };

  return (
    <section className="card">
      <h2>Doctor Login</h2>
      {status.error ? <p className="notice error">{status.error}</p> : null}
      {status.success ? <p className="notice success">{status.success}</p> : null}
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Email
          <input name="email" type="email" placeholder="doctor@example.com" value={form.email} onChange={handleChange} />
        </label>
        <label>
          Password
          <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} />
        </label>
        <button className="btn primary" type="submit" disabled={status.loading}>
          {status.loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </section>
  );
};

export default DoctorLogin;

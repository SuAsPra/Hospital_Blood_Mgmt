import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'public',
    department: '',
    specialization: '',
    adminRegisterKey: '',
  });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const errors = [];
    if (!form.name.trim()) errors.push('Name is required');
    if (!form.email.trim()) errors.push('Email is required');
    if (!form.password.trim()) errors.push('Password is required');
    if (form.password && form.password.length < 6) errors.push('Password must be at least 6 characters');

    if (form.role === 'doctor') {
      if (!form.department.trim()) errors.push('Department is required for doctors');
      if (!form.specialization.trim()) errors.push('Specialization is required for doctors');
    }

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
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        department: form.role === 'doctor' ? form.department : undefined,
        specialization: form.role === 'doctor' ? form.specialization : undefined,
        adminRegisterKey: form.role === 'admin' ? form.adminRegisterKey : undefined,
      };

      const { data } = await api.post('/api/auth/register', payload);
      login(data.token);
      setStatus({ loading: false, error: '', success: 'Account created.' });

      if (form.role === 'admin') navigate('/admin');
      else if (form.role === 'doctor') navigate('/appointments');
      else navigate('/patient');
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setStatus({ loading: false, error: message, success: '' });
    }
  };

  return (
    <section className="card">
      <h2>Create Account</h2>
      {status.error ? <p className="notice error">{status.error}</p> : null}
      {status.success ? <p className="notice success">{status.success}</p> : null}
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Full name
          <input name="name" type="text" placeholder="John Doe" value={form.name} onChange={handleChange} />
        </label>
        <label>
          Email
          <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} />
        </label>
        <label>
          Password
          <input name="password" type="password" placeholder="********" value={form.password} onChange={handleChange} />
        </label>
        <label>
          Register as
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="public">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        {form.role === 'doctor' ? (
          <>
            <label>
              Department
              <input name="department" type="text" value={form.department} onChange={handleChange} />
            </label>
            <label>
              Specialization
              <input name="specialization" type="text" value={form.specialization} onChange={handleChange} />
            </label>
          </>
        ) : null}

        {form.role === 'admin' ? (
          <label>
            Admin Registration Key
            <input
              name="adminRegisterKey"
              type="password"
              placeholder="Enter admin invite key if required"
              value={form.adminRegisterKey}
              onChange={handleChange}
            />
          </label>
        ) : null}

        <button className="btn primary" type="submit" disabled={status.loading}>
          {status.loading ? 'Creating...' : 'Register'}
        </button>
      </form>
    </section>
  );
};

export default Register;

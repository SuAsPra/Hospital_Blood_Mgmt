import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Nav = () => {
  const { user, logout } = useAuth();

  return (
    <header className="nav">
      <div className="nav-brand">
        <img className="brand-logo" src="/hosplogo.jpg" alt="Medicare Hospital" />
        <span>Medicare Hospital</span>
      </div>
      <nav className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/doctors">Doctors</NavLink>
        <NavLink to="/appointments">Appointments</NavLink>
        <NavLink to="/medicines">Medicines</NavLink>
        <NavLink to="/blood">Blood Stock</NavLink>
        {user?.role === 'public' || user?.role === 'doctor' ? <NavLink to="/orders">Orders</NavLink> : null}
        {user?.role === 'admin' ? <NavLink to="/admin">Admin</NavLink> : null}
        {user?.role === 'public' ? <NavLink to="/patient">Patient</NavLink> : null}
        {!user ? <NavLink to="/admin-login">Admin Login</NavLink> : null}
        {!user ? <NavLink to="/doctor-login">Doctor Login</NavLink> : null}
        {user ? (
          <button className="btn ghost" type="button" onClick={logout}>Logout</button>
        ) : (
          <NavLink to="/login">Login</NavLink>
        )}
      </nav>
    </header>
  );
};

export default Nav;

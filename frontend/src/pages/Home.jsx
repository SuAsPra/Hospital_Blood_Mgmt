import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Home = () => {
  const { user } = useAuth();

  const quickCta = user
    ? user.role === 'admin'
      ? { label: 'Open Admin Dashboard', href: '/admin' }
      : user.role === 'doctor'
        ? { label: 'Manage Appointments', href: '/appointments' }
        : { label: 'Open Patient Dashboard', href: '/patient' }
    : { label: 'Create Account', href: '/register' };

  return (
    <section className="home home-theme">
      <div className="hero">
        <div>
          <p className="pill">Smart Hospital Platform</p>
          <h1>Medicare Hospital: Connected care for patients, doctors, and operations.</h1>
          <p className="hero-sub">
            Welcome to a unified system for appointments, blood bank workflows, pharmacy orders,
            and hospital management. Everything runs in one secure place with role-based access.
          </p>
          <div className="hero-actions">
            <Link className="btn primary" to={quickCta.href}>{quickCta.label}</Link>
            <Link className="btn ghost" to="/doctors">Find Doctors</Link>
            <Link className="btn ghost" to="/blood">Check Blood Stock</Link>
          </div>
          <div className="stats">
            <div className="stat">
              <strong>150+</strong>
              <span>Doctors & Specialists</span>
            </div>
            <div className="stat">
              <strong>30+</strong>
              <span>Departments</span>
            </div>
            <div className="stat">
              <strong>24/7</strong>
              <span>Emergency Care</span>
            </div>
            <div className="stat">
              <strong>10k+</strong>
              <span>Monthly Patients</span>
            </div>
          </div>
        </div>

        <div className="hero-card">
          <h3>What You Can Do</h3>
          <ul className="quick-list">
            <li>Book and manage appointments</li>
            <li>Track and request blood units</li>
            <li>Buy medicines and track order status</li>
            <li>Manage patient records and stock control</li>
          </ul>
          <div className="color-row">
            <div className="color-card green">
              <h4>Care First</h4>
              <p>Fast triage, secure records, and reliable follow-ups.</p>
            </div>
            <div className="color-card blue">
              <h4>Smart Flow</h4>
              <p>Real-time hospital modules connected by role.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">
          <h2>Inside Medicare Hospital</h2>
          <p>Modern infrastructure, specialist teams, and technology-enabled care pathways.</p>
        </div>
        <div className="carousel">
          <div className="carousel-track">
            <img src="https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&w=1000&q=80" alt="Hospital lobby" />
            <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80" alt="Clinical room" />
            <img src="https://images.unsplash.com/photo-1512677859289-868722942457?auto=format&fit=crop&w=1000&q=80" alt="Diagnostics" />
            <img src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1000&q=80" alt="Lab" />
            <img src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1000&q=80" alt="Emergency" />
            <img src="https://images.unsplash.com/photo-1519494080410-f9aa76cb4283?auto=format&fit=crop&w=1000&q=80" alt="ICU" />
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">
          <h2>Core Capabilities</h2>
          <p>Designed for public patients, clinicians, blood bank teams, and hospital admins.</p>
        </div>
        <div className="card-grid">
          <div className="info-card accent-green">
            <h3>Patient Experience</h3>
            <p>Simple login, profile setup, appointment flow, and order tracking.</p>
          </div>
          <div className="info-card accent-blue">
            <h3>Doctor Workspace</h3>
            <p>Availability control, appointment updates, and medicine ordering.</p>
          </div>
          <div className="info-card accent-gray">
            <h3>Blood Bank Module</h3>
            <p>Group-wise stock, donation entries, request handling, expiry tracking.</p>
          </div>
          <div className="info-card accent-mix">
            <h3>Admin Control Center</h3>
            <p>Doctor profiles, patient history edits, blood supply controls, and order operations.</p>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-title">
          <h2>Why Medicare Hospital</h2>
          <p>We combine quality medical care with reliable digital operations.</p>
        </div>
        <div className="about-grid">
          <div className="about-card">
            <h3>Trusted Specialists</h3>
            <p>Multi-department experts for coordinated treatment plans.</p>
          </div>
          <div className="about-card">
            <h3>Smart Pharmacy</h3>
            <p>Medicine availability checks, stock visibility, and delivery status updates.</p>
          </div>
          <div className="about-card">
            <h3>Emergency Readiness</h3>
            <p>Critical care support with blood inventory visibility and requests.</p>
          </div>
          <div className="about-card">
            <h3>Data-Driven Admin</h3>
            <p>Operational visibility with secure role-based controls for hospital teams.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;

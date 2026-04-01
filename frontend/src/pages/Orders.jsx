import { useEffect, useState } from 'react';
import api from '../api/client';

const humanizeStatus = (status) => status?.replaceAll('_', ' ') || '-';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: '' });

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      setStatus({ loading: true, error: '' });
      try {
        const { data } = await api.get('/api/orders');
        setOrders(data.orders || []);
        setStatus({ loading: false, error: '' });
      } catch (err) {
        const message = err.response?.data?.message || 'Failed to load orders';
        setStatus({ loading: false, error: message });
      }
    };
    load();
  }, []);

  if (!localStorage.getItem('token')) {
    return (
      <section>
        <h2>Orders</h2>
        <p className="notice">Please login to view your orders.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Orders</h2>
      {status.loading ? <p>Loading...</p> : null}
      {status.error ? <p className="notice error">{status.error}</p> : null}
      <div className="grid">
        {orders.map((order) => (
          <div className="card" key={order._id}>
            <h3>Order #{order._id.slice(-6)}</h3>
            <p>Total: ₹{order.total}</p>
            <p>Status: {humanizeStatus(order.status)}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Orders;

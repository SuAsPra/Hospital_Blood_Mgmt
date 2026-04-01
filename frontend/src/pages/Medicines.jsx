import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';

const emptyMedicine = {
  name: '',
  brand: '',
  category: '',
  form: '',
  strength: '',
  price: '',
  stockQty: '',
  expiryDate: '',
  batchNo: '',
  imageUrl: '',
  availability: true,
  stockOver: false,
  prescriptionRequired: false,
};

const Medicines = () => {
  const { user } = useAuth();
  const isBuyer = user?.role === 'public' || user?.role === 'doctor';
  const isAdmin = user?.role === 'admin';

  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  const [newMedicine, setNewMedicine] = useState(emptyMedicine);
  const [status, setStatus] = useState({ loading: true, error: '', success: '' });

  const loadMedicines = async () => {
    try {
      const { data } = await api.get('/api/medicines');
      setMedicines(data.medicines || []);
      setStatus((prev) => ({ ...prev, loading: false, error: '' }));
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load medicines';
      setStatus({ loading: false, error: message, success: '' });
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const cartItems = useMemo(() => {
    return cart.map((item) => {
      const med = medicines.find((m) => m._id === item.medicineId);
      return { ...item, med };
    });
  }, [cart, medicines]);

  const addToCart = (med) => {
    if (!isBuyer) return;
    if (med.stockOver || !med.availability || med.stockQty <= 0) return;

    setCart((prev) => {
      const existing = prev.find((c) => c.medicineId === med._id);
      if (existing) {
        return prev.map((c) =>
          c.medicineId === med._id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...prev, { medicineId: med._id, qty: 1 }];
    });
  };

  const removeFromCart = (medicineId) => {
    setCart((prev) => prev.filter((c) => c.medicineId !== medicineId));
  };

  const updateQty = (medicineId, qty) => {
    if (qty <= 0) return removeFromCart(medicineId);
    setCart((prev) => prev.map((c) => (c.medicineId === medicineId ? { ...c, qty } : c)));
  };

  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = item.med?.price || 0;
      return sum + price * item.qty;
    }, 0);
  }, [cartItems]);

  const buyNow = async () => {
    if (!cart.length) return;
    setStatus({ loading: true, error: '', success: '' });
    try {
      const payload = {
        items: cart.map((c) => ({ medicine: c.medicineId, qty: c.qty })),
      };
      await api.post('/api/orders', payload);
      setCart([]);
      await loadMedicines();
      setStatus({ loading: false, error: '', success: 'Order placed successfully.' });
    } catch (err) {
      const message = err.response?.data?.message || 'Order failed';
      setStatus({ loading: false, error: message, success: '' });
    }
  };

  const onMedicineFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewMedicine((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const addMedicine = async (e) => {
    e.preventDefault();
    setStatus((prev) => ({ ...prev, loading: true, error: '', success: '' }));
    try {
      const payload = {
        name: newMedicine.name,
        brand: newMedicine.brand || undefined,
        category: newMedicine.category || undefined,
        form: newMedicine.form || undefined,
        strength: newMedicine.strength || undefined,
        price: Number(newMedicine.price),
        stockQty: Number(newMedicine.stockQty),
        expiryDate: newMedicine.expiryDate || undefined,
        batchNo: newMedicine.batchNo || undefined,
        imageUrl: newMedicine.imageUrl || undefined,
        availability: !!newMedicine.availability,
        stockOver: !!newMedicine.stockOver,
        prescriptionRequired: !!newMedicine.prescriptionRequired,
      };

      const { data } = await api.post('/api/medicines', payload);
      setMedicines((prev) => [data.medicine, ...prev]);
      setNewMedicine(emptyMedicine);
      setStatus({ loading: false, error: '', success: 'Medicine added.' });
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add medicine';
      setStatus({ loading: false, error: message, success: '' });
    }
  };

  return (
    <section>
      <h2>Medicines</h2>
      <div className="center-logo">
        <img src="/pluslogo.png" alt="Pharmacy" />
      </div>
      {status.loading ? <p>Loading...</p> : null}
      {status.error ? <p className="notice error">{status.error}</p> : null}
      {status.success ? <p className="notice success">{status.success}</p> : null}

      {isAdmin ? (
        <div className="card">
          <h3>Add Medicine (Admin)</h3>
          <form className="form medicine-admin-form" onSubmit={addMedicine}>
            <input name="name" placeholder="Name" value={newMedicine.name} onChange={onMedicineFieldChange} />
            <input name="brand" placeholder="Brand" value={newMedicine.brand} onChange={onMedicineFieldChange} />
            <input name="category" placeholder="Category" value={newMedicine.category} onChange={onMedicineFieldChange} />
            <input name="form" placeholder="Form" value={newMedicine.form} onChange={onMedicineFieldChange} />
            <input name="strength" placeholder="Strength" value={newMedicine.strength} onChange={onMedicineFieldChange} />
            <input name="price" type="number" min="0" placeholder="Price" value={newMedicine.price} onChange={onMedicineFieldChange} />
            <input name="stockQty" type="number" min="0" placeholder="Stock Qty" value={newMedicine.stockQty} onChange={onMedicineFieldChange} />
            <input name="expiryDate" type="date" value={newMedicine.expiryDate} onChange={onMedicineFieldChange} />
            <input name="batchNo" placeholder="Batch No" value={newMedicine.batchNo} onChange={onMedicineFieldChange} />
            <input name="imageUrl" placeholder="Image URL" value={newMedicine.imageUrl} onChange={onMedicineFieldChange} />

            <label className="checkbox-line">
              <input name="availability" type="checkbox" checked={newMedicine.availability} onChange={onMedicineFieldChange} />
              Available for sale
            </label>
            <label className="checkbox-line">
              <input name="stockOver" type="checkbox" checked={newMedicine.stockOver} onChange={onMedicineFieldChange} />
              Mark as stock over
            </label>
            <label className="checkbox-line">
              <input name="prescriptionRequired" type="checkbox" checked={newMedicine.prescriptionRequired} onChange={onMedicineFieldChange} />
              Prescription required
            </label>

            <button className="btn primary" type="submit" disabled={status.loading}>
              {status.loading ? 'Saving...' : 'Add Medicine'}
            </button>
          </form>
        </div>
      ) : null}

      <div className="grid">
        {medicines.map((med) => {
          const stockOver = med.stockOver || med.stockQty <= 0;
          const canBuy = isBuyer && med.availability && !stockOver;

          return (
            <div className="card" key={med._id}>
              {med.imageUrl ? <img className="card-image" src={med.imageUrl} alt={med.name} /> : null}
              <h3>{med.name}</h3>
              <p>Stock: {med.stockQty} · ₹{med.price}</p>
              <p>{stockOver ? 'Stock Over' : med.availability ? 'Available' : 'Unavailable'}</p>
              {isBuyer ? (
                <button
                  className="btn ghost"
                  type="button"
                  onClick={() => addToCart(med)}
                  disabled={!canBuy}
                >
                  Add to Cart
                </button>
              ) : (
                <button className="btn ghost" type="button" disabled>
                  View Only
                </button>
              )}
            </div>
          );
        })}
      </div>

      {isBuyer ? (
        <div className="card">
          <h3>Cart</h3>
          {cartItems.length === 0 ? <p>No items in cart.</p> : null}
          {cartItems.map((item) => (
            <div className="row" key={item.medicineId}>
              <div>{item.med?.name || 'Medicine'}</div>
              <div>
                <input
                  className="qty-input"
                  type="number"
                  min="1"
                  value={item.qty}
                  onChange={(e) => updateQty(item.medicineId, Number(e.target.value))}
                />
              </div>
              <div>₹{(item.med?.price || 0) * item.qty}</div>
              <button className="btn ghost" type="button" onClick={() => removeFromCart(item.medicineId)}>
                Remove
              </button>
            </div>
          ))}
          {cartItems.length > 0 ? (
            <div className="cart-footer">
              <strong>Total: ₹{total}</strong>
              <button className="btn primary" type="button" onClick={buyNow} disabled={status.loading}>
                {status.loading ? 'Processing...' : 'Buy'}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};

export default Medicines;

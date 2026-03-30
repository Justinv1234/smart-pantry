import { useState, useEffect, lazy, Suspense } from "react";
import {
  getPantryItems,
  addPantryItem,
  deletePantryItem,
  getExpiringItems,
} from "../api/client";

const BarcodeScanner = lazy(() => import("../components/BarcodeScanner"));

const CATEGORIES = [
  "produce", "dairy", "meat", "grains", "frozen",
  "canned", "snacks", "beverages", "condiments", "other",
];

const empty = { name: "", quantity: 1, unit: "", category: "other", expirationDate: "" };

export default function PantryPage() {
  const [items, setItems] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const [all, exp] = await Promise.all([getPantryItems(), getExpiringItems()]);
      setItems(all);
      setExpiring(exp);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await addPantryItem(form);
      setForm(empty);
      setShowForm(false);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePantryItem(id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const statusBadge = (item) => {
    const s = item.expirationStatus;
    if (s === "expired") return <span className="badge expired">Expired</span>;
    if (s === "expiring-soon") return <span className="badge expiring">Expiring Soon</span>;
    return <span className="badge fresh">Fresh</span>;
  };

  if (loading) return <p className="loading">Loading pantry...</p>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Pantry Dashboard</h2>
        <div className="header-actions">
          <button className="btn-sm" onClick={() => setScanning(true)}>Scan</button>
          <button className="btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add"}
          </button>
        </div>
      </div>

      {expiring.length > 0 && (
        <div className="alert">
          <strong>Heads up!</strong> {expiring.length} item(s) expiring within 3 days.
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {scanning && (
        <Suspense fallback={<p className="loading">Loading scanner...</p>}>
          <BarcodeScanner
            onResult={({ name, category, unit, quantity }) => {
              setForm({ ...form, name, category, unit, quantity: quantity || 1 });
              setScanning(false);
              setShowForm(true);
            }}
            onClose={() => setScanning(false)}
          />
        </Suspense>
      )}

      {/* Mobile form (stacked, toggled) */}
      {showForm && (
        <div className="mobile-form" >
          <form onSubmit={handleSubmit} style={{ display: "contents" }}>
            <input
              placeholder="Item name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <div className="form-pair">
              <input
                type="number"
                placeholder="Qty"
                min="0"
                step="any"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: +e.target.value })}
                required
              />
              <input
                placeholder="Unit (lb, cup...)"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                required
              />
            </div>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="date"
              value={form.expirationDate}
              onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
              required
            />
            <button type="submit" className="btn-full">Add to Pantry</button>
          </form>
        </div>
      )}

      {/* Desktop form (horizontal row, always visible) */}
      <form className="form-row" onSubmit={handleSubmit}>
        <input
          placeholder="Item name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Qty"
          min="0"
          step="any"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: +e.target.value })}
          required
        />
        <input
          placeholder="Unit (e.g. lb, cup)"
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
          required
        />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          type="date"
          value={form.expirationDate}
          onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
          required
        />
        <button type="submit">Add</button>
        <button type="button" onClick={() => setScanning(true)}>Scan Barcode</button>
      </form>

      {items.length === 0 ? (
        <p className="empty">Your pantry is empty. Add some items above!</p>
      ) : (
        <>
          {/* Desktop table */}
          <table className="desktop-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Category</th>
                <th>Expires</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit}</td>
                  <td>{item.category}</td>
                  <td>{new Date(item.expirationDate).toLocaleDateString()}</td>
                  <td>{statusBadge(item)}</td>
                  <td>
                    <button className="btn-danger" onClick={() => handleDelete(item._id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <div className="mobile-cards">
            {items.map((item) => (
              <div key={item._id} className="item-card">
                <div className="item-top">
                  <div className="item-info">
                    <strong className="item-name">{item.name}</strong>
                    <span className="item-detail">
                      {item.quantity} {item.unit} &middot; {item.category}
                    </span>
                  </div>
                  {statusBadge(item)}
                </div>
                <div className="item-bottom">
                  <span className="item-date">
                    Expires {new Date(item.expirationDate).toLocaleDateString()}
                  </span>
                  <button className="btn-danger btn-sm" onClick={() => handleDelete(item._id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

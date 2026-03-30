import { useState, useEffect } from "react";
import {
  getGroceryList,
  addGroceryItem,
  deleteGroceryItem,
  clearGroceryList,
} from "../api/client";

const empty = { name: "", quantity: 1, unit: "" };

export default function GroceryPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      setItems(await getGroceryList());
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
      await addGroceryItem(form);
      setForm(empty);
      setShowForm(false);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGroceryItem(id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleClear = async () => {
    if (!confirm("Clear entire grocery list?")) return;
    try {
      await clearGroceryList();
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <p className="loading">Loading grocery list...</p>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Grocery List</h2>
        <div className="header-actions">
          {items.length > 0 && (
            <button className="btn-danger btn-sm" onClick={handleClear}>Clear All</button>
          )}
          <button className="btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add"}
          </button>
        </div>
        {/* Desktop clear button */}
        {items.length > 0 && (
          <button className="btn-danger desktop-only" onClick={handleClear}>Clear All</button>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      {/* Mobile form */}
      {showForm && (
        <div className="mobile-form">
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
            <button type="submit" className="btn-full">Add to List</button>
          </form>
        </div>
      )}

      {/* Desktop form */}
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
        <button type="submit">Add</button>
      </form>

      {items.length === 0 ? (
        <p className="empty">Your grocery list is empty.</p>
      ) : (
        <>
          {/* Desktop table */}
          <table className="desktop-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Source</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit}</td>
                  <td>{item.addedFromRecipe || "Manual"}</td>
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
                      {item.quantity} {item.unit}
                      {item.addedFromRecipe && ` \u00b7 from ${item.addedFromRecipe}`}
                    </span>
                  </div>
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

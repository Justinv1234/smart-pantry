import { useState, useEffect } from "react";
import {
  getRecipes,
  addRecipe,
  deleteRecipe,
  matchAllRecipes,
  generateGroceryFromRecipe,
  generateRecipeSuggestions,
  getPantryItems,
} from "../api/client";

const empty = { name: "", ingredients: "" };

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [matches, setMatches] = useState({});
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [savedIndexes, setSavedIndexes] = useState(new Set());
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const [recs, matchData] = await Promise.all([getRecipes(), matchAllRecipes()]);
      setRecipes(recs);
      const map = {};
      matchData.forEach((m) => { map[m.recipeId] = m; });
      setMatches(map);
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
      await addRecipe({
        name: form.name,
        ingredients: form.ingredients.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setForm(empty);
      setShowForm(false);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRecipe(id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleAddToGrocery = async (id) => {
    try {
      await generateGroceryFromRecipe(id);
      alert("Missing ingredients added to grocery list!");
    } catch (e) {
      setError(e.message);
    }
  };

  const handleAiSuggest = async () => {
    setAiLoading(true);
    setError("");
    setSuggestions([]);
    try {
      const pantry = await getPantryItems();
      const ingredientNames = pantry.map((i) => i.name);
      if (ingredientNames.length === 0) {
        setError("Add items to your pantry first to get AI suggestions.");
        return;
      }
      const data = await generateRecipeSuggestions(ingredientNames);
      setSuggestions(data.recipes || data);
      setSavedIndexes(new Set());
    } catch (e) {
      setError(e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveSuggestion = async (suggestion, index) => {
    try {
      await addRecipe({
        name: suggestion.name,
        ingredients: suggestion.ingredients,
      });
      setSavedIndexes((prev) => new Set(prev).add(index));
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <p className="loading">Loading recipes...</p>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Recipes</h2>
        <button className="btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {showForm && (
        <form className="mobile-form" onSubmit={handleSubmit}>
          <input
            placeholder="Recipe name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            placeholder="Ingredients (comma-separated)"
            value={form.ingredients}
            onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
            required
          />
          <button type="submit" className="btn-full">Save Recipe</button>
        </form>
      )}

      {/* Saved recipes */}
      <div className="section">
        <h3>Saved Recipes</h3>
        {recipes.length === 0 ? (
          <p className="empty">No saved recipes yet.</p>
        ) : (
          <div className="item-list">
            {recipes.map((r) => {
              const m = matches[r._id];
              return (
                <div key={r._id} className={`card ${m?.cookable ? "cookable" : ""}`}>
                  <div className="card-header">
                    <strong>{r.name}</strong>
                    {m?.cookable && <span className="badge fresh">Can Cook!</span>}
                  </div>
                  <p className="ingredients">{r.ingredients.join(", ")}</p>
                  {m && !m.cookable && (
                    <p className="missing">Missing: {m.missingIngredients.join(", ")}</p>
                  )}
                  <div className="card-actions">
                    {m && !m.cookable && (
                      <button className="btn-sm" onClick={() => handleAddToGrocery(r._id)}>
                        Add Missing to Grocery
                      </button>
                    )}
                    <button className="btn-danger btn-sm" onClick={() => handleDelete(r._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI suggestions */}
      <div className="section">
        <div className="page-header">
          <h3>AI Suggestions</h3>
          <button className="btn-sm" onClick={handleAiSuggest} disabled={aiLoading}>
            {aiLoading ? "Generating..." : "Suggest"}
          </button>
        </div>
        {suggestions.length > 0 && (
          <div className="item-list">
            {suggestions.map((s, i) => (
              <div key={i} className="card suggestion">
                <div className="card-header">
                  <strong>{s.name}</strong>
                </div>
                <p className="ingredients">
                  <strong>Ingredients:</strong> {s.ingredients.join(", ")}
                </p>
                <p className="instructions">{s.instructions}</p>
                {s.missingIngredients?.length > 0 && (
                  <p className="missing">Missing: {s.missingIngredients.join(", ")}</p>
                )}
                <div className="card-actions">
                  <button
                    className="btn-sm"
                    onClick={() => handleSaveSuggestion(s, i)}
                    disabled={savedIndexes.has(i)}
                  >
                    {savedIndexes.has(i) ? "Saved!" : "Save Recipe"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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

const QUICK_PREFS = [
  "Vegan",
  "Vegetarian",
  "Chicken only",
  "No dairy",
  "Gluten-free",
  "Low carb",
  "High protein",
  "Quick (under 30 min)",
];

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
  const [expandedRecipes, setExpandedRecipes] = useState(new Set());
  const [expandedSuggs, setExpandedSuggs] = useState(new Set());
  const [preferences, setPreferences] = useState("");
  const [activeChips, setActiveChips] = useState(new Set());

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

  const toggleRecipe = (id) => {
    setExpandedRecipes((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleChip = (chip) => {
    setActiveChips((prev) => {
      const next = new Set(prev);
      next.has(chip) ? next.delete(chip) : next.add(chip);
      return next;
    });
  };

  const toggleSugg = (i) => {
    setExpandedSuggs((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

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
    setExpandedSuggs(new Set());
    try {
      const pantry = await getPantryItems();
      const ingredientNames = pantry.map((i) => i.name);
      if (ingredientNames.length === 0) {
        setError("Add items to your pantry first to get AI suggestions.");
        return;
      }
      const combined = [
        ...Array.from(activeChips),
        preferences.trim(),
      ].filter(Boolean).join(", ");
      const data = await generateRecipeSuggestions(ingredientNames, combined);
      setSuggestions(data.recipes || data);
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
        instructions: suggestion.instructions || [],
        portions: suggestion.portions || "",
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
        <div className="header-actions">
          <button className="btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ Add"}
          </button>
        </div>
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
            placeholder="Ingredients (comma-separated, e.g. 2 cups flour, 1 tsp salt)"
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
              const open = expandedRecipes.has(r._id);
              return (
                <div key={r._id} className={`recipe-card ${m?.cookable ? "cookable" : ""}`}>
                  <div className="recipe-card-header">
                    <div className="recipe-title">
                      <strong>{r.name}</strong>
                      {r.portions && <span className="portions-badge">{r.portions}</span>}
                    </div>
                    <div className="recipe-meta">
                      {m?.cookable && <span className="badge fresh">Can Cook!</span>}
                      <button className="expand-btn" onClick={() => toggleRecipe(r._id)}>
                        {open ? "▲ Less" : "▼ Details"}
                      </button>
                    </div>
                  </div>

                  {open && (
                    <div className="recipe-body">
                      <div className="recipe-section">
                        <span className="recipe-label">Ingredients</span>
                        <ul className="ingredient-list">
                          {r.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                        </ul>
                      </div>
                      {r.instructions?.length > 0 && (
                        <div className="recipe-section">
                          <span className="recipe-label">Instructions</span>
                          <ol className="instructions-list">
                            {r.instructions.map((step, i) => <li key={i}>{step}</li>)}
                          </ol>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="recipe-footer">
                    {m && !m.cookable && (
                      <p className="recipe-missing">Missing: {m.missing.join(", ")}</p>
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
            {aiLoading ? "Generating..." : "✨ Suggest"}
          </button>
        </div>

        <div className="prefs-panel">
          <span className="recipe-label">Dietary preferences</span>
          <div className="chip-row">
            {QUICK_PREFS.map((chip) => (
              <button
                key={chip}
                type="button"
                className={`pref-chip ${activeChips.has(chip) ? "active" : ""}`}
                onClick={() => toggleChip(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
          <input
            className="prefs-input"
            placeholder="Or type your own (e.g. no nuts, Mediterranean style…)"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
          />
        </div>
        {aiLoading && (
          <p className="loading" style={{ padding: "24px", fontSize: "0.875rem" }}>
            Generating recipes from your pantry...
          </p>
        )}
        {suggestions.length > 0 && (
          <div className="item-list">
            {suggestions.map((s, i) => {
              const open = expandedSuggs.has(i);
              return (
                <div key={i} className="recipe-card suggestion">
                  <div className="recipe-card-header">
                    <div className="recipe-title">
                      <strong>{s.name}</strong>
                      {s.portions && <span className="portions-badge">{s.portions}</span>}
                    </div>
                    <div className="recipe-meta">
                      <button className="expand-btn" onClick={() => toggleSugg(i)}>
                        {open ? "▲ Less" : "▼ Details"}
                      </button>
                    </div>
                  </div>

                  {open && (
                    <div className="recipe-body">
                      <div className="recipe-section">
                        <span className="recipe-label">Ingredients</span>
                        <ul className="ingredient-list">
                          {s.ingredients.map((ing, j) => <li key={j}>{ing}</li>)}
                        </ul>
                      </div>
                      {s.instructions?.length > 0 && (
                        <div className="recipe-section">
                          <span className="recipe-label">Instructions</span>
                          <ol className="instructions-list">
                            {s.instructions.map((step, j) => <li key={j}>{step}</li>)}
                          </ol>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="recipe-footer">
                    {s.missingIngredients?.length > 0 && (
                      <p className="recipe-missing">Missing: {s.missingIngredients.join(", ")}</p>
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

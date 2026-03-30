const BASE_URL = "/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers,
    ...options,
  });

  if (res.status === 401 && token) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || err.message || "Request failed");
  }
  return res.json();
}

// Auth
export const login = (credentials) =>
  request("/auth/login", { method: "POST", body: JSON.stringify(credentials) });
export const register = (credentials) =>
  request("/auth/register", { method: "POST", body: JSON.stringify(credentials) });

// Pantry
export const getPantryItems = () => request("/pantry");
export const getExpiringItems = () => request("/pantry/expiring");
export const addPantryItem = (item) =>
  request("/pantry", { method: "POST", body: JSON.stringify(item) });
export const updatePantryItem = (id, item) =>
  request(`/pantry/${id}`, { method: "PUT", body: JSON.stringify(item) });
export const deletePantryItem = (id) =>
  request(`/pantry/${id}`, { method: "DELETE" });

// Grocery
export const getGroceryList = () => request("/grocery");
export const addGroceryItem = (item) =>
  request("/grocery", { method: "POST", body: JSON.stringify(item) });
export const generateGroceryFromRecipe = (recipeId) =>
  request(`/grocery/generate/${recipeId}`, { method: "POST" });
export const updateGroceryItem = (id, item) =>
  request(`/grocery/${id}`, { method: "PUT", body: JSON.stringify(item) });
export const deleteGroceryItem = (id) =>
  request(`/grocery/${id}`, { method: "DELETE" });
export const clearGroceryList = () =>
  request("/grocery", { method: "DELETE" });

// Recipes
export const getRecipes = () => request("/recipes");
export const matchRecipe = (id) => request(`/recipes/${id}/match`);
export const matchAllRecipes = () => request("/recipes/match/all");
export const addRecipe = (recipe) =>
  request("/recipes", { method: "POST", body: JSON.stringify(recipe) });
export const updateRecipe = (id, recipe) =>
  request(`/recipes/${id}`, { method: "PUT", body: JSON.stringify(recipe) });
export const deleteRecipe = (id) =>
  request(`/recipes/${id}`, { method: "DELETE" });

// AI
export const generateRecipeSuggestions = (ingredients) =>
  request("/ai/recipes", { method: "POST", body: JSON.stringify({ ingredients }) });

import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import NavBar from "./components/NavBar";
import PantryPage from "./pages/PantryPage";
import GroceryPage from "./pages/GroceryPage";
import RecipesPage from "./pages/RecipesPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import "./App.css";

function AppContent() {
  const { user } = useAuth();
  const [page, setPage] = useState("pantry");
  const [authPage, setAuthPage] = useState("login");

  if (!user) {
    return authPage === "login" ? (
      <LoginPage onSwitch={() => setAuthPage("register")} />
    ) : (
      <RegisterPage onSwitch={() => setAuthPage("login")} />
    );
  }

  return (
    <div className="app">
      <NavBar current={page} onNavigate={setPage} />
      <main className="main">
        {page === "pantry" && <PantryPage />}
        {page === "grocery" && <GroceryPage />}
        {page === "recipes" && <RecipesPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

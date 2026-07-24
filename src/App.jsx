import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ProgressProvider } from "./contexts/ProgressContext.jsx";
import { useAuth } from "./contexts/AuthContext.jsx";
import HomePage from "./pages/HomePage.jsx";
import SubmitPage from "./pages/SubmitPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import StatsPage from "./pages/StatsPage.jsx";

function AppRoutes() {
  const { user } = useAuth();
  return (
    <ProgressProvider user={user}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/submit" element={<SubmitPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </ProgressProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--surface)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: ".82rem",
            },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

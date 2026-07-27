import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ProgressProvider } from "./contexts/ProgressContext.jsx";
import { QuestionsProvider } from "./contexts/QuestionsContext.jsx";
import { useAuth } from "./contexts/AuthContext.jsx";
import HomePage from "./pages/HomePage.jsx";
import SubmitPage from "./pages/SubmitPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import StatsPage from "./pages/StatsPage.jsx";
import PathsPage from "./pages/PathsPage.jsx";
import PathDetailPage from "./pages/PathDetailPage.jsx";
import MockPage from "./pages/MockPage.jsx";

function AppRoutes() {
  const { user } = useAuth();
  return (
    <ProgressProvider user={user}>
      <QuestionsProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/paths" element={<PathsPage />} />
          <Route path="/paths/:company" element={<PathDetailPage />} />
          <Route path="/mock" element={<MockPage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </QuestionsProvider>
    </ProgressProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
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

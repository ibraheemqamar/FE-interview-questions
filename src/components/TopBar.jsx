import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { CAT_ORDER } from "../data/categories.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import AuthModal from "./AuthModal.jsx";

export default function TopBar({ allCards = [] }) {
  const { user, isAdmin, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <header className="topbar">
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="brand">
            <div className="brand-mark">
              <i></i><i></i><i></i><i></i>
            </div>
            <div>
              <h1>Frontend Interview Deck</h1>
              <p className="tagline">Fundamentals &mdash; and the follow-up they hit you with next.</p>
            </div>
          </div>
        </Link>

        <div className="topbar-right">
          <nav className="nav-links">
            <NavLink to="/" end className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              Deck
            </NavLink>
            <NavLink to="/stats" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              Stats
            </NavLink>
            <NavLink to="/submit" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              + Submit
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={({ isActive }) => "nav-link nav-link--admin" + (isActive ? " active" : "")}>
                Admin
              </NavLink>
            )}
          </nav>

          {user ? (
            <div className="user-menu-wrap">
              <button
                className="user-avatar-btn"
                onClick={() => setShowUserMenu((v) => !v)}
                title={user.email}
              >
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="user-avatar" />
                ) : (
                  <span className="user-avatar-fallback">
                    {(user.email?.[0] || "U").toUpperCase()}
                  </span>
                )}
              </button>
              {showUserMenu && (
                <div className="user-menu" onClick={() => setShowUserMenu(false)}>
                  <div className="user-menu-email">{user.email}</div>
                  <button className="user-menu-item" onClick={signOut}>Sign out</button>
                </div>
              )}
            </div>
          ) : (
            <button className="auth-btn" onClick={() => setShowAuth(true)}>
              Sign in
            </button>
          )}

          <div className="deckstat">
            <b>{allCards.length}</b> cards · <b>{CAT_ORDER.length}</b> topics
          </div>
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}

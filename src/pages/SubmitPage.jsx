import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { submitQuestion } from "../lib/questions.js";
import QuestionForm from "../components/QuestionForm.jsx";
import AuthModal from "../components/AuthModal.jsx";

export default function SubmitPage() {
  const { user } = useAuth();
  const [showAuth, setShowAuth]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  const handleSubmit = async (form) => {
    if (!form.q.trim() || !form.a.trim()) {
      toast.error("Question and answer are required.");
      return;
    }
    if (!supabase) {
      toast.error("Supabase is not configured yet. Ask the admin to set it up.");
      return;
    }

    setSubmitting(true);
    try {
      await submitQuestion(form, user);
      setSubmitted(true);
      toast.success("Question submitted! The admin will review it shortly.");
    } catch (err) {
      toast.error("Failed to submit: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="wrap page-wrap">
        <div className="success-state">
          <div className="success-icon">✓</div>
          <h2>Question submitted!</h2>
          <p>The admin will review your question and approve it if it meets the quality bar.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "20px" }}>
            <button className="chip active" onClick={() => setSubmitted(false)}>
              Submit another
            </button>
            <Link to="/" className="chip">← Back to deck</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap page-wrap">
      <div className="page-header">
        <Link to="/" className="back-link">← Back to deck</Link>
        <h1 className="page-title">Submit a Question</h1>
        <p className="page-sub">
          Contribute to the community deck. The admin reviews and approves every submission before it goes live.
        </p>
        {!user && (
          <div className="auth-notice">
            <span>Sign in to track your submissions.</span>
            <button className="auth-btn" onClick={() => setShowAuth(true)}>Sign in</button>
          </div>
        )}
      </div>

      <QuestionForm
        initial={{ name: user?.user_metadata?.full_name || user?.email || "", email: user?.email || "" }}
        onSubmit={handleSubmit}
        submitLabel="Submit for review"
        showSubmitter
        busy={submitting}
      />

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}

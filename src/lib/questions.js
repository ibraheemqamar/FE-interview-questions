import { apiFetch } from "./api.js";

// All question CRUD now goes through the Node/Express API (server/), which
// talks to Supabase with the service-role key and enforces validation +
// authorization. The browser never touches the questions table directly.

// Public: approved deck.
export function fetchApprovedQuestions() {
  return apiFetch("/questions");
}

// Admin: every question, any status.
export function fetchAllSubmissions() {
  return apiFetch("/admin/submissions");
}

// Public submission → pending, awaiting review.
export function submitQuestion(values, user) {
  return apiFetch("/questions", {
    method: "POST",
    body: {
      ...values,
      name: values.name || user?.user_metadata?.full_name || user?.email || "",
      email: values.email || user?.email || "",
    },
  });
}

// Admin creates a live (approved) question.
export function createQuestion(values) {
  return apiFetch("/admin/questions", { method: "POST", body: values });
}

// Admin edits an existing question.
export function updateQuestion(id, values) {
  return apiFetch(`/admin/questions/${id}`, { method: "PATCH", body: values });
}

// Admin approves / rejects a submission.
export function reviewQuestion(id, status, notes) {
  return apiFetch(`/admin/questions/${id}/review`, {
    method: "POST",
    body: { status, notes },
  });
}

// Admin deletes a question.
export function deleteQuestion(id) {
  return apiFetch(`/admin/questions/${id}`, { method: "DELETE" });
}

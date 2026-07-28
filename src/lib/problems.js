import { apiFetch } from "./api.js";

// Practice — coding problems. Same split as questions.js: all problem CRUD goes
// through the Node/Express API (server/), which holds the service-role key and
// enforces validation + authorization. The browser never touches the problems
// table directly.

// Public: approved problem list (cards/filters only — no code, no test cases).
export function fetchApprovedProblems() {
  return apiFetch("/problems");
}

// Public: single problem detail (prompt + starter + test cases, no solution).
export function fetchProblem(slug) {
  return apiFetch(`/problems/${encodeURIComponent(slug)}`);
}

// User: fetch the signed-in user's saved attempt for a problem (or null).
export function fetchAttempt(problemId) {
  return apiFetch(`/problems/${problemId}/attempts`);
}

// User: save/update the current code + status. Pass bumpAttempt on a real run.
export function saveAttempt(problemId, attempt) {
  return apiFetch(`/problems/${problemId}/attempts`, { method: "POST", body: attempt });
}

// User: reveal the solution (server gates this on solved/given_up status).
export function fetchSolution(problemId) {
  return apiFetch(`/problems/${problemId}/solution`);
}

// Admin: every problem, any status.
export function fetchAllProblems() {
  return apiFetch("/admin/problems");
}

// Admin creates a live (approved) problem.
export function createProblem(values) {
  return apiFetch("/admin/problems", { method: "POST", body: values });
}

// Admin edits an existing problem.
export function updateProblem(id, values) {
  return apiFetch(`/admin/problems/${id}`, { method: "PATCH", body: values });
}

// Admin approves / rejects a problem.
export function reviewProblem(id, status, notes) {
  return apiFetch(`/admin/problems/${id}/review`, {
    method: "POST",
    body: { status, notes },
  });
}

// Admin deletes a problem.
export function deleteProblem(id) {
  return apiFetch(`/admin/problems/${id}`, { method: "DELETE" });
}

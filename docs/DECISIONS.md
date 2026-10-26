# Architectural Decisions — QueueLess

## ADR-001: Synthetic queue data (not real-time)

**Decision:** Use a synthetic hourly demand baseline scaled per hospital rather than real hospital queue data.

**Rationale:** Real hospital queue APIs do not exist publicly in India. Fabricating exact numbers would be misleading. The synthetic approach is honest (clearly labeled), reproducible, and demonstrates the prediction concept.

**Trade-off:** Results do not reflect actual hospital conditions. Labeled throughout as "simulated demo data."

---

## ADR-002: Rule-based symptom routing (not ML/NLP)

**Decision:** Use a longest-phrase-first ordered list rather than a machine-learning NLP model.

**Rationale:** The problem scope (6–8 departments, ~30 symptoms) is well within rule-based capability. An ML model would add dependency complexity, training data requirements, and hallucination risk without meaningful benefit. Rules are fully explainable during a viva examination.

**Trade-off:** Does not handle paraphrasing or novel symptoms well. Falls back to General Medicine.

---

## ADR-003: Weighted linear scoring for recommendations

**Decision:** Score = 0.4 × wait + 0.3 × distance + 0.3 × cost. Fully transparent formula.

**Rationale:** A linear weighted sum is interpretable, debuggable, and defensible in an academic presentation. Non-linear or ML-based ranking would not add reliability with synthetic data.

**Trade-off:** Weights are heuristic. Real weights would require user research and A/B testing.

---

## ADR-004: Frontend authentication is prototype-only

**Decision:** Login/signup UI exists but does not integrate with a backend auth service.

**Rationale:** Proper authentication (JWT tokens, password hashing, protected routes, refresh logic) would require significant additional scope and was deprioritized in favor of the core navigation flow.

**Outstanding work:** Backend `/api/auth/register` and `/api/auth/login` endpoints using `passlib` for hashing and JWT for tokens.

---

## ADR-005: Single-branch monorepo

**Decision:** `frontend/` and `backend/` live in the same repository.

**Rationale:** Simplifies setup for a solo project. Reduces context switching.

**Trade-off:** In production, separate deployment pipelines per service are preferred.

---

## ADR-006: Tailwind CSS v4 with inline styles for hero

**Decision:** Use Tailwind CSS v4 for layout and spacing on data pages. Use inline styles for the dark cinematic hero to avoid conflicts with the light-mode design system.

**Rationale:** Tailwind v4 uses CSS `@theme` for token definition. The hero section requires a completely different color palette from data pages. Scoped inline styles give reliable isolation without complex class overrides.

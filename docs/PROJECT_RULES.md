# PROJECT RULES

## NON-NEGOTIABLE

- NO HARDCODED MEDICAL CONTENT
- ALL CONTENT MUST BE DYNAMIC
- KEEP MVP SMALL
- NO OVER-ENGINEERING

---

## FEATURE RULES

Only build what is in ROADMAP.md.

DO NOT add:
- notes
- flashcards
- AI features
- analytics
- authentication (yet)

---

## CODE RULES

- Each file must have ONE responsibility
- No large files (>300 lines ideally)
- No duplicate logic
- No premature abstraction

---

## UI RULES

- Mobile-first design
- Simple navigation
- No deep nesting
- Fast interactions

---

## DATA RULES

All content must come from:
- Firebase (for now)
- Future backend (later)

Never embed:
- case data
- quiz data
- videos/images directly in code

---

## PERFORMANCE RULES

- Lazy load data
- Avoid unnecessary re-renders
- Optimize images/videos later (not MVP)

## STRUCTURE RULE

- Frontend and backend MUST remain separate
- Frontend must NOT contain backend logic
- Backend must NOT contain UI logic
- All communication goes through services layer
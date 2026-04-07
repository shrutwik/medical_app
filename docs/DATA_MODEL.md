# DATA MODEL

## CORE STRUCTURE

System
- id
- name

Condition
- id
- systemId
- name

Case
- id
- conditionId
- title
- description

Sections (inside case)
- type (narrative | video | image | animation)
- content (dynamic)

Quiz (inside case)
- question
- options
- correctAnswer
- explanation

---

## FIRESTORE STRUCTURE

systems/
conditions/
cases/

---

## RULES

- No nested deep documents (keep flat)
- Use IDs to relate data
- Keep schema flexible (more content types later)

---

## FUTURE SUPPORT

Will support:
- multiple media types
- multiple cases per condition
- expanding curriculum
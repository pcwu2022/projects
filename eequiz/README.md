# EEQuiz

A small static frontend memory game to test how many NTUEE students and professors you remember.

- Place this folder on GitHub and enable GitHub Pages for the repository (or use the `gh-pages` branch).
 - The app loads `students_hashed.json` and `professors.json` from the same folder. `students.json` (the plain list) is not required and has been removed for privacy.

## Files
- `index.html` — main page
- `styles.css` — styling
- `app.js` — JavaScript game logic
- `students_hashed.json` and `professors.json` — data files (already present)
	- Note: `students_hashed.json` is a JSON array of SHA256 hex digests of normalized student names. If you previously had `students.json`, you can generate `students_hashed.json` locally using `hash_list.py` (keep the plain file private).

## Quick start (locally /preview)
You can preview with a simple static server. From the project folder run:

```bash
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

## Deploy to GitHub Pages
- Push this folder to a GitHub repo.
- In repository settings > Pages set the source to the branch/folder where these files live (e.g., `main`/`/root`).
- Visit the provided GitHub Pages URL.

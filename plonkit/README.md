# Plonkit — Country Guessing Game

This is a small web game that uses `plonkit_db.json` as its clues source. It's pure HTML/CSS/JS and can be hosted on GitHub Pages.

How to run locally:

1. Serve the folder over HTTP (browsers block `fetch` for local files). Example using Python 3:

```bash
cd /path/to/plonkit
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Notes:
- The UI fetches `plonkit_db.json` and picks 10 random countries with at least one clue.
- The per-game maximum score is 1500 (10 matches × 150 points).
- More clues and more time reduce the per-match score.

# A2 Practice Desk

Local study site for Cambridge A2 practice papers and the supplied Vietnamese reference paper.

## Run

From this directory:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000`. Do not open `index.html` directly because ES modules need an HTTP server.

The deployed Cambridge A2 sample files are in `materials/`. Additional local study files stay in the ignored `library/` directory and are never part of the public repository.

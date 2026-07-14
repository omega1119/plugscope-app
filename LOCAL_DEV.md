# Local Development (Python Static Server)

This site is a static HTML/CSS/JS site served from the repo root. The fastest way to preview locally is with Python's built-in HTTP server.

## Prerequisites
- macOS with Python 3 installed (`python3 --version`)
- Default shell: zsh

## Start the server
```zsh
cd "/Users/simonwhite/Documents/repos/plugscope-app"
python3 -m http.server 8080
```

## Open in the browser
- Visit: `http://localhost:8080/` (redirects to `/en/`)
- English landing: `http://localhost:8080/en/`
- Privacy policy: `http://localhost:8080/en/privacy.html`

## Stop the server
- Press `Ctrl+C` in the terminal.

## Troubleshooting
- Clear cache/hard refresh if assets look stale.
- If port 8080 is in use, pick another port:
```zsh
python3 -m http.server 9000
```

## Optional: Node http-server
```zsh
npm install -g http-server
cd "/Users/simonwhite/Documents/repos/plugscope-app"
http-server -p 8080
```

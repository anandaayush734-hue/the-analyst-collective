# The Analyst Collective

Daily research on industrials, investment banking, regulation, markets and global affairs.

**Current status:** the website frontend works, but all stories are clearly labelled demonstration content. Live news sources are not connected yet.

## Files

- `index.html`: the page shell (masthead and navigation).
- `css/styles.css`: the newspaper design, including dark mode and phone layout.
- `js/app.js`: displays the front page, sections, archive, search and filters, and article pages.
- `data/editions.json`: all articles, grouped by dated editions. To add a story, add an entry here.

## Preview on your computer

Double-click `index.html`. If the stories do not appear in some browsers, run a local server instead: open a terminal in this folder and type `python3 -m http.server 8000`, then visit http://localhost:8000.

## Publish on GitHub Pages

1. Upload all files and folders to a public GitHub repository, keeping the folder structure.
2. In the repository, go to Settings, then Pages. Choose "Deploy from a branch", select `main` and `/ (root)`, and save.
3. Your site will appear at `https://<your-username>.github.io/<repository-name>/` after a minute or two.

## Adding a new edition

Add a new object to the `editions` list in `data/editions.json` with a `date` and an `articles` list. Newest editions should appear first. Each article needs the fields shown in the existing demonstration entries.

## Next stages (not yet built)

Connecting RSS and official sources, automated story selection, AI summaries, scheduled daily saving of editions, and automated publishing. These will be added and tested one at a time.

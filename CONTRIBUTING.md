# Contributing to F3 Q Planner

First off — thanks for wanting to make this better for the PAX. Whether you're fixing a bug, adding a feature, or improving the docs, your contribution matters.

## Getting Started

1. Fork the repo
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/f3-q-planner.git`
3. Install dependencies: `npm install`
4. Create a `.env.local` file with your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your-key-here
   ```
5. Start the dev server: `npm run dev`

## Making Changes

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test locally with `npm run dev`
4. Build to check for errors: `npm run build`
5. Commit with a clear message
6. Push and open a PR

## Guidelines

- **Keep it simple** — this app is built for Qs, not developers
- **F3 terminology matters** — see CLAUDE.md for the glossary
- **No secrets in code** — API keys go in environment variables
- **Inline styles** — the app uses CSS-in-JS, not external stylesheets
- **Test on mobile** — many Qs will use this on their phones

## Reporting Issues

Open an issue on GitHub with:
- What you expected to happen
- What actually happened
- Screenshots if it's a UI issue
- Your browser/device info

## Questions?

Reach out to Button (F3 Alpha) or open a discussion on the repo.

Aye!

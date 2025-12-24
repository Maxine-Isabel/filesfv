# Quick Start Guide

## Installation & Setup

```bash
npm install
npm run build
```

## Running Tests

```bash
npm run test              # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run check:duplicates # Check for duplicate content
```

## Running the Extension

### In VS Code (Interactive)
1. Open workspace in VS Code
2. Press F5 to start Extension Development Host
3. Select code in editor to trigger sidebar

### Preview UI Only
```bash
npm run dev
# Opens http://localhost:5173 - webview UI preview
```

## Build & Package

```bash
npm run build    # Compile TypeScript and bundle
npm run package  # Create .vsix file for distribution
```

## Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run build` | Compile and bundle extension + webview |
| `npm run dev` | Start Vite dev server for UI preview |
| `npm run test` | Run Jest unit tests |
| `npm run test:coverage` | Generate coverage report |
| `npm run check:duplicates` | Scan for duplicate content |
| `npm run lint` | Run ESLint |
| `npm run package` | Create .vsix extension file |

## Project Structure

- `src/extension.ts` - Extension entry point
- `src/stateMachine.ts` - Core state machine logic
- `src/webview/` - React UI components
- `src/data/` - Mock context database
- `src/__tests__/` - Jest unit tests
- `dist/` - Built artifacts

## Test Data Format

Add context nuggets to `src/data/contextDatabase.json`:

```json
{
  "id": "unique-id",
  "source": "Teams|SharePoint|GitHub PR|GitHub Issue",
  "title": "Title",
  "content": "Full context text",
  "keywords": ["keyword1", "keyword2"],
  "timestamp": "2025-12-24T12:00:00Z",
  "author": "Name",
  "relevanceScore": 0.85,
  "url": "https://..."
}
```

## Documentation

- [README.md](README.md) - Project overview
- [ARCHITECTURE.md](ARCHITECTURE.md) - Design and architecture
- [TESTING.md](TESTING.md) - Testing strategy

## Troubleshooting

**Build warnings about externalized modules:** This is expected. The extension uses Node APIs (`fs`, `path`) while the webview runs in a browser context. The build correctly separates them.

**Tests failing:** Ensure you ran `npm install` and have Node 20+ installed.

**Extension not loading in VS Code:** Check `View → Output → Context Bridge` for error logs.

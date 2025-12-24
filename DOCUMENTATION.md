# Documentation Index

## Core Documentation

**[README.md](README.md)** - Start here
- Project overview
- Problem and solution
- Features and architecture
- Quick commands

**[QUICK_START.md](QUICK_START.md)** - Get up and running
- Installation
- Running tests
- Running the extension
- Available scripts

**[TESTING_QUICKSTART.md](TESTING_QUICKSTART.md)** - Testing guide
- What's been fixed
- How to run tests
- Test coverage overview
- Test data format

**[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical design
- State machine design
- Module structure
- Data flow
- Component descriptions

## Development Guide

### Building

```bash
npm install      # Install dependencies
npm run build    # Compile TypeScript and bundle
npm run dev      # Start Vite dev server (preview UI)
```

### Testing

```bash
npm run test              # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run check:duplicates # Check for duplicate content
```

### Packaging & Distribution

```bash
npm run package  # Create .vsix extension file
```

## Project Structure

```
src/
  extension.ts           Entry point - registers extension
  stateMachine.ts        Core state machine (Idle → Trigger → Retrieval → Display)
  types.ts               Type definitions
  data/
    contextDatabase.json Mock context data (6 entries)
  webview/
    provider.ts          Webview provider (lifecycle, messaging)
    main.tsx             React app entry
    index.html           Webview HTML
    ui/
      Sidebar.tsx        UI components
      Sidebar.css        Styles

scripts/
  check_duplicates.cjs   Content deduplication check

dist/
  extension.js           Compiled extension (15.67 KB)
  webview.js             Compiled React UI (1.23 MB)
  style.css              Compiled styles (6.73 KB)
```

## Test Coverage

12 unit tests covering:
- State machine transitions
- Intent metadata extraction
- Semantic ranking (keyword + recency)
- Scoring algorithm accuracy
- Context map generation
- Session caching
- State history tracking

Run with: `npm run test`

## Key Concepts

### State Machine

The extension uses a 4-state FSM:

1. **State_Idle** - Ready for user input
2. **State_Trigger** - Extract metadata from code selection
3. **State_Retrieval** - Rank context nuggets semantically
4. **State_Display** - Render results in sidebar

### Semantic Ranking

Context nuggets are ranked using:
- Keyword match density (70% weight)
- Recency scoring (30% weight, prioritizes last 6 months)
- Returns top 3 results

### Performance

Current (mock data):
- Selection detection: < 10ms
- Metadata extraction: < 5ms
- Semantic ranking: < 50ms
- Sidebar render: < 100ms
- Total MTTC: < 200ms

## Common Tasks

### Add a Context Nugget

Edit `src/data/contextDatabase.json` and add:

```json
{
  "id": "unique-id",
  "source": "Teams|SharePoint|GitHub PR|GitHub Issue",
  "title": "Title",
  "content": "Full context text",
  "keywords": ["keyword1", "keyword2"],
  "timestamp": "2025-12-24T12:00:00Z",
  "author": "Author Name",
  "relevanceScore": 0.85,
  "url": "https://..."
}
```

### Run a Full Test Suite

```bash
npm run test
```

Expected output: 12/12 passing

### Build for Distribution

```bash
npm run build
npm run package
# Creates copilot-context-bridge-0.0.1.vsix (245 KB)
```

### Debug in VS Code

1. Open workspace in VS Code
2. Press F5 to start Extension Development Host
3. Select code in editor to trigger sidebar
4. Check Output → Context Bridge for logs

## Troubleshooting

**Build fails with module warnings**
- Expected: Node APIs (fs, path) are externalized for browser compatibility
- Solution: Already fixed in src/stateMachine.ts and src/webview/provider.ts

**Tests fail**
- Ensure Node 20+ is installed
- Run `npm install` to get all dependencies
- Check jest.config.js is in root directory

**Extension doesn't load in VS Code**
- Verify build succeeded: `npm run build`
- Check Extension Development Host console (Ctrl+Shift+J)
- Ensure VS Code version is 1.90+

**Sidebar not updating on selection**
- Verify selection listener is active in extension.ts
- Check provider.ts postMessage calls
- View logs in Output → Context Bridge panel

## Next Steps

1. **Live API Integration**: Add GitHub/Teams/SharePoint API calls
2. **Enhanced Ranking**: Implement embedding-based semantic search
3. **E2E Testing**: Add Cypress/Playwright tests
4. **CI/CD**: Add GitHub Actions workflow

See [ARCHITECTURE.md](ARCHITECTURE.md) for design details and planned enhancements.

## Status

- Build: Clean (zero warnings)
- Tests: 12/12 passing
- Code Quality: No critical duplicates detected
- Extension: Packaged and ready for distribution
- Documentation: Complete and organized

Last updated: December 24, 2025

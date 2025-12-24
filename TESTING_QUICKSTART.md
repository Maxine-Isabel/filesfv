# Quick Start & Testing Guide

## What's been fixed & automated

**Build Issues Resolved**
- Removed Node API imports (fs, path) from webview bundle
- Build clean with zero errors
- Dual-entry bundling working correctly

**Testing Added**
- Jest test suite: 12 tests passing for stateMachine.ts
  - Metadata extraction
  - Context retrieval ranking
  - Selection processing
  - State management and history
  - Context map generation
  - Scoring accuracy and ranking correctness

**Quality Checks Added**
- Duplicate detection: npm run check:duplicates
  - Scans for duplicate titles/threads
  - Detects duplicate URLs
  - Identifies similar content overlap
  - No critical duplicates found in current database


## How to Run Locally

Install and build:
```bash
npm install
npm run build
```

Run tests:
```bash
npm run test              # Run Jest tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

Quality checks:
```bash
npm run check:duplicates  # Check for duplicate content
npm run lint              # Run ESLint
```

Package extension:
```bash
npm run package           # Create .vsix file
```

Run in VS Code (full extension):
1. Open workspace in VS Code
2. Press F5 to start Extension Development Host
3. Select text in editor to trigger sidebar

## Project Status

| Component | Status |
|-----------|--------|
| Build | Clean - no warnings |
| Tests | 12/12 passing |
| Code Quality | No critical duplicates |
| Extension | Packaged (.vsix) |
| UI/Webview | Built and ready |

## Available npm Scripts

```
build             Compile and bundle
dev               Start Vite dev server
test              Run Jest tests
test:watch        Watch mode
test:coverage     Coverage report
check:duplicates  Duplicate detection
lint              Run ESLint
package           Create .vsix
```

## Testing Coverage

Unit tests cover:
- State machine transitions
- Metadata extraction accuracy
- Semantic ranking (keyword 70% + recency 30%)
- Scoring algorithm correctness
- Top-3 filtering and ordering
- Context map generation
- Session caching and state history

## Test Data Format

Add context nuggets to src/data/contextDatabase.json:

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

## Next Steps

1. **Live API Integration**: Add src/repoAnalyzer.ts for GitHub/Teams APIs
2. **E2E Testing**: Add Cypress/Playwright for full user flow
3. **CI/CD**: Add GitHub Actions workflow
4. **Analytics**: Track MTTC and user interactions

See [ARCHITECTURE.md](ARCHITECTURE.md) for design details.

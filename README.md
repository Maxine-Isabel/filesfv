# Copilot Context-Bridge: MVP

A **VS Code Extension** that solves developer context-switching friction. When you highlight code, it automatically surfaces the top 3 relevant "Context Nuggets" from Teams chats, GitHub discussions, and SharePoint docs—all in the VS Code sidebar.

**Goal**: Reduce Mean Time to Context (MTTC) from 5-10 minutes to < 30 seconds.

---

## The Problem (Atlassian 2025 Research)

Developers lose **6+ hours per week** to context switching:
- Searching Teams for architectural decisions
- Hunting SharePoint docs for auth patterns
- Scrolling GitHub PR comments for why a pattern was chosen

**Result**: Cognitive load, broken focus, and reduced productivity.

**Solution**: Proactive Context Surfacing in the IDE.

---

## MVP Features

✅ **Code Selection → Instant Context**
- Highlight code → sidebar populates with relevant nuggets (< 500ms)

✅ **Semantic Ranking**
- Keyword match density (70% weight)
- Recency filtering (30% weight, prioritize last 6 months)
- Returns top 3 results

✅ **Context Types Supported**
- 💬 Teams chats (thread summaries)
- 📄 SharePoint docs (sections)
- 🔀 GitHub PRs (discussion context)
- 🐛 GitHub Issues

✅ **Direct Source Links**
- One-click access to original Teams thread, GitHub issue, or SharePoint doc
- Link click is tracked for metrics

✅ **Accessibility**
- ✅ High Contrast mode support
- ✅ Keyboard navigation (Tab, Enter, Space)
- ✅ ARIA labels for screen readers
- ✅ Reduced motion support

✅ **MTTC Metrics**
- Logs retrieval time in Output panel
- Validates user link clicks for success measurement

---

## Architecture

### 4-State Finite State Machine

```
State_Idle
    ↓ (user highlights code)
State_Trigger (extract metadata)
    ↓
State_Retrieval (semantic ranking from mock database)
    ↓
State_Display (render nuggets in sidebar)
    ↓ (returns to idle after display)
State_Idle
```

**See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed state machine design.**

---

## Quick Start

### Build
```bash
npm install
npm run build
```

Output:
- `dist/extension.js` - Extension logic
- `dist/webview.js` - React UI
- `dist/style.css` - Styles

### Package (Optional - for local installation)
```bash
npm run package
# Creates Context-Bridge.vsix file
```

### Test
1. Highlight code like `"API"` or `"database"` or `"authentication"`
2. Check sidebar for context nuggets
3. Click "View Full Context →" to open source link
4. View metrics in: `View → Output → Context Bridge`

**See [TESTING.md](TESTING.md) for comprehensive test scenarios.**

---

## Project Structure

```
/src
├── extension.ts                 # Entry point - registers webview & events
├── stateMachine.ts             # State machine - core logic (4 states)
├── types.ts                     # TypeScript interfaces
│
├── data/
│   └── contextDatabase.json    # Mock data (Teams, GitHub, SharePoint)
│
└── webview/
    ├── provider.ts             # WebviewViewProvider - lifecycle & messaging
    ├── main.tsx                # React app entry
    ├── index.html              # Webview template
    └── ui/
        ├── Sidebar.tsx         # React components (nugget cards)
        └── Sidebar.css         # Accessibility-first styles

/dist
├── extension.js                # Compiled extension
├── webview.js                  # Compiled React UI
└── style.css                   # Compiled styles
```

---

## State Machine Deep Dive

### State_Trigger (1:1)
User highlights code → Extract metadata:
```typescript
{
  selectedText: "authentication",
  fileName: "/src/auth.ts",
  fileLanguage: "typescript",
  lineNumber: 45,
  timestamp: 1734552000000
}
```

### State_Retrieval (M:1 - Semantic Ranking)
Query mock database, rank by:
1. Keyword match density (70%)
2. Recency (last 6 months = 30%)

Return Top 3.

### State_Display (1:1)
Send to webview:
```typescript
{
  type: 'update-context',
  payload: {
    metadata: {...},
    nuggets: [ContextNugget[], ContextNugget[], ContextNugget[]],
    cachedAt: timestamp
  }
}
```

Webview renders nugget cards with:
- Source badge (Teams, SharePoint, GitHub)
- Content snippet
- Relevance score %
- Keywords
- "View Full Context →" button

---

## Mock Context Database

6 pre-populated examples in `src/data/contextDatabase.json`:

| ID | Source | Topic | Keywords |
|---|---|---|---|
| teams-001 | Teams | API Design | API, REST, GraphQL |
| teams-002 | Teams | Context Switching | context-switching, DevEx, metrics |
| sharepoint-001 | SharePoint | State Machine Design | state-machine, FSM, architecture |
| github-001 | GitHub PR | Semantic Ranking | ranking, relevance, filtering |
| sharepoint-002 | SharePoint | Webview Security | webview, security, postMessage |
| teams-003 | Teams | MTTC Metrics | MTTC, performance, KPI |

**Try highlighting these keywords in your code to test**

---

## Performance

### MTTC Benchmarks (Current - Mock Data)
- **Selection Detection**: < 10ms
- **Metadata Extraction**: < 5ms
- **Semantic Ranking**: < 50ms
- **Sidebar Render**: < 100ms
- **Total MTTC**: < 200ms ✅

### Production Targets (Live APIs - Phase 2)
- Target: < 30 seconds total
- Parallel API calls (Teams + GitHub simultaneously)
- Local caching for repeat selections

---

## Metrics & Observability

### Log Output (View → Output → Context Bridge)

```
[MTTC Metric] 142ms (Target: <30000ms)
[Validation] User clicked link: Teams (nugget-id-001)
[Metric] Context Nuggets Retrieved: 3
```

### Success Indicators
- ✅ MTTC < 30 seconds
- ✅ User clicks links (validation)
- ✅ No errors in extension console

---

## Portfolio / Resume Value

This MVP demonstrates:

**Technical Skills**
- VS Code Extension API (webview lifecycle, messaging protocol)
- React & TypeScript (type-safe UI components)
- State Machine pattern (finite state machine design)
- Semantic algorithms (keyword matching, ranking)

**Product Thinking**
- Solving a real problem (Atlassian 2025 DevEx report)
- Scoping MVP vs Production phases
- Metrics-driven success (MTTC, user validation)
- Accessibility-first design (WCAG 2.1)

**Engineering Practices**
- Clean architecture (separation of concerns)
- State management (Redux-like patterns)
- IPC communication (extension ↔ webview)
- Observability (logging, metrics)

---

## Roadmap

### Phase 1 (MVP - Complete ✅)
- [x] Mock context database
- [x] State machine (4 states)
- [x] Webview sidebar UI
- [x] Semantic ranking
- [x] MTTC metrics

### Phase 2 (Live APIs)
- [ ] Microsoft Graph API (Teams/SharePoint)
- [ ] GitHub REST API
- [ ] OAuth authentication flow
- [ ] Parallel API dispatch

### Phase 3 (Intelligence)
- [ ] LLM synthesis (Claude/GPT-4)
- [ ] Context nugget generation
- [ ] Automatic suggestions (no selection needed)

### Phase 4 (Persistence)
- [ ] SQLite context cache
- [ ] Session history
- [ ] Analytics dashboard

---

## Development

### Build Commands
```bash
npm run build     # Compile TypeScript + bundle with Vite
npm run dev       # Watch mode (for development)
npm run lint      # Run ESLint
npm run package   # Create .vsix extension package
```

### Debug Extension
1. Open extension dev host: `Run → Start Debugging` (F5 in VS Code)
2. Opens a new VS Code window with extension loaded
3. Check Output → Context Bridge for logs
4. Reload extension: `Ctrl+R` in the extension window

---

## Testing

See [TESTING.md](TESTING.md) for:
- Test scenarios (keyword retrieval, MTTC measurement, link validation)
- Accessibility testing (high contrast, keyboard nav)
- State machine flow verification
- Debugging tips

---

## Dependencies

- **VS Code API** (provided by extension)
- **React 18** (sidebar UI)
- **TypeScript** (type safety)
- **Vite** (bundler)
- **ESLint** (code quality)

No external API keys needed for MVP (uses mock data).

---

## Limitations (MVP)

- 🔴 No real API integration (Teams/GitHub/SharePoint)
- 🔴 No persistence (session-only cache)
- 🔴 Simple keyword matching (no ML/embeddings)
- 🔴 No LLM synthesis (pre-written snippets)

All addressed in Phase 2+.

---

## References

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Atlassian 2025 State of DevEx](https://www.atlassian.com/devex)
- [WCAG 2.1 Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## License

MIT - Student Portfolio Project

   ```

2. **Run in VS Code Extension Development Host:**
   - Open this folder in VS Code
   - Press `F5` to launch the Extension Development Host
   - This opens a new VS Code window with the extension loaded

3. **Test the extension:**
   - In the extension window, create or open a file
   - Highlight some code (e.g., "authentication", "database", "error")
   - The Context-Bridge sidebar should update with related information
   - Click "View Source" to open the link in your browser

### How It Works

1. **State_Trigger**: User highlights code or opens a file
2. **State_Retrieval**: Extension searches mock database for keyword matches
3. **State_Display**: Matched context nugget appears in sidebar with:
   - Source (Teams/GitHub/SharePoint)
   - Key insight snippet
   - Related keywords
   - Direct link to source
4. **State_Persistence**: Context remains visible while browsing

## Mock Data Examples

The extension includes sample context from:

- **Authentication**: JWT token strategy with Supabase
- **API Rate Limiting**: Redis-based sliding window implementation
- **Database Migrations**: Supabase schema migration guidelines
- **React State**: Context API + useReducer patterns
- **Error Handling**: AppError base class standards
- **Testing**: Unit test coverage and e2e requirements

Try highlighting these keywords in your code to see matching contexts:
- `auth` or `authentication`
- `rate limit` or `api`
- `migration` or `database`
- `react` or `state`
- `error` or `exception`
- `test` or `testing`

## Next Steps: Going Live

To integrate with **real data**, swap the mock database:

### 1. Microsoft Graph API (Teams & SharePoint)
```typescript
// In src/webview/provider.ts - Replace findContextByKeyword()
const response = await fetch('https://graph.microsoft.com/v1.0/me/messages', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 2. GitHub REST API
```typescript
// Add GitHub issue search
const response = await fetch('https://api.github.com/search/issues', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 3. Supabase Integration (Optional)
For session persistence, cache successful context lookups:
```typescript
const { data } = await supabase
  .from('context_cache')
  .insert({ keyword, context });
```

## Architecture Decisions

### Why Embedded Webview HTML?
- Avoids need for separate React build process
- Direct VS Code theming via CSS variables
- Simpler packaging for .vsix distribution

### Why Mock Data First?
- Resume-ready demo without external API setup
- Prove UX/logic before adding auth complexity
- Easy transition to live APIs later

### Why TypeScript + Vite?
- Industry standard for modern web development
- Fast compilation and bundling
- Full type safety for VS Code Extension API

## Performance Considerations

- **Selection listeners**: Debounced to 500ms to avoid excessive updates
- **Keyword matching**: O(n) scan of mock database (sufficient for MVP)
- **Future optimization**: Full-text search with Redis for large datasets

## Troubleshooting

**Extension doesn't load:**
- Verify build succeeded: `npm run build`
- Check console in Extension Development Host (Ctrl+Shift+J)
- Ensure VS Code version is 1.90+

**Sidebar not appearing:**
- Look in Activity Bar on left side
- Click "Context Bridge" icon if available
- Or run: "Context Bridge: Focus on Context Bridge View" (Cmd+Shift+P)

**Links not working:**
- Ensure VS Code has internet access
- Check console for JavaScript errors
- Verify mock URLs are correct

## Future Roadmap

- [ ] Live Microsoft Graph API integration
- [ ] GitHub API real-time issue tracking
- [ ] Semantic ranking with OpenAI embeddings
- [ ] Session persistence in Supabase
- [ ] Settings UI for API configuration
- [ ] Context history and bookmarking
- [ ] Team-level knowledge base sync

## License

MIT - Built as a student portfolio project

## Questions?

For implementation details, see the inline code comments or raise an issue.

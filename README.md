# Copilot Context-Bridge

A VS Code Extension that proactively surfaces relevant Teams conversations, GitHub discussions, and SharePoint documentation in the VS Code sidebar—reducing context switching and mean time to context (MTTC).

## The Problem We Solve

Industry research shows developers lose **6+ hours per week** to context switching, specifically hunting for technical decisions in Teams chats or documentation in SharePoint. Context-Bridge eliminates this friction by automatically surfacing relevant information **directly in your IDE**.

### Key Metrics We Target
- **MTTC (Mean Time to Context)**: < 30 seconds
- **Context Switching Frequency**: Reduce browser tab opens for information lookup
- **Developer Cognitive Load**: Proactive surfacing = no active search required

## Features (MVP)

✅ **Selection Detection**: Highlight code → Sidebar updates instantly
✅ **Mock Context Database**: Pre-populated with Teams, GitHub, and SharePoint examples
✅ **Direct Source Links**: One-click access to original Teams thread, GitHub issue, or SharePoint doc
✅ **Keyword Matching**: Smart filtering based on code context
✅ **VS Code Integration**: Native sidebar with VSCode theming support

## Project Structure

```
src/
├── extension.ts                 # Main extension entry point
├── webview/
│   └── provider.ts             # WebviewViewProvider + message passing
└── data/
    └── mockContext.ts          # Mock context database (Teams, GitHub, SharePoint)
```

## Getting Started

### Prerequisites
- Node.js 18+
- VS Code 1.90+
- npm or yarn

### Installation

```bash
npm install
```

### Development

1. **Build the extension:**
   ```bash
   npm run build
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

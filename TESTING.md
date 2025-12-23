# Copilot Context-Bridge - MVP Installation & Testing Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Extension
```bash
npm run build
```

This produces:
- `dist/extension.js` - VS Code Extension code
- `dist/webview.js` - React Sidebar UI code
- `dist/style.css` - Sidebar styles

### 3. Package Extension (Optional - for local testing)
```bash
npm run package
```

This creates a `.vsix` file that can be installed in VS Code.

---

## Testing the MVP

### Test Scenario 1: Keyword-Based Context Retrieval
1. Open any file in VS Code (e.g., a TypeScript or JavaScript file)
2. Highlight the word: `"API"` or `"database"` or `"authentication"`
3. **Expected Result**: Context Bridge sidebar populates with 1-3 nuggets
4. Check the relevance scores (should show 85-95%)

### Test Scenario 2: Validate MTTC Metric
1. Open VS Code Output panel: `View → Output`
2. Select "Context Bridge" from the dropdown
3. Highlight code in the editor
4. **Expected Result**: See log like:
   ```
   [MTTC Metric] 145ms (Target: <30000ms)
   ```
   - For mock data, this should be < 500ms
   - For live APIs (future), target is < 30 seconds

### Test Scenario 3: Link Validation
1. Highlight code to populate a nugget
2. Click "View Full Context →" button on a nugget card
3. **Expected Result**:
   - Link opens in external browser
   - VS Code Output shows:
     ```
     [Validation] User clicked link: Teams (nugget-id-xxxx)
     ```

### Test Scenario 4: Accessibility - High Contrast Mode
1. Enable high contrast in VS Code:
   - `Settings → Color Theme → Select High Contrast`
2. Highlight code to populate nuggets
3. **Expected Result**:
   - Sidebar colors adjust for high contrast
   - Text remains readable
   - Buttons have clear focus indicators

### Test Scenario 5: Accessibility - Keyboard Navigation
1. Open the sidebar by highlighting code
2. Press `Tab` to focus the first nugget card
3. Press `Tab` again to reach the "View Full Context" button
4. Press `Enter` to activate the button
5. **Expected Result**:
   - Keyboard navigation works smoothly
   - Focus indicators are visible
   - Link opens in browser

---

## Supported Keywords (Mock Data)

The mock database includes these keywords. Highlight them to test:

- **API**: REST, GraphQL, rate-limit, throttle
- **Architecture**: state-machine, FSM, design-pattern
- **Database**: migration, schema, SQL, Supabase
- **Security**: authentication, auth, JWT, token, OWASP
- **Context-Switching**: context, DevEx, productivity, metrics
- **React**: state, context, hooks, useReducer, Zustand

---

## State Machine Flow Verification

### Expected State Transitions (with logs):

```
User highlights "authentication" code
↓
[State_Trigger] Metadata extracted:
  - selectedText: "authentication"
  - fileName: "/path/to/file.ts"
  - fileLanguage: "typescript"
  - lineNumber: 45
↓
[State_Retrieval] Query mock database:
  - Keyword match: "auth", "JWT", "security" found
  - Recency: All results from last 6 months ✓
  - Top 3 selected
↓
[State_Display] Sidebar populated:
  - Nugget 1: Teams - "Authentication Architecture Decision" (95% relevant)
  - Nugget 2: SharePoint - "VS Code Extension Best Practices" (90% relevant)
  - Nugget 3: Teams - "MTTC Target Discussion" (87% relevant)
↓
[MTTC Metric] 142ms (Target: <30000ms) ✓
```

---

## Debugging Tips

### 1. Check Extension Logs
```bash
# View all extension output
View → Output → Context Bridge
```

### 2. Inspect State Machine
- All state transitions are logged with timestamps
- Semantic ranking scores are calculated in `src/stateMachine.ts`
- Run with: `npm run dev` for development mode

### 3. React DevTools (Optional)
If you have React DevTools installed, you can inspect:
- `contextMap` state
- `isLoading` state
- Webview message flow

### 4. Rebuild After Changes
```bash
npm run build
npm run package
# Then reload extension in VS Code (Ctrl+R in extension dev window)
```

---

## Known Limitations (MVP)

1. **Mock Data Only**
   - Uses `src/data/contextDatabase.json` (6 hardcoded examples)
   - No real Microsoft Graph or GitHub API integration (future phase)

2. **No Persistence**
   - Context cache is session-only (clears on restart)
   - Future: SQLite for persistent context history

3. **Simple Ranking**
   - Keyword matching is substring-based
   - Future: TF-IDF or embedding-based semantic search

4. **No LLM Synthesis**
   - Snippets are pre-written in JSON
   - Future: Claude/GPT-4 generates context nuggets

---

## Portfolio / Resume Value

This MVP demonstrates:

✅ **Full-Stack Extension Development**
- VS Code Extension API (C#/.NET-like patterns)
- React component architecture
- TypeScript for type safety
- Webpack/Vite bundling

✅ **System Design**
- Finite State Machine pattern
- Clean separation of concerns
- Message-based IPC (Extension ↔ Webview)
- Semantic ranking algorithm

✅ **Product Thinking**
- Solving real DevEx friction (6+ hours/week context switching)
- MTTC metric validation
- Accessibility-first design
- MVP → Production roadmap

✅ **Metrics-Driven Development**
- MTTC tracking (Mean Time to Context)
- Validation logging (user interaction metrics)
- State transition observability

---

## Next Steps (Production Phase)

### Phase 2: Live API Integration
- [ ] Microsoft Graph API (Teams/SharePoint auth flow)
- [ ] GitHub REST API (user token management)
- [ ] Parallel API dispatch with Promise.all()
- [ ] Robust error handling & retry logic

### Phase 3: Intelligence Layer
- [ ] OpenAI API integration for synthesis
- [ ] Prompt engineering for context nugget generation
- [ ] Token usage optimization

### Phase 4: Persistence & Analytics
- [ ] Local SQLite database for context cache
- [ ] Dashboard showing MTTC improvements
- [ ] Usage analytics (which context types help most)

---

## Support & Questions

For issues:
1. Check the [VS Code Extension API Docs](https://code.visualstudio.com/api)
2. Review `ARCHITECTURE.md` for design details
3. Enable debug logs: `View → Output → Context Bridge`

---

## License

This project is part of a student portfolio. Free to use and modify for learning purposes.

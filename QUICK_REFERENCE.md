# Quick Reference Guide: Copilot Context-Bridge

## 🎯 Main Entry Points

| File | Purpose | Key Function |
|------|---------|--------------|
| [src/extension.ts](src/extension.ts) | VS Code Extension entry | `activate()` - registers webview & listeners |
| [src/stateMachine.ts](src/stateMachine.ts) | Core business logic | `processSelection()` - orchestrates 4 states |
| [src/webview/provider.ts](src/webview/provider.ts) | Webview lifecycle | `resolveWebviewView()` - UI rendering |
| [src/webview/main.tsx](src/webview/main.tsx) | React app | Message listener & state management |

---

## 📊 State Machine Flow

```
event: text selection
    ↓
[State_Trigger]
  extractIntentMetadata(selectedText, fileName, ...)
    ↓
[State_Retrieval] 
  retrieveContextNuggets(metadata)
    - Query database
    - Calculate keyword match score (70%)
    - Calculate recency score (30%)
    - Sort & return top 3
    ↓
[State_Display]
  generateContextMap(metadata, nuggets)
  Post to webview: { type: 'update-context', payload: contextMap }
    ↓
[Webview]
  Render nugget cards with links
    ↓
[User Action]
  Click "View Full Context" → postMessage to extension
  Extension logs: [Validation] User clicked link
```

---

## 🔄 Data Flow

```
VS Code Editor               Extension Process           Webview (React)
    ↓                            ↓                            ↓
User highlights code ----→ onDidChangeTextEditorSelection
                           extractIntentMetadata()
                                ↓
                           ContextBridgeStateMachine
                           .processSelection()
                                ↓
                           retrieveContextNuggets()
                           (semantic ranking)
                                ↓
                           webview.postMessage({
                             type: 'update-context',
                             payload: contextMap
                           })
                                                        ←---- messageHandler()
                                                        renderContext(contextMap)
                                                        
User clicks link ←─ postMessage({ type: 'navigate-link' })
```

---

## 🎨 UI Component Tree

```
Sidebar (main container)
├── sidebar-header
│   ├── header-title: "🔗 Context Bridge"
│   └── header-subtitle: "Relevant context from Teams & GitHub"
├── nuggets-container (list)
│   ├── NuggetCard #1
│   │   ├── nugget-header (index + source + date)
│   │   ├── nugget-content (text)
│   │   ├── nugget-meta (author + relevance %)
│   │   ├── nugget-keywords (tags)
│   │   └── nugget-link-btn (CTA)
│   ├── NuggetCard #2
│   └── NuggetCard #3
└── sidebar-footer
    └── MTTC Target info
```

---

## 🔑 Key Functions

### Extension Layer
```typescript
// extension.ts
activate(context)
  ├── registerWebviewViewProvider(provider)
  ├── onDidChangeTextEditorSelection(event)
  │   └── provider.updateContextForSelection(selectedText)
  └── onDidChangeActiveTextEditor(editor)
      └── provider.updateContextForFile(fileName)
```

### State Machine
```typescript
// stateMachine.ts
ContextBridgeStateMachine.extractIntentMetadata(text, file, lang, line)
  → IntentMetadata { selectedText, fileName, ... }

ContextBridgeStateMachine.retrieveContextNuggets(metadata)
  → ContextNugget[] (top 3, ranked by relevance)

ContextBridgeStateMachine.generateContextMap(metadata, nuggets)
  → ContextMap { metadata, nuggets, cachedAt, sessionId }
```

### Webview Provider
```typescript
// provider.ts
resolveWebviewView(webviewView)
  └── Sets up postmessage listeners

updateContextForSelection(selectedText)
  └── Processes selection → posts to webview

handleWebviewMessage(message)
  └── navigate-link: Opens URL in browser
  └── log-metric: Logs validation metrics
```

### React UI
```typescript
// main.tsx / Sidebar.tsx
App()
  └── Listen for webview messages
      ├── 'loading' → show spinner
      ├── 'update-context' → render nuggets
      └── 'clear' → clear sidebar

Sidebar({ contextMap, isLoading })
  └── Display nugget cards with accessibility

NuggetCard({ nugget, index, onClick })
  └── Individual card with source badge, content, CTA
```

---

## 🗂️ File Organization

```
/src
├── extension.ts                (160 lines) - Entry point
├── stateMachine.ts             (115 lines) - Core logic
├── types.ts                    (45 lines)  - TypeScript interfaces
│
├── data/
│   └── contextDatabase.json    (200 lines) - Mock data (6 items)
│
└── webview/
    ├── provider.ts             (361 lines) - Webview provider
    ├── main.tsx                (45 lines)  - React entry
    ├── index.html              (18 lines)  - Template
    └── ui/
        ├── Sidebar.tsx         (195 lines) - UI components
        └── Sidebar.css         (350 lines) - Styles + accessibility

/dist (generated)
├── extension.js                (15.5 KB)
├── webview.js                  (1.2 MB)
└── style.css                   (6.6 KB)
```

---

---

## 🚀 Build Commands Reference

```bash
# Install dependencies
npm install

# Build (TypeScript compile + Vite bundle)
npm run build
  ✓ Outputs: dist/extension.js, dist/webview.js, dist/style.css

# Package extension
npm run package
  ✓ Outputs: copilot-context-bridge-0.0.1.vsix (235 KB)

# Install in VS Code
code --install-extension copilot-context-bridge-0.0.1.vsix

# Dev mode (watch)
npm run dev

# Lint
npm run lint
```

---

## 📊 Mock Data Structure

Each context nugget in `contextDatabase.json`:

```json
{
  "id": "unique-id",
  "source": "Teams|SharePoint|GitHub PR|GitHub Issue",
  "channel": "Optional: Teams channel name",
  "thread": "Optional: Thread title",
  "content": "1-2 sentence summary",
  "keywords": ["keyword1", "keyword2", ...],
  "timestamp": "2025-12-18T10:00:00Z",
  "author": "Author Name",
  "relevanceScore": 0.95,
  "url": "https://..."
}
```

---

## 🎯 MTTC Calculation

**MTTC = Time from selection highlight to sidebar showing context**

```
Timeline:
0ms   → User highlights code
10ms  → Metadata extraction
15ms  → Database query
65ms  → Semantic ranking
165ms → Sidebar renders
━━━━━━
170ms ← Total MTTC (Target: < 30,000ms for live APIs)
```

**Tracked in Output**:
```
[MTTC Metric] 142ms (Target: <30000ms)
```

---

## 🔐 Security Considerations

### ✅ Already Implemented
- Sanitized message passing (postMessage API)
- No eval() or innerHTML (React escapes automatically)
- OWASP: No hardcoded secrets in code

### 🔄 For Production Phase 2
- OAuth token storage (secure storage API)
- HTTPS only for API calls
- Input validation for queries
- Rate limiting on API calls

---

## ♿ Accessibility Features

### High Contrast Mode
```css
@media (prefers-contrast: more) {
  :root {
    --color-bg-primary: #000000;
    --color-text-primary: #ffffff;
  }
}
```

### Keyboard Navigation
- Tab: Focus next element
- Shift+Tab: Focus previous
- Enter/Space: Activate button
- Focus indicators: 2px outline

### Screen Reader Support
- `role="region"` on main container
- `role="list"` on nugget container
- `role="listitem"` on each nugget
- `aria-label` on buttons
- `aria-live="polite"` on loading states

---

## 🐛 Debugging Tips

### View Extension Logs
```
View → Output → Context Bridge
```

Look for:
```
[MTTC Metric] XXXms
[Validation] User clicked link: Teams
[State] Transition from State_Idle to State_Trigger
```

### Check State Machine Flow
Edit `src/stateMachine.ts` and add console.log():
```typescript
this.transitionState("State_Trigger", "State_Retrieval", "metadata-extracted");
console.log(`Transitioning: Trigger → Retrieval`);
```

### Browser DevTools (Webview)
In extension dev host (F5), open DevTools (Ctrl+Shift+I):
- Inspect React component tree
- Check network calls (mock data lookup)
- Verify message flow in console

---

##  Future Phase Integration Points

### Phase 2: Live APIs
```typescript
// In State_Retrieval:
async retrieveContextNuggets(metadata) {
  const teamsResults = await microsoftGraphAPI.searchTeams(metadata.selectedText);
  const githubResults = await githubAPI.searchIssues(metadata.selectedText);
  const sharePointResults = await microsoftGraphAPI.searchSharePoint(...);
  
  return this.semanticRank([...teamsResults, ...githubResults, ...sharePointResults]);
}
```

### Phase 3: LLM Synthesis
```typescript
// In State_Display:
async synthesizeNuggets(nuggets) {
  const synthesis = await openaiAPI.generateContextNuggets(nuggets);
  return synthesis.map(s => ({
    content: s,
    keywords: extractKeywords(s),
    source: "AI Synthesis"
  }));
}
```

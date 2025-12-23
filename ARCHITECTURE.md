# Copilot Context-Bridge: Architecture & State Machine

## Overview

Copilot Context-Bridge is a VS Code Extension MVP that solves **context-switching friction**. The problem: developers lose 6+ hours per week hunting for technical decisions in Teams chats and SharePoint docs.

**Solution**: When you highlight code in VS Code, the extension's sidebar automatically surfaces the top 3 relevant "Context Nuggets" (Teams summaries, documentation snippets, GitHub PR discussions).

**Target Metric**: Mean Time to Context (MTTC) < 30 seconds

---

## Application State Machine (MVP)

The extension follows a **4-state finite state machine** for processing user selections:

### State_Idle
- **Description**: System is active in the background, listening for user interaction
- **Transition**: Waits for text selection event
- **Next State**: State_Trigger

### State_Trigger (1:1 data transition)
- **Description**: User selects/highlights code
- **Logic**:
  - Extract `IntentMetadata`: selected text, file name, language, line number, timestamp
  - Validate selection length (min 3 characters)
- **Next State**: State_Retrieval
- **File**: `src/extension.ts` (event listener), `src/stateMachine.ts` (metadata extraction)

### State_Retrieval (M:1 data transition)
- **Description**: Fetch relevant context from mock database using semantic ranking
- **Logic**:
  1. Extract keywords from selected text (naive tokenization)
  2. Query mock context database (`src/data/contextDatabase.json`)
  3. **Semantic Ranking**:
     - Keyword match density (70% weight)
     - Recency: prioritize last 6 months (30% weight)
  4. Return top 3 results
- **Data Transition**: Many potential matches → 1 ranked set (M:1)
- **Next State**: State_Display
- **File**: `src/stateMachine.ts` (ContextBridgeStateMachine.retrieveContextNuggets)

### State_Display
- **Description**: Send ranked context to webview sidebar and render UI
- **Logic**:
  1. Generate ContextMap (metadata + nuggets + cache timestamp)
  2. Post message to webview: `{ type: 'update-context', payload: contextMap }`
  3. Webview renders nugget cards with:
     - Source (Teams, SharePoint, GitHub PR, etc.)
     - Content snippet
     - Relevance score %
     - Keywords
     - Clickable "View Full Context" link
- **Performance Metric**: MTTC captured (Date.now() - contextMap.cachedAt)
- **Next State**: State_Idle (returns to waiting)
- **Files**: `src/webview/provider.ts` (messaging), `src/webview/ui/Sidebar.tsx` (React UI)

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION                             │
│                   Highlights code in editor                         │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      STATE_TRIGGER (1:1)                           │
│  Extract: { selectedText, fileName, fileLanguage, lineNumber }     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│               STATE_RETRIEVAL (M:1 - SEMANTIC RANK)                │
│                                                                     │
│  Query contextDatabase.json                                        │
│  For each context:                                                 │
│    - Calculate keyword match score (70%)                          │
│    - Calculate recency score (30%)                                │
│  Return Top 3 Results                                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   STATE_DISPLAY (1:1)                               │
│                                                                     │
│  Extension → Webview postMessage:                                  │
│  {                                                                 │
│    type: 'update-context',                                         │
│    payload: {                                                      │
│      metadata: IntentMetadata,                                     │
│      nuggets: [ContextNugget[], (top 3)],                         │
│      cachedAt: timestamp                                           │
│    }                                                               │
│  }                                                                 │
│                                                                     │
│  Webview renders React UI with nugget cards                        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   USER VALIDATION / METRICS                         │
│                                                                     │
│  - User clicks "View Full Context" → open link in browser          │
│  - Extension logs: [Validation] user clicked nugget                │
│  - Extension logs: [MTTC Metric] XXXms                             │
│  - Webview posts: { type: 'navigate-link', payload: {...} }       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Type Definitions

### IntentMetadata
```typescript
interface IntentMetadata {
  selectedText: string;        // User-highlighted code snippet
  fileName: string;             // Full path to file
  fileLanguage: string;         // Language ID (typescript, python, etc.)
  lineNumber: number;           // 1-based line number
  timestamp: number;            // Unix timestamp when selected
}
```

### ContextNugget
```typescript
interface ContextNugget {
  id: string;
  source: "Teams" | "SharePoint" | "GitHub PR" | "GitHub Issue";
  title?: string;
  content: string;              // 1-sentence summary
  keywords: string[];           // For semantic matching
  timestamp: string;            // ISO 8601
  author: string;
  relevanceScore: number;       // 0.0-1.0
  url: string;                  // Direct link to source
}
```

### ContextMap (what gets cached)
```typescript
interface ContextMap {
  metadata: IntentMetadata;
  nuggets: ContextNugget[];     // Top 3 ranked
  cachedAt: number;             // Timestamp of context retrieval
  sessionId: string;            // Unique session identifier
}
```

---

## File Structure

```
/src
├── extension.ts                       # Extension entry point
│                                      # - Registers webview provider
│                                      # - Listens for text selection
│                                      # - Triggers state machine
│
├── stateMachine.ts                    # Core state machine
│                                      # - State_Trigger: metadata extraction
│                                      # - State_Retrieval: semantic ranking
│                                      # - State_Display: context generation
│
├── types.ts                           # TypeScript interfaces
│
├── data/
│   └── contextDatabase.json           # Mock context data (6 examples)
│                                      # - Teams chats
│                                      # - SharePoint docs
│                                      # - GitHub PRs
│
└── webview/
    ├── provider.ts                    # WebviewViewProvider class
    │                                  # - Lifecycle management
    │                                  # - Message passing
    │
    ├── main.tsx                       # React app entry point
    │                                  # - Global message listener
    │                                  # - State management (contextMap)
    │
    ├── index.html                     # Static HTML template
    │
    └── ui/
        ├── Sidebar.tsx                # React UI components
        │                              # - Nugget cards
        │                              # - Accessibility (high contrast)
        │
        └── Sidebar.css                # Component styles
```

---

## Build & Packaging

### Build Process
```bash
npm run build
```
This runs:
1. `tsc` - Compile TypeScript to JavaScript (dist/types)
2. `vite build` - Bundle extension.ts and webview/main.tsx separately
   - Output: `dist/extension.js` (extension logic)
   - Output: `dist/webview.js` (React UI)

### Package Extension
```bash
npm run package
```
Creates a `.vsix` file (VS Code Extension Package) that can be installed locally or published to the Extension Marketplace.

---

## Accessibility Features

✅ **High Contrast Mode Support**
- Color variables that respect `prefers-contrast: more`
- Sufficient color contrast ratios (WCAG AA)

✅ **Keyboard Navigation**
- Tab through nugget cards
- Enter/Space to click buttons
- Focus indicators on interactive elements

✅ **Screen Reader Support**
- ARIA labels on nugget cards
- Semantic HTML structure
- Live regions for loading states

✅ **Reduced Motion**
- Respects `prefers-reduced-motion: reduce`
- Disables animations for users who prefer no motion

---

## MVP → Production Roadmap

### Phase 1 (Today - MVP)
✅ Mock context database (hardcoded JSON)
✅ State machine logic
✅ Webview sidebar UI
✅ Semantic ranking algorithm
✅ MTTC metric tracking

### Phase 2 (Next - Live APIs)
📋 Integrate Microsoft Graph API (Teams/SharePoint)
📋 GitHub REST API for PR/Issue context
📋 OAuth flow for authentication

### Phase 3 (Future - Intelligence)
📋 LLM-powered synthesis (OpenAI API)
📋 Automatic context suggestion (no selection needed)
📋 Persistent cache + session storage
📋 Context validation metrics dashboard

---

## Testing the MVP

### 1. Start the Extension
```bash
npm run build
npm run package
# Install in VS Code: .vsix file locally
```

### 2. Trigger Context Retrieval
- Open any code file in VS Code
- Highlight a word like: `authentication`, `database`, `API`, `rate limit`
- Context Bridge sidebar should populate with 1-3 relevant nuggets

### 3. Validate Metrics
- Open VS Code Output panel: `View → Output`
- Select "Context Bridge" channel
- Check logs: `[MTTC Metric] XXXms (Target: <30000ms)`
- Check validation: `[Validation] User clicked link: Teams`

### 4. Acceptable Performance
- MTTC should be < 30 seconds (typically < 500ms for mock data)
- Sidebar should render in < 100ms
- No lag when typing or scrolling

---

## Performance & Scalability Considerations

### Current (Mock Data)
- **MTTC**: ~50-150ms
- **Database**: In-memory JSON (6 examples)
- **Ranking**: O(n) keyword matching + recency filter

### Production (Live APIs)
- **MTTC Target**: Still < 30 seconds
- **Optimization needed**:
  - Parallel API calls (Teams + GitHub simultaneously)
  - Caching layer (local session cache)
  - Debouncing frequent selections
  - Pagination for large result sets

---

## Resume / Portfolio Value

This prototype demonstrates:

1. **System Design**: Multi-tier architecture (extension layer, state machine, webview)
2. **Product Thinking**: Solving a real DevEx problem (Atlassian 2025 research)
3. **Technical PM Skills**: Scoping, prioritization (MVP → Production roadmap)
4. **Full-Stack Engineering**:
   - VS Code Extension API (native integration)
   - React for UI
   - TypeScript for type safety
   - Semantic algorithms (ranking, filtering)
5. **Metrics-Driven Approach**: MTTC tracking for product success

---

## References

- [VS Code Extension API Docs](https://code.visualstudio.com/api)
- [Atlassian 2025 State of DevEx Report](https://www.atlassian.com/devex)
- [Accessibility Guidelines (WCAG 2.1)](https://www.w3.org/WAI/WCAG21/quickref/)
- [OpenAI API for Synthesis (Phase 3)](https://platform.openai.com/docs/guides/gpt)

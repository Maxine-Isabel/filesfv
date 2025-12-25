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

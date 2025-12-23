import * as fs from "fs";
import * as path from "path";
import {
  IntentMetadata,
  ContextNugget,
  ContextMap,
  ApplicationState,
  StateTransition,
} from "./types";

/**
 * Context Bridge State Machine
 * Orchestrates the 4-state MVP flow: Idle → Trigger → Retrieval → Display
 */

// Use dynamic require or read JSON file at runtime
function getContextDatabase(): ContextNugget[] {
  try {
    // Build time: __dirname might not be reliable, so we construct the path
    const currentDir = process.cwd();
    const dbPath = path.join(currentDir, 'src', 'data', 'contextDatabase.json');
    
    if (fs.existsSync(dbPath)) {
      const rawData = fs.readFileSync(dbPath, 'utf-8');
      const parsed = JSON.parse(rawData);
      return parsed.contexts || [];
    }

    // Fallback: return empty if file not found (will be populated in browser/dev)
    return [];
  } catch (error) {
    console.error('Error loading context database:', error);
    return [];
  }
}

export class ContextBridgeStateMachine {
  private currentState: ApplicationState = "State_Idle";
  private sessionCache: Map<string, ContextMap> = new Map();
  private stateHistory: StateTransition[] = [];

  /**
   * State_Trigger: Extract intent metadata from user selection
   */
  static extractIntentMetadata(
    selectedText: string,
    fileName: string,
    fileLanguage: string,
    lineNumber: number
  ): IntentMetadata {
    return {
      selectedText,
      fileName,
      fileLanguage,
      lineNumber,
      timestamp: Date.now(),
    };
  }

  /**
   * State_Retrieval: Fetch context from mock database with semantic ranking
   */
  static retrieveContextNuggets(
    metadata: IntentMetadata
  ): ContextNugget[] {
    try {
      const database = getContextDatabase();

      // Extract keywords from selected text (naive tokenization)
      const selectedKeywords = metadata.selectedText
        .toLowerCase()
        .split(/\W+/)
        .filter((w: string) => w.length > 3);

      // Semantic ranking: keyword match + recency
      const rankedContexts = database
        .map((ctx: ContextNugget) => {
          // Calculate keyword density match
          const keywordMatches = ctx.keywords.filter((kw: string) =>
            selectedKeywords.some((sk: string) =>
              kw.toLowerCase().includes(sk) || sk.includes(kw.toLowerCase())
            )
          ).length;

          const matchScore = keywordMatches / Math.max(ctx.keywords.length, 1);

          // Recency score (prioritize last 6 months)
          const ctxDate = new Date(ctx.timestamp).getTime();
          const sixMonthsAgo = Date.now() - 180 * 24 * 60 * 60 * 1000;
          const recencyScore = ctxDate > sixMonthsAgo ? 1 : 0.5;

          // Combined relevance score
          return {
            ...ctx,
            calculatedScore: matchScore * 0.7 + recencyScore * 0.3,
          };
        })
        .filter((ctx: ContextNugget & { calculatedScore: number }) => ctx.calculatedScore > 0)
        .sort(
          (a: ContextNugget & { calculatedScore: number }, b: ContextNugget & { calculatedScore: number }) =>
            b.calculatedScore - a.calculatedScore
        )
        .slice(0, 3) // Top 3 results
        .map(({ calculatedScore, ...ctx }: ContextNugget & { calculatedScore: number }) => ctx);

      return rankedContexts;
    } catch (error) {
      console.error("Error retrieving context nuggets:", error);
      return [];
    }
  }

  /**
   * State_Display: Generate displayable context map
   */
  generateContextMap(
    metadata: IntentMetadata,
    nuggets: ContextNugget[]
  ): ContextMap {
    return {
      metadata,
      nuggets,
      cachedAt: Date.now(),
      sessionId: this.generateSessionId(),
    };
  }

  /**
   * Process a user selection event and emit context updates
   */
  processSelection(
    selectedText: string,
    fileName: string,
    fileLanguage: string,
    lineNumber: number
  ): ContextMap | null {
    // Transition: Idle → Trigger
    this.transitionState("State_Idle", "State_Trigger", "text-selected");

    // Extract metadata
    const metadata = ContextBridgeStateMachine.extractIntentMetadata(
      selectedText,
      fileName,
      fileLanguage,
      lineNumber
    );

    // Transition: Trigger → Retrieval
    this.transitionState("State_Trigger", "State_Retrieval", "metadata-extracted");

    // Retrieve context
    const nuggets = ContextBridgeStateMachine.retrieveContextNuggets(metadata);

    // Transition: Retrieval → Display
    this.transitionState("State_Retrieval", "State_Display", "context-retrieved");

    // Generate context map
    const contextMap = this.generateContextMap(metadata, nuggets);

    // Cache for session persistence
    this.sessionCache.set(contextMap.sessionId, contextMap);

    // Transition back to idle
    this.transitionState("State_Display", "State_Idle", "context-displayed");

    return contextMap;
  }

  /**
   * Log a state transition for observability
   */
  private transitionState(from: ApplicationState, to: ApplicationState, trigger: string): void {
    this.currentState = to;
    this.stateHistory.push({
      from,
      to,
      trigger,
      data: { timestamp: Date.now() },
    });
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Get the current state
   */
  getState(): ApplicationState {
    return this.currentState;
  }

  /**
   * Get state history for debugging/metrics
   */
  getStateHistory(): StateTransition[] {
    return this.stateHistory;
  }

  /**
   * Clear session cache (optional cleanup)
   */
  clearSessionCache(): void {
    this.sessionCache.clear();
  }
}

import * as vscode from 'vscode';
import { contextDatabase } from '../data/mockContext';

export class ContextBridgeViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'contextBridgeSidebar';
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.command) {
        case 'alert':
          vscode.window.showInformationMessage(data.text);
          break;
        case 'openLink':
          vscode.env.openExternal(vscode.Uri.parse(data.url));
          break;
      }
    });
  }

  public updateContextForSelection(selectedText: string) {
    if (this._view) {
      const context = this.findContextByKeyword(selectedText);
      this._view.webview.postMessage({
        command: 'updateContext',
        context: context
      });
    }
  }

  public updateContextForFile(fileName: string) {
    if (this._view) {
      const context = this.findContextByFile(fileName);
      this._view.webview.postMessage({
        command: 'updateContext',
        context: context
      });
    }
  }

  private findContextByKeyword(keyword: string): any {
    const lowerKeyword = keyword.toLowerCase();
    const results = contextDatabase.filter((item) =>
      item.keywords.some((k) => lowerKeyword.includes(k.toLowerCase()))
    );

    if (results.length > 0) {
      return results[0];
    }

    return {
      id: 'default',
      title: 'No context found',
      snippet: 'Try selecting code or opening a file with relevant keywords.',
      source: 'System',
      sourceUrl: '',
      keywords: []
    };
  }

  private findContextByFile(fileName: string): any {
    const results = contextDatabase.filter((item) =>
      item.relatedFiles?.some((f) => fileName.includes(f))
    );

    if (results.length > 0) {
      return results[0];
    }

    return {
      id: 'default',
      title: 'Context Bridge Ready',
      snippet: 'Select code or navigate to a file to see related context from Teams and GitHub.',
      source: 'System',
      sourceUrl: '',
      keywords: []
    };
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Context Bridge</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            padding: 16px;
            font-size: 13px;
            line-height: 1.6;
          }

          .container {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
          }

          .header-icon {
            font-size: 18px;
          }

          .header-title {
            font-weight: 600;
            font-size: 14px;
            color: var(--vscode-foreground);
          }

          .context-card {
            background: var(--vscode-editor-inlineValue-background);
            border: 1px solid var(--vscode-editor-lineHighlightBorder);
            border-radius: 4px;
            padding: 12px;
            transition: all 0.2s ease;
          }

          .context-card:hover {
            border-color: var(--vscode-focusBorder);
            background: var(--vscode-editor-hoverHighlightBackground);
          }

          .context-title {
            font-weight: 600;
            font-size: 13px;
            margin-bottom: 8px;
            color: var(--vscode-textLink-foreground);
          }

          .context-snippet {
            font-size: 12px;
            line-height: 1.5;
            margin-bottom: 10px;
            color: var(--vscode-editor-foreground);
            padding: 8px;
            background: var(--vscode-editor-background);
            border-radius: 3px;
            border-left: 3px solid var(--vscode-textLink-foreground);
          }

          .context-source {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
          }

          .source-label {
            display: inline-block;
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 2px 6px;
            border-radius: 3px;
            font-weight: 500;
          }

          .source-link {
            color: var(--vscode-textLink-foreground);
            text-decoration: none;
            cursor: pointer;
            transition: opacity 0.2s;
          }

          .source-link:hover {
            opacity: 0.8;
            text-decoration: underline;
          }

          .loading {
            opacity: 0.6;
            font-style: italic;
          }

          .keywords {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-top: 8px;
          }

          .keyword-badge {
            font-size: 11px;
            background: var(--vscode-editor-inlineValue-background);
            color: var(--vscode-editor-inlineValue-foreground);
            padding: 2px 4px;
            border-radius: 2px;
            border: 1px solid var(--vscode-editor-lineHighlightBorder);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-icon">🔗</div>
            <div class="header-title">Context Bridge</div>
          </div>
          <div id="context-container">
            <div class="context-card loading">
              Loading context... Select code to get started.
            </div>
          </div>
        </div>

        <script>
          const vscode = acquireVsCodeApi();

          window.addEventListener('message', (event) => {
            const message = event.data;
            if (message.command === 'updateContext') {
              renderContext(message.context);
            }
          });

          function renderContext(context) {
            const container = document.getElementById('context-container');
            if (!context) {
              container.innerHTML = '<div class="context-card loading">No context available</div>';
              return;
            }

            const keywordHtml = context.keywords && context.keywords.length > 0
              ? \`<div class="keywords">\${context.keywords.map(k => \`<span class="keyword-badge">\${k}</span>\`).join('')}</div>\`
              : '';

            const sourceHtml = context.sourceUrl
              ? \`<a href="#" class="source-link" onclick="openLink('\${context.sourceUrl}'); return false;">View Source ↗</a>\`
              : '';

            container.innerHTML = \`
              <div class="context-card">
                <div class="context-title">\${context.title}</div>
                <div class="context-snippet">\${context.snippet}</div>
                <div class="context-source">
                  <span class="source-label">\${context.source}</span>
                  \${sourceHtml}
                </div>
                \${keywordHtml}
              </div>
            \`;
          }

          function openLink(url) {
            vscode.postMessage({
              command: 'openLink',
              url: url
            });
          }
        </script>
      </body>
      </html>`;
  }
}

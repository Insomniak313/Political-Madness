// Structured logging service with namespace-based activation
// No external dependencies, runtime-configurable via localStorage
//
// To activate debug logging for specific namespaces, set in browser console:
// localStorage.setItem('debug_namespaces', 'agent:question,ui:phase0:question')
//
// Available namespaces:
// - agent:question: AI agent calls (request/success/failure with timing)
// - ui:phase0:question: UI interactions (enter screen, reroll, stance selection)

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  private static readonly STORAGE_KEY = 'debug_namespaces';
  private static enabledNamespaces: Set<string> | null = null;

  /**
   * Check if a namespace is enabled for logging
   */
  private static isNamespaceEnabled(namespace: string): boolean {
    if (this.enabledNamespaces === null) {
      this.loadEnabledNamespaces();
    }
    return this.enabledNamespaces!.has(namespace);
  }

  /**
   * Load enabled namespaces from localStorage
   */
  private static loadEnabledNamespaces(): void {
    this.enabledNamespaces = new Set();
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const namespaces = stored.split(',').map(ns => ns.trim()).filter(ns => ns);
        this.enabledNamespaces = new Set(namespaces);
      }
    } catch (error) {
      // Ignore localStorage errors
    }
  }

  /**
   * Log a message with structured data
   */
  private static log(level: LogLevel, namespace: string, event: string, data?: any): void {
    // Always show warn/error, only show debug/info if namespace enabled
    if (level === 'debug' || level === 'info') {
      if (!this.isNamespaceEnabled(namespace)) {
        return;
      }
    }

    const timestamp = new Date().toISOString();
    const logData = data ? ` ${JSON.stringify(data)}` : '';

    const message = `${level.toUpperCase()} ${namespace} ${event}${logData}`;

    switch (level) {
      case 'debug':
      case 'info':
        console.log(`[${timestamp}] ${message}`);
        break;
      case 'warn':
        console.warn(`[${timestamp}] ${message}`);
        break;
      case 'error':
        console.error(`[${timestamp}] ${message}`);
        break;
    }
  }

  /**
   * Log debug message
   */
  static debug(namespace: string, event: string, data?: any): void {
    this.log('debug', namespace, event, data);
  }

  /**
   * Log info message
   */
  static info(namespace: string, event: string, data?: any): void {
    this.log('info', namespace, event, data);
  }

  /**
   * Log warning message
   */
  static warn(namespace: string, event: string, data?: any): void {
    this.log('warn', namespace, event, data);
  }

  /**
   * Log error message
   */
  static error(namespace: string, event: string, data?: any): void {
    this.log('error', namespace, event, data);
  }

  /**
   * Force reload enabled namespaces (useful for testing)
   */
  static reloadNamespaces(): void {
    this.enabledNamespaces = null;
  }
}

// Export singleton instance
export const logger = Logger;
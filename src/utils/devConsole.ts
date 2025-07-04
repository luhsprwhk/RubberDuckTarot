// Utility to log to the console only in development mode
export function devConsole(...args: unknown[]) {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args);
  }
}

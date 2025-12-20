export function getEnvInfo() {
  return {
    mode: import.meta.env.MODE || 'development',
    nodeEnv: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  };
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export const APP_NAME = 'React Complete Test';
export const VERSION = '1.0.0';

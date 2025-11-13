// Global type definitions for web-check-live

declare global {
  interface Window {
    checkitLogout?: () => void;
    checkitUserRole?: string;
  }
}

export {};


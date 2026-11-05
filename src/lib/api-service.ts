// Centralized API / Storage Layer Adapter
// Re-exports storage methods from @/lib/storage for backwards compatibility

import { storage } from "./storage";

export * from "./storage";
export { storage, storage as apiService };

export function resolveApiUrl(path: string): string {
  return path;
}

export function isStaticMode(): boolean {
  return true;
}

export function getApiBaseUrl(): string {
  return "";
}

export function setApiBaseUrl(_url: string | null): void {}

export function getApiKey(): string {
  return "";
}

export function setApiKey(_key: string | null): void {}

export function getForceMode(): "auto" | "live" | "demo" {
  return "demo";
}

export function setForceMode(_mode: "auto" | "live" | "demo"): void {}

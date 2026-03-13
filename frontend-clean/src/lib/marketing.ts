export function trackEvent(action: string, category?: string, label?: string) {
  if (typeof window !== "undefined") {
    console.info("trackEvent", { action, category, label });
  }
}
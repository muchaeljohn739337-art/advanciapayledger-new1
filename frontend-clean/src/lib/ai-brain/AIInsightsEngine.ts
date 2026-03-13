"use client";

import { AIInsight } from "@/lib/ai-brain/ai-core.types";
import { generateInsights as loadInsights } from "@/services/aiCore";
import { useCallback, useState } from "react";

export function useAIInsights() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);

  const generateInsights = useCallback(async (context: string) => {
    setLoading(true);
    try {
      const nextInsights = await loadInsights(context);
      setInsights(nextInsights);
    } catch (error) {
      console.error("Failed to load AI insights:", error);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    insights,
    generateInsights,
    loading,
  };
}
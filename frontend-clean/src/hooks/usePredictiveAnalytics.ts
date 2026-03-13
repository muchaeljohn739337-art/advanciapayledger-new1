/**
 * usePredictiveAnalytics Hook
 * Provides AI-powered predictive analytics and forecasting
 */

import {
  PredictiveAnalysis,
  RevenueForecast,
} from "@/lib/ai-brain/ai-core.types";
import { getRevenueForecast, predictMetric } from "@/services/aiCore";
import { useCallback, useState } from "react";

export function usePredictiveAnalytics() {
  const [predictions, setPredictions] = useState<
    Map<string, PredictiveAnalysis>
  >(new Map());
  const [revenueForecast, setRevenueForecast] =
    useState<RevenueForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = useCallback(
    async (metric: string, timeframe: string = "30d") => {
      setLoading(true);
      setError(null);
      try {
        const prediction = await predictMetric(metric, timeframe);
        const currentValue = prediction.currentValue ?? prediction.current;
        const predictedValue = prediction.predictedValue ?? prediction.predicted;
        const normalizedPrediction: PredictiveAnalysis = {
          ...prediction,
          currentValue,
          predictedValue,
          trend:
            prediction.trend ??
            (predictedValue > currentValue
              ? "up"
              : predictedValue < currentValue
                ? "down"
                : "stable"),
        };
        setPredictions((prev) => new Map(prev).set(metric, normalizedPrediction));
        return normalizedPrediction;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Prediction failed";
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const forecastRevenue = useCallback(async (days: number = 30) => {
    setLoading(true);
    setError(null);
    try {
      const forecast = await getRevenueForecast(days);
      const values = Array.isArray(forecast.forecast) ? forecast.forecast : [];
      const realistic = values[values.length - 1] ?? 0;
      const normalizedForecast: RevenueForecast = {
        ...forecast,
        scenarios: forecast.scenarios ?? {
          optimistic: Math.round(realistic * 1.1),
          realistic,
          pessimistic: Math.round(realistic * 0.9),
        },
        factors: forecast.factors ?? {
          seasonality: 0.35,
          trend: 0.45,
          external: 0.2,
        },
      };
      setRevenueForecast(normalizedForecast);
      return normalizedForecast;
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Revenue forecast failed";
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPrediction = useCallback(
    (metric: string): PredictiveAnalysis | undefined => {
      return predictions.get(metric);
    },
    [predictions],
  );

  return {
    predictions: Array.from(predictions.values()),
    revenueForecast,
    loading,
    error,
    predict,
    forecastRevenue,
    getPrediction,
  };
}

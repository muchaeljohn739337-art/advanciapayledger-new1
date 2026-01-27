// Rockefeller HELOC Network Architecture
// Main entry point for inter-server communication layers
// Reference Number: 123456789-HELOC

export { default as NetworkLayer } from './layers/NetworkLayer';
export { default as PhilosophicalLayer } from './layers/PhilosophicalLayer';
export { default as AssetIntegrationLayer } from './layers/AssetIntegrationLayer';
export { default as ExpressionLayer } from './layers/ExpressionLayer';
export { default as NetworkManager } from './NetworkManager';

export type {
  NetworkLayerConfig,
  NetworkMessage,
  NetworkConnection,
  NetworkMetrics
} from './layers/NetworkLayer';

export type {
  PhilosophicalMessage,
  PhilosophicalConnection,
  PhilosophicalMetrics
} from './layers/PhilosophicalLayer';

export type {
  AssetData,
  IntegrationTransaction,
  PolicyConnection,
  AssetIntegrationMetrics
} from './layers/AssetIntegrationLayer';

export type {
  ExpressionData,
  CreationExpression,
  ResurrectionEvent,
  ExpressionNetwork,
  ExpressionMetrics
} from './layers/ExpressionLayer';

export type {
  NetworkManagerConfig,
  NetworkTopology,
  GlobalNetworkMetrics,
  InterLayerMessage
} from './NetworkManager';

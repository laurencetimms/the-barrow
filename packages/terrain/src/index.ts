export { createSeededNoise, layeredNoise } from "./noise";
export type { NoiseGenerator } from "./noise";

export { GeologyType, GEOLOGY_INFO } from "./geology";
export type { GeologyInfo } from "./geology";

export { generateTerrain, generateHighResPatch } from "./terrain";
export type { TerrainCell, TerrainMap } from "./terrain";

export {
  computeFoodResources,
  generateWightTerritories,
  computeCarryingCapacity,
  identifyFords,
  computeSettlements,
  computePathNetwork,
  computeSacredSites,
  computeSeasonalCamps,
  computeHuntingCircuits,
  validateHabitation,
} from "./habitation";
export type {
  FoodResources, PredatorTerritory, FoodResourceMap,
  CaveWightTerritory, SmallFolkTerritory, WightData,
  CarryingCapacity,
  SettlementSize, Settlement, AbandonedReason, AbandonedSettlement, Ford, SettlementData,
  PathSegment, PathNetwork,
  MajorSacredType, SignificantSacredType, SmallSacredType,
  MajorSacredSite, SignificantSacredSite, SmallSacredFeature, SacredData,
  SeasonalCampType, SeasonalCamp, SeasonalData,
  HuntingSeason, HuntingWaypoint, HuntingCircuit, HuntingData,
  ValidationReport,
} from "./habitation";

export { createSeededNoise, layeredNoise } from "./noise";
export type { NoiseGenerator } from "./noise";

export { GeologyType, GEOLOGY_INFO } from "./geology";
export type { GeologyInfo } from "./geology";

export { generateTerrain, generateHighResPatch } from "./terrain";
export type { TerrainCell, TerrainMap } from "./terrain";

export {
  generateHabitation,
  computeFoodResources,
  generateWightTerritories,
  computeCarryingCapacity,
  computeSettlements,
  computePathNetwork,
  computeSacredSites,
  computeSeasonalCamps,
  computeHuntingCircuits,
  validateHabitation,
} from "./habitation";
export type {
  HabitationData, Settlement, SacredSite, Path,
  FoodCell, FoodResourceMap, WolfTerritory, BearRange,
  WightSite, WightData,
  CarryingCapacity,
  SettlementSize, ActiveSettlement, AbandonedSettlement, Ford, SettlementData,
  PathSegment, PathNetwork,
  MajorSiteType, SignificantSiteType, SmallSiteType,
  MajorSite, SignificantSite, SmallSite, SacredData,
  SeasonalCampType, SeasonalCamp, SeasonalData,
  HuntingWaypoint, HuntingCircuit, HuntingData,
  ValidationReport,
} from "./habitation";

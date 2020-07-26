import React from "react";

type FilterType = {
  minPrice?: number;
  maxPrice?: number;
  minSize?: number;
  maxSize?: number;
  minPricePerMeter?: number;
  maxPricePerMeter?: number;
  positiveKeywords: Array<string>;
  negativeKeywords: Array<string>;
  blockingKeywords: Array<string>;
};

export const EMPTY_FILTERS: FilterType = {
  minPrice: undefined,
  maxPrice: undefined,
  minSize: undefined,
  maxSize: undefined,
  minPricePerMeter: undefined,
  maxPricePerMeter: undefined,
  positiveKeywords: [],
  negativeKeywords: [],
  blockingKeywords: [],
};

export const FilteringContext = React.createContext<{
  filters: FilterType;
  setFilters: (filters: FilterType) => void;
}>({
  filters: {} as any,
  setFilters: (_: any) => {},
});

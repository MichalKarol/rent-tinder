import React from "react";

type FilterType = {
  minPrice?: number;
  maxPrice?: number;
  minSize?: number;
  maxSize?: number;
  minPricePerMeter?: number;
  maxPricePerMeter?: number;
};

export const EMPTY_FILTERS: FilterType = {
  minPrice: undefined,
  maxPrice: undefined,
  minSize: undefined,
  maxSize: undefined,
  minPricePerMeter: undefined,
  maxPricePerMeter: undefined,
};

export const FilteringContext = React.createContext<{
  filters: FilterType;
  setFilters: (filters: FilterType) => void;
}>({
  filters: {} as any,
  setFilters: (_: any) => {},
});

/**
 * FilterContext — Global filter state for breach analytics pages
 * Provides time range and sector filtering across all analytics pages
 */
import React, { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from "react";
import { breachRecords, type BreachRecord } from "@/lib/breachData";

interface FilterState {
  timeRange: string;       // "all" | "2024" | "2025" | "last30" | "last90" | custom
  sector: string;          // "all" | specific sector
  severity: string;        // "all" | "Critical" | "High" | "Medium" | "Low"
  platform: string;        // "all" | specific platform
}

interface FilterContextType {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  filteredRecords: BreachRecord[];
  resetFilters: () => void;
}

const defaultFilters: FilterState = {
  timeRange: "all",
  sector: "all",
  severity: "all",
  platform: "all",
};

const FilterContext = createContext<FilterContextType | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const filteredRecords = useMemo(() => {
    let records = [...breachRecords];

    // Time range filter
    if (filters.timeRange !== "all") {
      const now = new Date();
      let cutoff: Date | null = null;

      if (filters.timeRange === "last30") {
        cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (filters.timeRange === "last90") {
        cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      } else if (filters.timeRange === "last180") {
        cutoff = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      } else if (filters.timeRange === "2025") {
        cutoff = new Date("2025-01-01");
        records = records.filter((r) => {
          const d = new Date(r.overview?.discovery_date || r.date || "");
          return d >= cutoff! && d < new Date("2026-01-01");
        });
        cutoff = null; // already filtered
      } else if (filters.timeRange === "2024") {
        cutoff = new Date("2024-01-01");
        records = records.filter((r) => {
          const d = new Date(r.overview?.discovery_date || r.date || "");
          return d >= cutoff! && d < new Date("2025-01-01");
        });
        cutoff = null;
      }

      if (cutoff) {
        records = records.filter((r) => {
          const d = new Date(r.overview?.discovery_date || r.date || "");
          return d >= cutoff!;
        });
      }
    }

    // Sector filter
    if (filters.sector !== "all") {
      records = records.filter((r) => r.sector === filters.sector);
    }

    // Severity filter
    if (filters.severity !== "all") {
      records = records.filter((r) => r.overview?.severity === filters.severity);
    }

    // Platform filter
    if (filters.platform !== "all") {
      records = records.filter((r) => r.overview?.source_platform === filters.platform);
    }

    return records;
  }, [filters]);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return (
    <FilterContext.Provider value={{ filters, setFilters, filteredRecords, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    // Fallback: return all records if no FilterProvider is wrapping
    return {
      filters: defaultFilters,
      setFilters: (() => {}) as React.Dispatch<React.SetStateAction<FilterState>>,
      filteredRecords: breachRecords,
      resetFilters: () => {},
    };
  }
  return ctx;
}

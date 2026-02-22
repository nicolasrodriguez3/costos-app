export const UNITS = {
  kg: {
    name: "kilogramos",
    symbol: "kg",
    type: "masa",
    conversionFactor: 1000,
  },
  g: {
    name: "gramos",
    symbol: "g",
    type: "masa",
    conversionFactor: 1,
  },
  ml: {
    name: "mililitros",
    symbol: "ml",
    type: "volumen",
    conversionFactor: 1,
  },
  l: {
    name: "litros",
    symbol: "l",
    type: "volumen",
    conversionFactor: 1000,
  },
  unit: {
    name: "unidad",
    symbol: "ud.",
    type: "unidad",
    conversionFactor: 1,
  },
  docena: {
    name: "docena",
    symbol: "doc.",
    type: "unidad",
    conversionFactor: 12,
  },
} as const;

export type UnitType = keyof typeof UNITS;

export const UNIT_OPTIONS = Object.keys(UNITS) as UnitType[];

export const UNIT_LABELS: Record<UnitType, string> = {
  kg: "Kilogramos (kg)",
  g: "Gramos (g)",
  ml: "Mililitros (ml)",
  l: "Litros (l)",
  unit: "Unidad (ud.)",
  docena: "Docena (doc.)",
};

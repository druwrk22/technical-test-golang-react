export const SPOT_CONFIG = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  row: i < 6 ? 0 : 1,
  col: i % 6,
  label: `A-${i + 1}`
}));

export const DURATIONS = [30, 60, 90, 120, 180];
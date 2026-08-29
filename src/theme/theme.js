// Ignite Design System — mirrors PRD Section 6 exactly. Do not substitute
// a generic theme here; every screen pulls its tokens from this file.

export const colors = {
  background: "#F7F7F7",
  surface: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#888888",
  accentBg: "#E8F0FE",
  accentText: "#4A90E2",
  border: "#EEEEEE",
  rowHoverBg: "#F5F5F5",
  chipBg: "#F0F0F0",
  black: "#000000",
  white: "#FFFFFF",
  danger: "#D9463F",
  dangerBg: "#FBEAEA",
};

export const typography = {
  fontFamily: "Inter",
  hero: { fontSize: 34, lineHeight: 40 },
  cardTitle: { fontSize: 18, fontWeight: "700" },
  body: { fontSize: 15, fontWeight: "400" },
  meta: { fontSize: 12, fontWeight: "400" },
  metaLg: { fontSize: 13, fontWeight: "400" },
};

export const radius = {
  card: 20,
  cardSm: 16,
  cardXs: 12,
  pill: 999,
  button: 12,
};

export const elevation = {
  1: { shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  2: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  3: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  4: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
};

export const spacing = (n) => n * 4; // 4dp base unit

const theme = { colors, typography, radius, elevation, spacing };
export default theme;

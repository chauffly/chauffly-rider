export const palette = {
  white: '#FFFFFF',
  primaryGold: "#c29d59",
  accent: "rgba(194, 157, 89, 0.15)",
};

export const lightTheme = {
  white: palette.white,
  accent: palette.accent,
  primary: palette.primaryGold,
  background: '#FFFFFF',
  surface: '#FFFFFF',

  // Text
  textPrimary: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',
  textInverse: '#FFFFFF',
  textMuted: '#9E9E9E',

  // UI Elements
  border: '#E0E0E0',

  // Button specific
  buttonPrimary: palette.primaryGold,
  buttonPrimaryText: '#FFF',
  buttonSecondary: palette.accent,
  buttonSecondaryText: '#FFFFFF',

  // Status bar
  statusBar: 'dark',
  transparent: "transparent"
};

export const darkTheme = {
  white: palette.white,
  accent: palette.accent,
  primary: palette.primaryGold,
  background: '#0D1117',
  surface: '#161B22',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textDisabled: '#666666',
  textInverse: '#212121',
  textMuted: 'rgba(255, 255, 255, 0.7)',

  // UI Elements
  border: '#30363D',

  // Button specific
  buttonPrimary: palette.primaryGold,
  buttonPrimaryText: '#1A1A1A',
  buttonSecondary: "'#2A2A2A'",
  buttonSecondaryText: '#FFFFFF',

  // Status bar
  statusBar: 'light',
  transparent: "transparent"
};

export type ThemeColors = typeof lightTheme;

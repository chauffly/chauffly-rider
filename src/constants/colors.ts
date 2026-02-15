export const palette = {
  white: '#FFFFFF',
  primaryGold: "#c29d59",
  accent: "rgba(194, 157, 89, 0.15)",
};

export const lightTheme = {
  white: palette.white,
  accent: palette.accent,
  primary: palette.primaryGold,
  brandBlue: '#2563EB',
  background: '#F7F7F7',
  surface: '#FFFFFF',

  // Text
  textPrimary: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',
  textInverse: '#FFFFFF',
  textMuted: "rgba(14, 27, 43, .56)",

  // UI Elements
  border: '#E0E0E0',
  error: '#E53935',
  error50: 'rgba(229, 83, 77, 0.15)',
  success: '#43A047',
  success50: 'rgba(67, 160, 72, 0.15)',

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
  brandBlue: '#2563EB',
  background: '#09111C',
  surface: '#0E1B2B',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textDisabled: '#666666',
  textInverse: '#212121',
  textMuted: 'rgba(255, 255, 255, 0.7)',

  // UI Elements
  border: '#30363D',
  error: '#EF5350',
  error50: '#ef535036',
  success: '#66BB6A',
  success50: 'rgba(34, 197, 94, 0.25)',

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

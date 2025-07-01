/**
 * Modern color system for KarateApp
 * Features a sophisticated palette with better contrast and visual hierarchy
 */

const tintColorLight = '#2563eb'; // Modern blue
const tintColorDark = '#3b82f6'; // Lighter blue for dark mode

export const Colors = {
  light: {
    text: '#0f172a', // Slate 900
    background: '#ffffff',
    surface: '#f8fafc', // Slate 50
    surfaceVariant: '#f1f5f9', // Slate 100
    tint: tintColorLight,
    icon: '#64748b', // Slate 500
    tabIconDefault: '#94a3b8', // Slate 400
    tabIconSelected: tintColorLight,
    primary: '#2563eb', // Blue 600
    primaryContainer: '#dbeafe', // Blue 100
    secondary: '#7c3aed', // Violet 600
    secondaryContainer: '#ede9fe', // Violet 100
    tertiary: '#059669', // Emerald 600
    tertiaryContainer: '#d1fae5', // Emerald 100
    error: '#dc2626', // Red 600
    errorContainer: '#fee2e2', // Red 100
    success: '#059669', // Emerald 600
    successContainer: '#d1fae5', // Emerald 100
    warning: '#d97706', // Amber 600
    warningContainer: '#fef3c7', // Amber 100
    outline: '#cbd5e1', // Slate 300
    outlineVariant: '#e2e8f0', // Slate 200
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#1e293b', // Slate 800
    inverseOnSurface: '#f1f5f9', // Slate 100
    inversePrimary: '#93c5fd', // Blue 300
    elevation: {
      level0: 'transparent',
      level1: '#ffffff',
      level2: '#ffffff',
      level3: '#ffffff',
      level4: '#ffffff',
      level5: '#ffffff',
    },
  },
  dark: {
    text: '#f8fafc', // Slate 50
    background: '#0f172a', // Slate 900
    surface: '#1e293b', // Slate 800
    surfaceVariant: '#334155', // Slate 700
    tint: tintColorDark,
    icon: '#94a3b8', // Slate 400
    tabIconDefault: '#64748b', // Slate 500
    tabIconSelected: tintColorDark,
    primary: '#3b82f6', // Blue 500
    primaryContainer: '#1e40af', // Blue 800
    secondary: '#8b5cf6', // Violet 500
    secondaryContainer: '#5b21b6', // Violet 800
    tertiary: '#10b981', // Emerald 500
    tertiaryContainer: '#065f46', // Emerald 800
    error: '#ef4444', // Red 500
    errorContainer: '#7f1d1d', // Red 800
    success: '#10b981', // Emerald 500
    successContainer: '#065f46', // Emerald 800
    warning: '#f59e0b', // Amber 500
    warningContainer: '#92400e', // Amber 800
    outline: '#475569', // Slate 600
    outlineVariant: '#334155', // Slate 700
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#f1f5f9', // Slate 100
    inverseOnSurface: '#1e293b', // Slate 800
    inversePrimary: '#1e40af', // Blue 800
    elevation: {
      level0: 'transparent',
      level1: '#1e293b', // Slate 800
      level2: '#334155', // Slate 700
      level3: '#475569', // Slate 600
      level4: '#64748b', // Slate 500
      level5: '#94a3b8', // Slate 400
    },
  },
};

// Belt colors with modern gradients - expanded to handle various belt name formats
export const BeltColors = {
  // Standard belt names
  White: { light: '#FFFFFF', dark: '#B0BEC5' },
  Yellow: { light: '#FFD600', dark: '#FBC02D' },
  Orange: { light: '#FF9800', dark: '#F57C00' },
  Purple: { light: '#8E24AA', dark: '#6A1B9A' },
  Blue: { light: '#1976D2', dark: '#0D47A1' },
  Green: { light: '#388E3C', dark: '#1B5E20' },
  Brown: { light: '#8D6E63', dark: '#4E342E' },
  Red: { light: '#D32F2F', dark: '#B71C1C' },
  Black: { light: '#212121', dark: '#000000' },
  
  // Actual belt names from the data
  yellow: { light: '#FFD600', dark: '#FBC02D' },
  orange: { light: '#FF9800', dark: '#F57C00' },
  purple: { light: '#8E24AA', dark: '#6A1B9A' },
  blue: { light: '#1976D2', dark: '#0D47A1' },
  green: { light: '#388E3C', dark: '#1B5E20' },
  'brown 3': { light: '#8D6E63', dark: '#4E342E' },
  'brown 2': { light: '#8D6E63', dark: '#4E342E' },
  'brown 1': { light: '#8D6E63', dark: '#4E342E' },
  'black 1': { light: '#212121', dark: '#000000' },
  'black 2': { light: '#212121', dark: '#000000' },
  'black 3': { light: '#212121', dark: '#000000' },
  'black 4': { light: '#212121', dark: '#000000' },
  'black 5': { light: '#212121', dark: '#000000' },
  'black 6': { light: '#212121', dark: '#000000' },
  'black 7': { light: '#212121', dark: '#000000' },
  'black 8': { light: '#212121', dark: '#000000' },
  'black 9': { light: '#212121', dark: '#000000' },
  'black 10': { light: '#212121', dark: '#000000' },
  lost: { light: '#B0BEC5', dark: '#78909C' }, // Gray for lost belt
  
  // Additional variations that might exist in the data
  'White Belt': { light: '#FFFFFF', dark: '#B0BEC5' },
  'Yellow Belt': { light: '#FFD600', dark: '#FBC02D' },
  'Orange Belt': { light: '#FF9800', dark: '#F57C00' },
  'Purple Belt': { light: '#8E24AA', dark: '#6A1B9A' },
  'Blue Belt': { light: '#1976D2', dark: '#0D47A1' },
  'Green Belt': { light: '#388E3C', dark: '#1B5E20' },
  'Brown Belt': { light: '#8D6E63', dark: '#4E342E' },
  'Red Belt': { light: '#D32F2F', dark: '#B71C1C' },
  'Black Belt': { light: '#212121', dark: '#000000' },
  
  // Fallback for any unknown belt names
  Default: { light: '#B0BEC5', dark: '#78909C' },
};

// Helper function to safely get belt color
export const getBeltColor = (beltName: string): keyof typeof BeltColors => {
  // First try exact match
  if (BeltColors[beltName as keyof typeof BeltColors]) {
    return beltName as keyof typeof BeltColors;
  }
  
  // Try with "Belt" suffix
  const withBelt = `${beltName} Belt`;
  if (BeltColors[withBelt as keyof typeof BeltColors]) {
    return withBelt as keyof typeof BeltColors;
  }
  
  // Try first word only
  const firstWord = beltName.split(' ')[0];
  if (BeltColors[firstWord as keyof typeof BeltColors]) {
    return firstWord as keyof typeof BeltColors;
  }
  
  // Return default if no match found
  return 'Default';
};

// Gradient definitions for modern UI
export const Gradients = {
  primary: ['#2563eb', '#1d4ed8'],
  secondary: ['#7c3aed', '#6d28d9'],
  success: ['#059669', '#047857'],
  warning: ['#d97706', '#b45309'],
  error: ['#dc2626', '#b91c1c'],
  surface: ['#f8fafc', '#f1f5f9'],
  surfaceDark: ['#1e293b', '#334155'],
};

// Explicit high-contrast text color mapping for each vivid belt
export const BeltTextColors: Record<string, string> = {
  White: '#000000',
  Yellow: '#000000',
  Orange: '#000000',
  Purple: '#FFFFFF',
  Blue: '#FFFFFF',
  Green: '#FFFFFF',
  Brown: '#FFFFFF',
  Red: '#FFFFFF',
  Black: '#FFFFFF',
  'brown 3': '#FFFFFF',
  'brown 2': '#FFFFFF',
  'brown 1': '#FFFFFF',
  'black 1': '#FFFFFF',
  'black 2': '#FFFFFF',
  'black 3': '#FFFFFF',
  'black 4': '#FFFFFF',
  'black 5': '#FFFFFF',
  'black 6': '#FFFFFF',
  'black 7': '#FFFFFF',
  'black 8': '#FFFFFF',
  'black 9': '#FFFFFF',
  'black 10': '#FFFFFF',
  lost: '#000000',
  Default: '#000000',
};

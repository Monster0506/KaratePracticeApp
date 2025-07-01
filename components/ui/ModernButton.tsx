import { BeltColors, BeltTextColors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, ViewStyle, useColorScheme } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

interface ModernButtonProps {
  mode?: 'contained' | 'outlined' | 'text';
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'belt';
  beltColor?: keyof typeof BeltColors;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  compact?: boolean;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  mode = 'contained',
  onPress,
  children,
  style,
  variant = 'primary',
  beltColor,
  disabled = false,
  loading = false,
  icon,
  compact = false,
}) => {
  const theme = useTheme();
  const colorScheme = useColorScheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 16,
      marginVertical: 4,
    };

    if (compact) {
      baseStyle.paddingVertical = 8;
      baseStyle.paddingHorizontal = 16;
    }

    if (variant === 'belt' && beltColor) {
      const beltColorObj = BeltColors[beltColor];
      const isDark = colorScheme === 'dark';
      const color = isDark ? beltColorObj.dark : beltColorObj.light;
      
      return {
        ...baseStyle,
        backgroundColor: mode === 'contained' ? color : 'transparent',
        borderColor: color,
        borderWidth: mode === 'outlined' ? 2 : 0,
      };
    }

    return baseStyle;
  };

  const getContentStyle = () => {
    // Remove text color from contentStyle for belt buttons
    return {} as ViewStyle;
  };

  const getLabelStyle = () => {
    if (variant === 'belt' && beltColor) {
      // Use explicit text color for each belt from constants/Colors
      const textColor = BeltTextColors[beltColor] || BeltTextColors.Default;
      return [{ color: textColor }, styles.beltLabel];
    }
    return compact ? styles.compactLabel : styles.label;
  };

  return (
    <Button
      mode={mode}
      onPress={onPress}
      style={[getButtonStyle(), style]}
      contentStyle={getContentStyle()}
      disabled={disabled}
      loading={loading}
      icon={icon}
      labelStyle={getLabelStyle()}
    >
      {children}
    </Button>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  compactLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  beltLabel: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
}); 
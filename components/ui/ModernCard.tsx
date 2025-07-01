import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

interface ModernCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'small' | 'medium' | 'large';
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  style,
  variant = 'elevated',
  padding = 'medium',
}) => {
  const theme = useTheme();

  const getCardStyle = () => {
    const baseStyle = {
      borderRadius: 16,
      overflow: 'hidden' as const,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.surface,
          elevation: 8,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.outline,
        };
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.surfaceVariant,
        };
      default:
        return baseStyle;
    }
  };

  const getPaddingStyle = () => {
    switch (padding) {
      case 'small':
        return { padding: 12 };
      case 'large':
        return { padding: 24 };
      default:
        return { padding: 16 };
    }
  };

  return (
    <View style={[getCardStyle(), getPaddingStyle(), style]}>
      {children}
    </View>
  );
}; 
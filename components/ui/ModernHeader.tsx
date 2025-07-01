import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';

interface ModernHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
  variant?: 'default' | 'large' | 'compact';
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  rightAction,
  variant = 'default',
}) => {
  const theme = useTheme();
  const router = useRouter();

  const getTitleStyle = () => {
    switch (variant) {
      case 'large':
        return {
          fontSize: 32,
          fontWeight: '700' as const,
          letterSpacing: -0.5,
        };
      case 'compact':
        return {
          fontSize: 18,
          fontWeight: '600' as const,
        };
      default:
        return {
          fontSize: 24,
          fontWeight: '700' as const,
          letterSpacing: -0.25,
        };
    }
  };

  const getSubtitleStyle = () => {
    return {
      fontSize: variant === 'large' ? 16 : 14,
      fontWeight: '400' as const,
      opacity: 0.7,
      marginTop: variant === 'large' ? 8 : 4,
    };
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {showBack && (
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => router.back()}
            iconColor={theme.colors.onBackground}
            style={styles.backButton}
          />
        )}
        
        <View style={styles.textContainer}>
          <Text
            variant="headlineMedium"
            style={[
              getTitleStyle(),
              { color: theme.colors.onBackground },
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              variant="bodyMedium"
              style={[
                getSubtitleStyle(),
                { color: theme.colors.onBackground },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {rightAction && (
          <IconButton
            icon={rightAction.icon}
            size={24}
            onPress={rightAction.onPress}
            iconColor={theme.colors.onBackground}
            style={styles.rightButton}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  rightButton: {
    marginLeft: 8,
  },
}); 
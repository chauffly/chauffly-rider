import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/context/theme-context';

type MapUnavailableProps = {
  style?: StyleProp<ViewStyle>;
  title?: string;
  description?: string;
};

export function MapUnavailable({
  style,
  title = 'Map unavailable',
  description = 'Update the app build to restore map display on this screen.'
}: MapUnavailableProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border
        },
        style
      ]}
    >
      <Ionicons name="map-outline" size={36} color={colors.primary} />
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 32
  },
  title: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center'
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center'
  }
});

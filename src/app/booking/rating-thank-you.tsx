import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Text } from '@/components/common/text';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { Button } from '@/components/common/button';

export default function RatingThankYouScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg }]}> 
      <Pressable onPress={() => router.back()} style={styles.closeButton}>
        <MaterialCommunityIcons name="close" size={36} color={colors.textPrimary} />
      </Pressable>

      <View style={[styles.centerBadge, { backgroundColor: colors.primary }]}> 
        <MaterialCommunityIcons name="check" size={54} color={colors.white} />
      </View>

      <Text variant="h2" weight="medium" align="center" style={styles.title}>
        Appreciate your reply!
      </Text>
      <Text variant="body" color="muted" align="center">
        Looking forward to our next journey together
      </Text>

       <Button
              title="Okay"
              fullWidth
        navigateTo="/(tabs)"  
        style={styles.okButton}
      />
      
     
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  closeButton: {
    alignSelf: 'flex-start',
  },
  centerBadge: {
    width: 136,
    height: 136,
    borderRadius: 68,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 170,
  },
  title: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  okButton: {
    marginTop: 'auto', 
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
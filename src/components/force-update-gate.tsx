import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AppState,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { fetchVersionGate, type VersionGateResult } from '@/services/app-version';

interface ForceUpdateGateProps {
  children: ReactNode;
}

/**
 * Blocks the entire UI when the installed app version is below the server's
 * minimum required version. Fails open: if the check errors or is still
 * pending, children render normally so users are never locked out by a
 * transient network/endpoint failure.
 */
export function ForceUpdateGate({ children }: ForceUpdateGateProps): React.JSX.Element {
  const [gate, setGate] = useState<VersionGateResult | null>(null);

  const check = useCallback(async () => {
    try {
      setGate(await fetchVersionGate());
    } catch {
      setGate({
        updateRequired: false,
        storeUrl: null,
        minimumVersion: null,
        latestVersion: null
      });
    }
  }, []);

  useEffect(() => {
    void check();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void check();
      }
    });
    return () => subscription.remove();
  }, [check]);

  const openStore = useCallback(() => {
    if (gate?.storeUrl) {
      void Linking.openURL(gate.storeUrl).catch(() => undefined);
    }
  }, [gate?.storeUrl]);

  if (gate?.updateRequired) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Update required</Text>
          <Text style={styles.message}>
            A newer version of Chauffly is required to continue. Please update to the
            latest version to keep using the app.
          </Text>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.button,
              !gate.storeUrl && styles.buttonDisabled,
              pressed && styles.buttonPressed
            ]}
            onPress={openStore}
            disabled={!gate.storeUrl}
          >
            <Text style={styles.buttonText}>Update now</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09111c',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#111c2b',
    borderRadius: 20,
    padding: 28,
    gap: 16
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700'
  },
  message: {
    color: '#aebacc',
    fontSize: 15,
    lineHeight: 22
  },
  button: {
    marginTop: 8,
    backgroundColor: '#c29d59',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center'
  },
  buttonDisabled: {
    opacity: 0.5
  },
  buttonPressed: {
    opacity: 0.85
  },
  buttonText: {
    color: '#09111c',
    fontSize: 16,
    fontWeight: '700'
  }
});

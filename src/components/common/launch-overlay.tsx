import { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';

const FADE_DURATION_MS = 320;

// The native splash is intentionally just the dark #04070F background — its
// image is a transparent pixel (see app.json), so there is no logo to "jump"
// from. This overlay renders the full branded splash on top of that same
// background, so the handoff from the native splash is invisible; only the final
// fade-out to the app is ever perceptible. The handoff is gated on the image
// actually decoding (onLoadEnd) so the branded art never blinks in over a bare
// background.
export function LaunchOverlay({
  visible,
  onImageLoaded
}: {
  visible: boolean;
  onImageLoaded?: () => void;
}) {
  const opacity = useRef(new Animated.Value(1)).current;
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      opacity.setValue(1);
      return;
    }

    const anim = Animated.timing(opacity, {
      toValue: 0,
      duration: FADE_DURATION_MS,
      useNativeDriver: true
    });

    anim.start(({ finished }) => {
      if (finished) {
        setMounted(false);
      }
    });

    return () => anim.stop();
  }, [visible, opacity]);

  if (!mounted) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[styles.fill, { opacity }]}
    >
      <Image
        source={require('@assets/images/full-splash-image.png')}
        style={styles.fill}
        resizeMode="cover"
        fadeDuration={0}
        onLoadEnd={onImageLoaded}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#04070F',
    width: '100%',
    height: '100%'
  }
});

import { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';

const FADE_DURATION_MS = 320;

// The activity's native windowBackground is already the full branded splash
// image (Android: res/drawable/splashscreen_window + styles.xml; iOS: the launch
// storyboard), so the full splash is on screen the instant the system splash
// dismisses — no JS, no image decode, no lag. This overlay just layers the
// identical full-splash image on top so we can control the brand-minimum hold
// and the fade-out into the app. Its container is transparent (not a dark fill)
// so that while this overlay's own copy of the image is still decoding, the
// native windowBackground shows through unchanged rather than flashing dark.
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
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%'
  }
});

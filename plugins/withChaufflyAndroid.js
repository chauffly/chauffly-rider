// Expo config plugin (Android) that makes the branded splash render with no lag
// and no small system-splash icon, and trims the build to phone ABIs.
//
// Applied during `expo prebuild` (so it also runs inside `eas build`), it:
//   1. Paints the activity windowBackground with the full splash image, so the
//      full-bleed splash is on screen the instant the system splash clears — no
//      JS, no image-decode lag.
//   2. Points the Android 12+ system-splash icon at a transparent drawable so no
//      small icon flashes before the full splash; only the dark #04070F shows.
//   3. Drops the emulator-only x86 / x86_64 ABIs from the build.
//
// Must be listed AFTER 'expo-splash-screen' in the plugins array so its styles
// override wins over the splash plugin's.
const {
  withAndroidStyles,
  withGradleProperties,
  withDangerousMod,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const FULL_SPLASH_ASSET = 'assets/images/full-splash-image.png';

const WINDOW_DRAWABLE = `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splashscreen_background" />
    <item>
        <bitmap android:src="@drawable/splashscreen_full" android:gravity="fill" />
    </item>
</layer-list>
`;

const BLANK_DRAWABLE = `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
    <solid android:color="@android:color/transparent" />
</shape>
`;

// Android 12+ (API 31) override of the splash theme that points the system-splash
// animated icon at the transparent drawable, so no small icon shows before the
// full splash. Written as its own values-v31 file so it does not depend on plugin
// mod ordering relative to expo-splash-screen.
const SPLASH_THEME_V31 = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.App.SplashScreen" parent="Theme.SplashScreen">
        <item name="windowSplashScreenBackground">@color/splashscreen_background</item>
        <item name="windowSplashScreenAnimatedIcon">@drawable/splashscreen_blank</item>
        <item name="postSplashScreenTheme">@style/AppTheme</item>
        <item name="android:windowSplashScreenBehavior">icon_preferred</item>
    </style>
</resources>
`;

// Write our own drawables. These have unique names, so the splash plugin's own
// file generation never collides with or overwrites them regardless of mod order.
function withSplashFiles(config) {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const resDir = path.join(
        cfg.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'res'
      );
      const drawableDir = path.join(resDir, 'drawable');
      const nodpi = path.join(resDir, 'drawable-nodpi');
      fs.mkdirSync(drawableDir, { recursive: true });
      fs.mkdirSync(nodpi, { recursive: true });

      // Full splash image as a density-independent drawable for windowBackground.
      fs.copyFileSync(
        path.join(cfg.modRequest.projectRoot, FULL_SPLASH_ASSET),
        path.join(nodpi, 'splashscreen_full.png')
      );
      fs.writeFileSync(path.join(drawableDir, 'splashscreen_window.xml'), WINDOW_DRAWABLE);
      fs.writeFileSync(path.join(drawableDir, 'splashscreen_blank.xml'), BLANK_DRAWABLE);

      // API 31+ splash theme override (transparent system-splash icon).
      const valuesV31 = path.join(resDir, 'values-v31');
      fs.mkdirSync(valuesV31, { recursive: true });
      fs.writeFileSync(path.join(valuesV31, 'styles.xml'), SPLASH_THEME_V31);
      return cfg;
    },
  ]);
}

function setItem(style, name, value) {
  style.item = style.item || [];
  const existing = style.item.find((i) => i.$ && i.$.name === name);
  if (existing) existing._ = value;
  else style.item.push({ $: { name }, _: value });
}

function withSplashStyles(config) {
  return withAndroidStyles(config, (cfg) => {
    const styles = cfg.modResults.resources.style || [];
    const appTheme = styles.find((s) => s.$ && s.$.name === 'AppTheme');
    if (appTheme) {
      // Full-bleed splash behind the JS view, painted natively (no lag).
      // The transparent system-splash icon is handled by the values-v31 override
      // written in withSplashFiles (mod ordering makes editing it here unreliable).
      setItem(appTheme, 'android:windowBackground', '@drawable/splashscreen_window');
    }
    return cfg;
  });
}

function withGradleTuning(config) {
  return withGradleProperties(config, (cfg) => {
    const set = (key, value) => {
      cfg.modResults = cfg.modResults.filter(
        (p) => !(p.type === 'property' && p.key === key)
      );
      cfg.modResults.push({ type: 'property', key, value });
    };
    // Drop emulator-only ABIs -> smaller artifact, real phones unaffected.
    set('reactNativeArchitectures', 'armeabi-v7a,arm64-v8a');
    // Skip AAPT2 PNG crunching in release: the image assets are already
    // compressed, and crunching large PNGs intermittently times out the AAPT2
    // daemon under load. Disabling it makes release/bundle builds reliable.
    set('android.enablePngCrunchInReleaseBuilds', 'false');
    return cfg;
  });
}

module.exports = function withChaufflyAndroid(config) {
  config = withSplashFiles(config);
  config = withSplashStyles(config);
  config = withGradleTuning(config);
  return config;
};

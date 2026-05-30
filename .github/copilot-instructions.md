# React Native Project Development Instructions

> **IMPORTANT:** Always read and follow these instructions when working on this project.

---

## 1. Text Rendering

- **All text must be rendered using a single custom `Text` component.**
- Do not use React Native's native `<Text>` component directly anywhere in the app.
- The custom `Text` component should handle:
  - Typography variants (heading, body, caption, label, etc.)
  - Font weights and sizes
  - Color theming (light/dark mode)
  - Translation integration

```tsx
// Location: /src/components/common/Text.tsx

// Example usage
import { Text } from '@/components/common/Text';

<Text variant="h1" translationKey="welcome_message" />
<Text variant="body" color="secondary">Static text here</Text>
<Text variant="caption">{t('common.footer_note')}</Text>
```

### Text Component Props (Suggested)
```tsx
interface TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'label' | 'button';
  color?: 'primary' | 'secondary' | 'error' | 'success' | 'muted';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
  translationKey?: string;
  translationParams?: Record<string, string | number>;
  children?: React.ReactNode;
  style?: TextStyle;
  numberOfLines?: number;
}
```

---

## 2. Internationalization (i18n)

### Supported Languages
| Language | Code | Native Name |
|----------|------|-------------|
| English | `en` | English (Default) |
| Hausa | `ha` | Hausa |
| Igbo | `ig` | Igbo |
| Yoruba | `yo` | Yorùbá |

### Translation Requirements

- **Every user-facing string must be translatable.**
- Use a translation function (`t()`) or hook (`useTranslation`) for all text content.
- Recommended library: `react-i18next` or `expo-localization` with `i18n-js`.
- Translation keys should be descriptive and organized by feature/screen.
- Never hardcode display text directly in components.

```tsx
// ✅ Correct
import { useTranslation } from '@/hooks/useTranslation';

const { t } = useTranslation();
<Text>{t('login.welcome_message')}</Text>
<Text translationKey="login.submit_button" />
<Text>{t('profile.greeting', { name: userName })}</Text>

// ❌ Incorrect
<Text>Welcome to the app</Text>
<Text>Login</Text>
```

### Translation File Structure
```
/src/locales
  /en.json      # English translations
  /ha.json      # Hausa translations
  /ig.json      # Igbo translations
  /yo.json      # Yoruba translations
  /index.ts     # Export all translations
```

### Translation File Example
```json
// en.json
{
  "common": {
    "continue": "Continue",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "loading": "Loading..."
  },
  "auth": {
    "login": "Login",
    "signup": "Sign Up",
    "forgot_password": "Forgot Password?",
    "email_placeholder": "Enter your email",
    "password_placeholder": "Enter your password"
  },
  "home": {
    "welcome": "Welcome back, {{name}}!",
    "recent_activity": "Recent Activity"
  }
}
```

### When Building Components
1. Always accept translation keys as props where text is displayed.
2. Provide fallback to English if translation is missing.
3. Consider text length variations across languages in UI layout.
4. Test with longer translations (Yoruba/Igbo often longer than English).

---

## 3. Reusable Components

### Before Creating a New Component

1. **Check if a similar component already exists** in the `/src/components` directory.
2. Review existing components that might be extended or modified.
3. Search the codebase: `components/common`, `components/ui`, `components/forms`.
4. If creating a new reusable component, place it in the appropriate folder.

### Component Directory Structure
```
/src/components
  /common         # Shared across entire app (Text, Button, Icon, Avatar)
  /ui             # UI elements (Card, Badge, Chip, Divider, Modal)
  /forms          # Form components (Input, Select, Checkbox, RadioButton)
  /layout         # Layout components (Container, Row, Column, Spacer)
  /navigation     # Navigation components (Header, TabBar, BottomSheet)
  /feedback       # Feedback components (Toast, Snackbar, Skeleton, Loader)
```

### Component Checklist
- [ ] Does this component already exist?
- [ ] Can an existing component be extended with new props?
- [ ] Is this component reusable across multiple screens?
- [ ] Does it support theming (dark/light mode)?
- [ ] Does it handle translations properly?
- [ ] Is it accessible (accessibilityLabel, accessibilityRole)?

---

## 4. Color Management & Theming

### Color Constants

- **All colors must be defined in a central constants file.**
- Location: `/src/constants/colors.ts`
- Never use hardcoded color values (hex, rgb, etc.) directly in components.

```tsx
// ✅ Correct
import { useTheme } from '@/hooks/useTheme';

const { colors } = useTheme();
<View style={{ backgroundColor: colors.background }} />
<Text style={{ color: colors.textPrimary }}>Hello</Text>

// ❌ Incorrect
<View style={{ backgroundColor: '#FFFFFF' }} />
<View style={{ backgroundColor: 'white' }} />
<Text style={{ color: '#333' }}>Hello</Text>
```



### Theme Context Setup

```tsx
// /src/context/ThemeContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, ThemeColors } from '@/constants/colors';

interface ThemeContextType {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

---

## 5. File Structure Guidelines

```
/src
  /assets
    /fonts            # Custom fonts
    /images           # Static images
    /icons            # Icon assets (if not using icon library)
    /animations       # Lottie files
  
  /components
    /common           # Text, Button, Icon, Avatar, Image
    /ui               # Card, Badge, Chip, Modal, BottomSheet
    /forms            # Input, Select, Checkbox, Switch, DatePicker
    /layout           # Container, Row, Column, Spacer, SafeArea
    /navigation       # Header, TabBar, DrawerContent
    /feedback         # Toast, Loader, Skeleton, EmptyState
  
  /screens
    /Auth             # Login, Signup, ForgotPassword
    /Home             # HomeScreen
    /Profile          # ProfileScreen, EditProfile
    /Settings         # SettingsScreen
  
  /navigation
    /RootNavigator.tsx
    /AuthNavigator.tsx
    /MainNavigator.tsx
    /types.ts
  
  /constants
    /colors.ts        # Color definitions (light & dark)
    /spacing.ts       # Spacing scale (4, 8, 12, 16, 20, 24...)
    /typography.ts    # Font sizes, weights, line heights
    /layout.ts        # Screen dimensions, safe areas
    /config.ts        # App configuration
  
  /hooks
    /useTheme.ts
    /useTranslation.ts
    /useAuth.ts
    /useStorage.ts
  
  /locales
    /en.json
    /ha.json
    /ig.json
    /yo.json
    /index.ts
  
  /context
    /ThemeContext.tsx
    /LanguageContext.tsx
    /AuthContext.tsx
  
  /services
    /api.ts           # API client
    /storage.ts       # AsyncStorage helpers
  
  /utils
    /helpers.ts
    /validation.ts
    /formatting.ts
  
  /types
    /theme.ts
    /navigation.ts
    /api.ts

  /App.tsx
```

---

## 6. Spacing & Typography Constants

### Spacing
```tsx
// /src/constants/spacing.ts

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;
```

### Typography
```tsx
// /src/constants/typography.ts

export const fontFamily = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semibold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
} as const;

export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  h3: 24,
  h2: 28,
  h1: 32,
} as const;

export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;
```

---

## 7. Component Development Checklist

When creating or modifying any component, ensure:

- [ ] Uses custom `Text` component for all text rendering
- [ ] All user-facing strings use translation function (`t()`)
- [ ] Colors obtained from `useTheme()` hook
- [ ] Tested in both dark and light mode
- [ ] Checked for existing reusable components first
- [ ] Follows naming conventions
- [ ] Props are properly typed (TypeScript)
- [ ] Includes accessibility props (`accessibilityLabel`, `accessibilityRole`)
- [ ] Uses spacing constants, not hardcoded numbers
- [ ] Works on both iOS and Android
- [ ] Handles loading and error states if applicable

---

## 8. Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `CustomButton.tsx` |
| Screens | PascalCase + Screen | `HomeScreen.tsx` |
| Hooks | camelCase with 'use' prefix | `useTheme.ts` |
| Context | PascalCase + Context | `ThemeContext.tsx` |
| Constants | camelCase (objects) / UPPER_CASE (primitives) | `colors.ts` / `API_URL` |
| Translation keys | dot.notation.snake_case | `auth.login_button` |
| Style objects | camelCase | `containerStyle` |
| Props interfaces | PascalCase + Props | `ButtonProps` |

---

## 9. Accessibility Requirements

- All interactive elements must have `accessibilityLabel`
- Use `accessibilityRole` appropriately (`button`, `link`, `header`, etc.)
- Ensure minimum touch target size of 44x44 points
- Test with screen readers (VoiceOver/TalkBack)
- Provide `accessibilityHint` for complex interactions

```tsx
<TouchableOpacity
  accessibilityLabel={t('common.submit')}
  accessibilityRole="button"
  accessibilityHint={t('accessibility.submits_form')}
>
  <Text>{t('common.submit')}</Text>
</TouchableOpacity>
```

---

## 10. Quick Reference

### Custom Text Component
```tsx
import { Text } from '@/components/common/Text';
```

### Theme Hook
```tsx
import { useTheme } from '@/hooks/useTheme';
const { colors, isDark, toggleTheme } = useTheme();
```

### Translation Hook
```tsx
import { useTranslation } from '@/hooks/useTranslation';
const { t, currentLanguage, changeLanguage } = useTranslation();

// With parameters
t('greeting', { name: 'John' }) // "Hello, John!"
```

### Spacing
```tsx
import { spacing } from '@/constants/spacing';
<View style={{ padding: spacing.lg, marginBottom: spacing.md }} />
```

---

## 11. Common Mistakes to Avoid

| ❌ Don't | ✅ Do |
|----------|-------|
| `<Text>Hello</Text>` (native) | `<Text>{t('greeting')}</Text>` (custom) |
| `color: '#FF0000'` | `color: colors.error` |
| `padding: 16` | `padding: spacing.lg` |
| `fontSize: 14` | `fontSize: fontSize.md` or use Text variant |
| Create duplicate components | Check `/components` first |
| Ignore dark mode | Test with `isDark` toggle |
| Hardcode strings | Use translation keys |
| Skip accessibility | Add `accessibilityLabel` |

---

## 12. Testing Checklist Before PR

- [ ] All text uses custom Text component
- [ ] All strings are translated (check all 4 languages)
- [ ] Light mode works correctly
- [ ] Dark mode works correctly
- [ ] iOS tested
- [ ] Android tested
- [ ] No hardcoded colors
- [ ] No hardcoded spacing values
- [ ] Accessibility labels added
- [ ] No TypeScript errors
- [ ] Component documented with props

---

## 13. Remember

> **Every time you build a feature:**
> 1. 📝 Use the custom `Text` component — NEVER use React Native's `<Text>` directly
> 2. 🌍 Make all text translatable (EN, HA, IG, YO) — use `t()` function
> 3. 🎨 Get colors from `useTheme()` — NEVER hardcode color values
> 4. 🌓 Support dark and light modes — test both themes
> 5. ♻️ Check for existing reusable components — don't duplicate
> 6. 📏 Use spacing constants — avoid magic numbers
> 7. ♿ Add accessibility props — make the app inclusive

---

*Last Updated: December 2024*
*Framework: React Native*
*Languages: English, Hausa, Igbo, Yoruba*
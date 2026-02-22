import { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/common/text";
import { TextInput } from "@/components/common/text-input";
import { Button } from "@/components/common/button";
import { SocialButton } from "@/components/common/social-button";
import { useTheme } from "@/context/theme-context";
import { useTranslation } from "@/context/language-context";
import { spacing } from "@/constants/spacing";
import CallOutline from "@/components/svg/CallOutline";
import Password from "@/components/svg/Password";
import { localJsonApi } from '@/api/local-json-api';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();



  const authDefaults = localJsonApi.getAuthDefaults();
  const [phoneNumber, setPhoneNumber] = useState(authDefaults.login.phone_number);
  const [password, setPassword] = useState(authDefaults.login.password);
  const [phoneError, setPhoneError] = useState("");

  const handleLogin = () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setPhoneError(t("auth.invalid_phone"));
      return;
    }
    setPhoneError("");
    router.replace("/(tabs)");
  };

  const handleForgotPassword = () => {
    router.push("/(auth)/forgot-password");
  };

  const handleSignUp = () => {
    router.push("/(auth)/register");
  };

  const handleGoogleLogin = () => {
    // TODO: Implement Google login
  };

  const handleAppleLogin = () => {
    // TODO: Implement Apple login
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style={colors.statusBar as "light" | "dark"} />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + spacing.xxl,
            paddingBottom: insets.bottom + spacing.xxl,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={require("../../../assets/images/logo-sm.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <Text variant="h1" font="medium" align="center" style={styles.title}>
            {t("auth.welcome_back")}
          </Text>
          <Text variant="body" color="muted" align="center">
            {t("auth.login_subtitle")}
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            labelTranslationKey="auth.phone_number"
            placeholderTranslationKey="auth.phone_placeholder"
            leftIcon={<CallOutline />}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={(text) => {
              setPhoneNumber(text);
              if (phoneError) setPhoneError("");
            }}
            error={phoneError}
          />

          <TextInput
            labelTranslationKey="auth.password"
            placeholderTranslationKey="auth.password_placeholder"
            leftIcon={<Password />}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            onPress={handleForgotPassword}
            style={styles.forgotPassword}
          >
            <Text
              variant="bodySmall"
              weight="medium"
              style={{ textDecorationLine: "underline" }}
            >
              {t("auth.forgot_password")}
            </Text>
          </Pressable>

          <Button
            translationKey="auth.log_in"
            variant="primary"
            fullWidth
            onPress={handleLogin}
            style={styles.loginButton}
          />
        </View>

        <View style={styles.dividerContainer}>
          <View
            style={[styles.dividerLine, { backgroundColor: colors.border }]}
          />
          <Text variant="caption" color="muted" style={styles.dividerText}>
            {t("auth.or_continue_with")}
          </Text>
          <View
            style={[styles.dividerLine, { backgroundColor: colors.border }]}
          />
        </View>

        <View style={styles.socialButtons}>
          <SocialButton provider="google" onPress={handleGoogleLogin} />
          <SocialButton provider="apple" onPress={handleAppleLogin} />
        </View>

        <View style={styles.footer}>
          <Text variant="bodySmall" color="muted">
            {t("auth.no_account")}{" "}
          </Text>
          <Pressable onPress={handleSignUp}>
            <Text
              variant="bodySmall"
              weight="medium"
              style={{ textDecorationLine: "underline" }}
            >
              {t("auth.sign_up")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xxxl,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    marginBottom: spacing.sm,
  },
  form: {
    marginBottom: spacing.xxl,
  },
  forgotPassword: {
    alignSelf: "flex-start",
    marginBottom: spacing.xl,
  },
  loginButton: {
    marginTop: spacing.md,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: spacing.lg,
  },
  socialButtons: {
    flexDirection: "row",
    gap: spacing.lg,
    marginBottom: spacing.xxxl,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});

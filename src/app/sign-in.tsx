import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { getAuthAdapter, useSessionStore } from "@/features/auth";
import {
  signInSchema,
  type SignInFormValues,
} from "@/features/example/models/form.schema";
import { Alert, AppText, Button, Card, Input, Screen } from "@/shared/components";
import { useFieldError } from "@/shared/hooks";
import type { ApiError } from "@/shared/models";
import { useStyles, view } from "@/styles";

/** DummyJSON publishes these; they are the only way to see the happy path. */
const DEMO = { username: "emilys", password: "emilyspass" } as const;

export default function SignInScreen() {
  const styles = useStyles();
  const { t } = useTranslation();
  const fieldError = useFieldError();

  const signIn = useSessionStore((state) => state.signIn);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { username: "", password: "" },
  });

  const {
    mutate: submitSignIn,
    error: signInError,
    isPending: isSigningIn,
  } = useMutation({
    mutationFn: (values: SignInFormValues) => getAuthAdapter().signIn(values),
    // Nothing navigates here: storing the session removes this route from the
    // navigator, and that is what moves the user.
    onSuccess: signIn,
  });

  const apiError = signInError as ApiError | null;

  return (
    <>
      <Stack.Screen options={{ title: t("features.example.signIn.title") }} />
      <Screen keyboardAvoiding>
        <AppText variant="h2">{t("features.example.signIn.title")}</AppText>
        <AppText variant="caption" color="muted" style={styles.mb6}>
          {t("features.example.signIn.subtitle")}
        </AppText>

        <View testID="sign-in-form" style={view(styles.gap4)}>
          <Card variant="filled">
            <Card.Header
              title={t("features.example.signIn.demo.title")}
              subtitle={t("features.example.signIn.demo.description")}
            />
            <Card.Body>
              <AppText variant="mono" color="muted">
                {DEMO.username} / {DEMO.password}
              </AppText>
            </Card.Body>
            <Card.Footer style={styles.mt3}>
              <Button
                title={t("features.example.signIn.demo.fill")}
                variant="ghost"
                size="sm"
                onPress={() => {
                  setValue("username", DEMO.username);
                  setValue("password", DEMO.password);
                }}
              />
            </Card.Footer>
          </Card>

          {apiError ? (
            <Alert
              variant="error"
              title={t("features.example.signIn.error.title")}
              description={
                apiError.isNetworkError
                  ? t("utils.error.network")
                  : apiError.message
              }
            />
          ) : null}

          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t("features.example.signIn.field.username.label")}
                placeholder={t("features.example.signIn.field.username.placeholder")}
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={fieldError(errors.username?.message)}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t("features.example.signIn.field.password.label")}
                placeholder={t("features.example.signIn.field.password.placeholder")}
                type="password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={fieldError(errors.password?.message)}
              />
            )}
          />

          <Button
            title={t("features.example.signIn.action.signIn")}
            size="lg"
            block
            loading={isSigningIn}
            disabled={isSigningIn}
            onPress={handleSubmit((values) => submitSignIn(values))}
          />
        </View>
      </Screen>
    </>
  );
}

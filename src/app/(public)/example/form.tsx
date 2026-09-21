import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

import { Alert, AppText, Button, Card, Input, Screen } from "@/shared/components";
import { useStyles, view } from "@/styles";

type FormData = {
  name: string;
  email: string;
  phone: string;
  password: string;
  bio: string;
};

export default function FormExample() {
  const styles = useStyles();
  const [submitted, setSubmitted] = useState<FormData | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      bio: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmitted(data);
  };

  const handleClear = () => {
    reset();
    setSubmitted(null);
  };

  return (
    <Screen keyboardAvoiding>
      <AppText variant="h2">Form Example</AppText>
      <AppText variant="caption" color="muted" style={styles.mb6}>
        react-hook-form with shared Input and Button components
      </AppText>

      <View style={view(styles.gap4)}>
        <Controller
          control={control}
          name="name"
          rules={{ required: "Name is required" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          rules={{
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email address",
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              placeholder="john@example.com"
              type="email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          rules={{
            required: "Phone is required",
            minLength: {
              value: 10,
              message: "Phone must be at least 10 digits",
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Phone"
              placeholder="+1 (555) 000-0000"
              type="phone"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.phone?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Password"
              placeholder="••••••••"
              type="password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.password?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="bio"
          rules={{ maxLength: { value: 200, message: "Bio too long" } }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Bio"
              placeholder="Tell us about yourself..."
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.bio?.message}
              multiline
              numberOfLines={3}
              style={{ height: 80, textAlignVertical: "top" }}
            />
          )}
        />

        <View style={view(styles.gap3)}>
          <Button
            title={isSubmitting ? "Submitting..." : "Submit"}
            variant="primary"
            size="lg"
            block
            loading={isSubmitting}
            disabled={isSubmitting}
            onPress={handleSubmit(onSubmit)}
          />

          <Button title="Clear" variant="outline" size="md" block onPress={handleClear} />
        </View>

        {submitted ? (
          <Card variant="outlined" style={styles.mt2}>
            <Card.Body>
              <Alert
                variant="success"
                title="Submitted"
                description="These are the values the form handed over."
              />
              <View style={view(styles.gap1, styles.mt3)}>
                {Object.entries(submitted).map(([key, value]) => (
                  <AppText key={key} variant="mono" color="muted">
                    {key}: {value}
                  </AppText>
                ))}
              </View>
            </Card.Body>
          </Card>
        ) : null}
      </View>
    </Screen>
  );
}

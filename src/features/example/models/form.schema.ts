import { z } from "zod";

import { translationKey } from "@/shared/models/i18n";

/**
 * Validation messages are translation *keys*, not finished sentences.
 *
 * A schema is built once at module load, long before a language is chosen, so
 * baking a sentence in here would pin every error to whatever language was
 * active at import time. The form translates `error.message` at render, which
 * means a message follows a language switch without the schema knowing one
 * exists — and a test can assert the key rather than a sentence.
 *
 * `translationKey()` is an identity function that exists only to type-check the
 * literal: zod types its message slot as `string`, so a typo would otherwise
 * reach the screen.
 */

export const signInSchema = z.object({
  username: z
    .string()
    .min(3, translationKey("features.example.signIn.validation.usernameMin")),
  password: z
    .string()
    .min(6, translationKey("features.example.signIn.validation.passwordMin")),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

export const todoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, translationKey("features.example.todos.validation.titleMin"))
    .max(100, translationKey("features.example.todos.validation.titleMax")),
});

export type TodoFormValues = z.infer<typeof todoSchema>;

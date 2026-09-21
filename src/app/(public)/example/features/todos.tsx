import { zodResolver } from "@hookform/resolvers/zod";
import { Stack } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { todoSchema, type TodoFormValues } from "@/features/example/models/form.schema";
import {
  filterTodos,
  todoProgress,
  useTodosStore,
  type TodoFilter,
} from "@/features/example/stores/todos.store";
import {
  AppText,
  Button,
  Card,
  Checkbox,
  Dialog,
  Divider,
  EmptyState,
  Input,
  ProgressBar,
  Screen,
  Tabs,
  useToast,
} from "@/shared/components";
import { formatRelativeTime } from "@/shared/helpers";
import { useFieldError } from "@/shared/hooks";
import { useStyles, view } from "@/styles";

export default function TodosScreen() {
  const styles = useStyles();
  const toast = useToast();
  const { t } = useTranslation();
  const fieldError = useFieldError();

  const todos = useTodosStore((state) => state.todos);
  const add = useTodosStore((state) => state.add);
  const toggle = useTodosStore((state) => state.toggle);
  const remove = useTodosStore((state) => state.remove);
  const clearCompleted = useTodosStore((state) => state.clearCompleted);

  const [filter, setFilter] = useState<TodoFilter>("all");
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: { title: "" },
  });

  const visible = filterTodos(todos, filter);
  const progress = todoProgress(todos);
  const hasCompleted = progress.done > 0;

  const handleAdd = handleSubmit(({ title }) => {
    add(title);
    reset();
    toast.success(t("features.example.todos.toast.added"));
  });

  const confirmRemoval = () => {
    if (pendingRemoval) remove(pendingRemoval);
    setPendingRemoval(null);
    toast.info(t("features.example.todos.toast.removed"));
  };

  return (
    <>
      <Stack.Screen options={{ title: t("features.example.todos.title") }} />
      <Screen keyboardAvoiding>
        <AppText variant="h2">{t("features.example.todos.title")}</AppText>
        <AppText variant="caption" color="muted" style={styles.mb6}>
          {t("features.example.todos.subtitle")}
        </AppText>

        <View style={view(styles.gap4)}>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder={t("features.example.todos.field.title.placeholder")}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                onSubmitEditing={handleAdd}
                returnKeyType="done"
                error={fieldError(errors.title?.message)}
              />
            )}
          />

          <Button
            title={t("features.example.todos.action.add")}
            block
            onPress={handleAdd}
          />

          {todos.length > 0 ? (
            <View style={view(styles.gap2)}>
              <AppText variant="caption" color="muted">
                {t("features.example.todos.progress", {
                  done: progress.done,
                  total: progress.total,
                })}
              </AppText>
              <ProgressBar value={progress.ratio} variant="success" size="sm" />
            </View>
          ) : null}

          <Tabs
            value={filter}
            onChange={setFilter}
            items={[
              { value: "all", label: t("features.example.todos.filter.all") },
              { value: "active", label: t("features.example.todos.filter.active") },
              { value: "done", label: t("features.example.todos.filter.done") },
            ]}
          />

          {visible.length === 0 ? (
            <Card variant="outlined">
              <EmptyState
                title={t("features.example.todos.empty.title")}
                description={t("features.example.todos.empty.description")}
              />
            </Card>
          ) : (
            <Card variant="outlined">
              <View style={view(styles.gap4)}>
                {visible.map((todo, index) => (
                  <View key={todo.id} style={view(styles.gap4)}>
                    {index > 0 ? <Divider /> : null}
                    <View style={view(styles.flexRow, styles.itemsCenter, styles.gap3)}>
                      <View style={view(styles.flex1, { minWidth: 0 })}>
                        <Checkbox
                          checked={todo.done}
                          onChange={() => toggle(todo.id)}
                          label={todo.title}
                          description={formatRelativeTime(todo.createdAt)}
                        />
                      </View>
                      <Button
                        title={t("utils.action.delete")}
                        variant="ghost"
                        size="sm"
                        onPress={() => setPendingRemoval(todo.id)}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </Card>
          )}

          {hasCompleted ? (
            <Button
              title={t("features.example.todos.action.clearCompleted")}
              variant="outline"
              block
              onPress={() => {
                clearCompleted();
                toast.info(t("features.example.todos.toast.cleared"));
              }}
            />
          ) : null}
        </View>
      </Screen>

      <Dialog visible={pendingRemoval !== null} onClose={() => setPendingRemoval(null)}>
        <Dialog.Title>{t("features.example.todos.remove.title")}</Dialog.Title>
        <Dialog.Body>{t("features.example.todos.remove.description")}</Dialog.Body>
        <Dialog.Actions>
          <Button
            title={t("utils.action.cancel")}
            variant="ghost"
            onPress={() => setPendingRemoval(null)}
          />
          <Button
            title={t("utils.action.delete")}
            variant="destructive"
            onPress={confirmRemoval}
          />
        </Dialog.Actions>
      </Dialog>
    </>
  );
}

import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { AppText, Badge } from "@/shared/components";
import { formatRelativeTime } from "@/shared/helpers";
import { useStyles, view } from "@/styles";
import { radii } from "@/styles/tokens";

import type { TaggedNews } from "../hooks/useNews";

/** Square, and about three lines of headline tall. */
const THUMBNAIL = 72;

export type NewsRowProps = {
  item: TaggedNews;
  /** Stock codes in the user's live plans, drawn in the accent color. */
  planCodes: ReadonlySet<string>;
};

/**
 * One headline. The publisher and age come first, small, because a trader
 * weighs a headline by where and when it came from before reading it.
 * Tapping opens the article in an in-app browser on the publisher's site.
 */
export function NewsRow({ item, planCodes }: Readonly<NewsRowProps>) {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityHint={t("features.news.opensHint")}
      onPress={() => WebBrowser.openBrowserAsync(item.link)}
      style={({ pressed }) =>
        view(
          styles.flexRow,
          styles.gap3,
          styles.py4,
          styles.borderB,
          styles.borderBorder,
          pressed && { opacity: 0.6 },
        )
      }
    >
      <View style={styles.flex1}>
        <View style={view(styles.flexRow, styles.gap2)}>
          <AppText variant="caption" weight="semibold">
            {item.source}
          </AppText>
          {item.publishedAt ? (
            <AppText variant="caption" color="muted">
              {formatRelativeTime(item.publishedAt)}
            </AppText>
          ) : null}
        </View>

        <AppText weight="semibold" numberOfLines={3} style={styles.mt1}>
          {item.title}
        </AppText>

        {item.codes.length > 0 ? (
          <View style={view(styles.flexRow, styles.flexWrap, styles.gap1, styles.mt2)}>
            {item.codes.map((code) => (
              <Badge
                key={code}
                size="sm"
                variant={planCodes.has(code) ? "primary" : "outline"}
                label={code}
              />
            ))}
          </View>
        ) : null}
      </View>

      {item.image ? (
        <Image
          source={item.image}
          contentFit="cover"
          accessible={false}
          style={{
            width: THUMBNAIL,
            height: THUMBNAIL,
            borderRadius: radii.lg,
          }}
        />
      ) : null}
    </Pressable>
  );
}

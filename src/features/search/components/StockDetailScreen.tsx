import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, View } from "react-native";

import {
  AppText,
  Button,
  EmptyState,
  Screen,
  Skeleton,
} from "@/shared/components";
import { formatCompactNumber, formatDate, formatNumber } from "@/shared/helpers";
import type { ApiError } from "@/shared/models";
import { useStyles, useTheme, view } from "@/styles";
import { fontSize, letterSpacing } from "@/styles/tokens";
import { fontFamily } from "@/styles/tokens/typography";

import {
  changeTone,
  formatChange,
  formatCompactRupiah,
  formatMultiple,
  formatPrice,
} from "../helpers/stock";
import type search from "../languages/search.en";
import type { Stock } from "../models/api.model";
import { fetchStockByCode } from "../services/api";

type Tone = ReturnType<typeof changeTone> | "foreground";

type Metric = { label: string; value: string; tone?: Tone };

type PeriodKey = keyof typeof search.detail.periods;

export type StockDetailScreenProps = {
  /** Exchange code from the route, e.g. `BBCA`. */
  code: string;
};

/**
 * Everything the API knows about one stock, read top to bottom in the order
 * a trader weighs an entry: where the price is and how it moved today, where
 * it sits in its year, how it has performed, what it costs, how it swings.
 *
 * Arriving from search, the stock is already in the list cache, so the page
 * renders at once from that record and only asks the server again once the
 * list has gone stale — or when pulled to refresh.
 */
export function StockDetailScreen({ code }: Readonly<StockDetailScreenProps>) {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    data: stock,
    isPending,
    isError,
    refetch,
    isRefetching,
  } = useQuery<Stock | null, ApiError>({
    queryKey: ["stocks", code],
    queryFn: () => fetchStockByCode(code),
    initialData: () =>
      queryClient
        .getQueryData<Stock[]>(["stocks", "list"])
        ?.find((item) => item.Code === code),
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(["stocks", "list"])?.dataUpdatedAt,
  });

  const renderBody = () => {
    if (isPending) return <LoadingDetail />;

    if (isError) {
      return (
        <EmptyState
          title={t("features.search.detail.error.title")}
          description={t("features.search.detail.error.description")}
          action={
            <Button
              title={t("utils.action.retry")}
              variant="secondary"
              onPress={() => refetch()}
            />
          }
        />
      );
    }

    if (!stock) {
      return (
        <EmptyState
          title={t("features.search.detail.notFound.title", { code })}
          description={t("features.search.detail.notFound.description")}
        />
      );
    }

    return <StockDetail stock={stock} />;
  };

  return (
    <>
      <Stack.Screen options={{ title: code }} />

      <Screen
        footer={
          stock ? (
            <Button
              block
              title={t("features.tradeLog.action.create")}
              onPress={() =>
                router.push({ pathname: "/plan/new", params: { code } })
              }
            />
          ) : undefined
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
          />
        }
      >
        {renderBody()}
      </Screen>
    </>
  );
}

function StockDetail({ stock }: Readonly<{ stock: Stock }>) {
  const styles = useStyles();
  const { t } = useTranslation();

  const sector = [stock.NewSectorName, stock.NewSubIndustryName]
    .filter(Boolean)
    .join(", ");

  const today: Metric[] = [
    { label: t("features.search.detail.open"), value: formatPrice(stock.AdjustedOpenPrice) },
    { label: t("features.search.detail.prevClose"), value: formatPrice(stock.PrevClosingPrice) },
    { label: t("features.search.detail.high"), value: formatPrice(stock.AdjustedHighPrice) },
    { label: t("features.search.detail.low"), value: formatPrice(stock.AdjustedLowPrice) },
    {
      label: t("features.search.detail.volume"),
      value: t("features.search.detail.shares", {
        count: formatCompactNumber(stock.Volume, { language: "id" }),
      }),
    },
    { label: t("features.search.detail.value"), value: formatCompactRupiah(stock.Value) },
    {
      label: t("features.search.detail.frequency"),
      value: t("features.search.detail.trades", {
        count: formatNumber(stock.Frequency, { language: "id" }),
      }),
    },
  ];

  const periods: [PeriodKey, number | null][] = [
    ["oneDay", stock.OneDay],
    ["oneWeek", stock.OneWeek],
    ["oneMonth", stock.OneMonth],
    ["threeMonth", stock.ThreeMonth],
    ["sixMonth", stock.SixMonth],
    ["mtd", stock.Mtd],
    ["ytd", stock.Ytd],
    ["oneYear", stock.OneYear],
    ["threeYear", stock.ThreeYear],
    ["fiveYear", stock.FiveYear],
    ["tenYear", stock.TenYear],
  ];
  const performance: Metric[] = periods.map(([key, ratio]) => ({
    label: t(`features.search.detail.periods.${key}`),
    value: formatChange(ratio, 1),
    tone: changeTone(ratio),
  }));

  const valuation: Metric[] = [
    { label: "PER", value: formatMultiple(stock.Per) },
    { label: t("features.search.detail.perAnnualized"), value: formatMultiple(stock.PerAnnualized) },
    { label: "PBR", value: formatMultiple(stock.Pbr) },
    { label: "ROE", value: formatChange(stock.Roe, 1) },
    { label: t("features.search.detail.psr"), value: formatMultiple(stock.PsrAnnualized) },
    { label: t("features.search.detail.pcfr"), value: formatMultiple(stock.PcfrAnnualized) },
    { label: t("features.search.detail.marketCap"), value: formatCompactRupiah(stock.Capitalization) },
    {
      label: t("features.search.detail.freeFloat"),
      value:
        stock.FreeFloatPct === null
          ? "-"
          : `${formatNumber(stock.FreeFloatPct, {
              language: "id",
              maximumFractionDigits: 1,
            })}%`,
    },
  ];

  const risk: Metric[] = [
    {
      label: t("features.search.detail.beta"),
      value:
        stock.BetaOneYear === null
          ? "-"
          : formatNumber(stock.BetaOneYear, {
              language: "id",
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
    },
    {
      label: t("features.search.detail.volatility"),
      // A spread, not a move: unsigned, and never green or red.
      value:
        stock.StdevOneYear === null
          ? "-"
          : `${formatNumber(stock.StdevOneYear * 100, {
              language: "id",
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}%`,
    },
  ];

  return (
    <View style={styles.gap8}>
      <View>
        <AppText variant="h3">{stock.Name}</AppText>
        {sector ? (
          <AppText color="muted" style={styles.mt1}>
            {sector}
          </AppText>
        ) : null}
        <PriceHero stock={stock} />
      </View>

      <Section title={t("features.search.detail.sections.today")}>
        <MetricGrid metrics={today} columns={2} />
      </Section>

      <YearRange stock={stock} />

      <Section title={t("features.search.detail.sections.performance")}>
        <MetricGrid metrics={performance} columns={4} />
      </Section>

      <Section title={t("features.search.detail.sections.valuation")}>
        <MetricGrid metrics={valuation} columns={2} />
      </Section>

      <Section title={t("features.search.detail.sections.risk")}>
        <MetricGrid metrics={risk} columns={2} />
      </Section>

      <AppText variant="caption" color="muted">
        {t("features.search.detail.asOf", {
          date: formatDate(stock.LastDate),
        })}
      </AppText>
    </View>
  );
}

/**
 * The price, set like the capital on the home screen — the currency small and
 * raised so the digits carry the weight — with today's move beneath it.
 */
function PriceHero({ stock }: Readonly<{ stock: Stock }>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const tone = changeTone(stock.OneDay);
  const arrow = { success: "▲ ", destructive: "▼ ", muted: "" }[tone];
  const change = formatNumber(Math.abs(stock.Last - stock.PrevClosingPrice), {
    language: "id",
    maximumFractionDigits: 0,
  });

  return (
    <View style={styles.mt6}>
      <View style={view(styles.flexRow, styles.itemsStart)}>
        <AppText
          variant="title"
          color="muted"
          style={{ marginTop: 3, marginRight: 4 }}
        >
          Rp
        </AppText>
        <AppText
          style={{
            fontSize: fontSize["4xl"],
            lineHeight: fontSize["4xl"] * 1.1,
            fontFamily: fontFamily.extrabold,
            letterSpacing: letterSpacing.tighter,
            fontVariant: ["tabular-nums"],
            color: colors.foreground,
          }}
        >
          {formatPrice(stock.Last)}
        </AppText>
      </View>
      <AppText weight="semibold" color={tone} style={styles.mt1}>
        {`${arrow}${change} (${formatChange(stock.OneDay)}) `}
        <AppText color="muted">{t("features.search.detail.today")}</AppText>
      </AppText>
    </View>
  );
}

/** Diameter of the marker on the year-range track. */
const MARKER_SIZE = 14;

/**
 * Where today's price sits between the year's low and high — the quickest
 * read on whether an entry would be buying near the top or the bottom.
 *
 * Left out when the two are equal (a suspended stock has not moved all year),
 * since a marker on a zero-width scale says nothing.
 */
function YearRange({ stock }: Readonly<{ stock: Stock }>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const {
    AdjustedAnnualLowPrice: low,
    AdjustedAnnualHighPrice: high,
    Last: last,
  } = stock;

  if (high <= low) return null;

  const position = Math.min(Math.max((last - low) / (high - low), 0), 1);
  const percent = `${position * 100}%` as const;
  const title = t("features.search.detail.sections.yearRange");

  return (
    <Section title={title}>
      <View
        accessible
        accessibilityLabel={`${title}: ${formatPrice(low)} – ${formatPrice(
          high,
        )}`}
      >
        <View style={{ height: MARKER_SIZE, justifyContent: "center" }}>
          <View
            style={view(styles.roundedFull, {
              height: 4,
              backgroundColor: colors.secondary,
            })}
          />
          <View
            style={view(styles.roundedFull, {
              position: "absolute",
              width: percent,
              height: 4,
              backgroundColor: colors.primary,
            })}
          />
          <View
            style={view(styles.roundedFull, {
              position: "absolute",
              left: percent,
              marginLeft: -MARKER_SIZE / 2,
              width: MARKER_SIZE,
              height: MARKER_SIZE,
              backgroundColor: colors.primary,
              borderWidth: 3,
              borderColor: colors.background,
            })}
          />
        </View>

        <View style={view(styles.flexRow, styles.justifyBetween, styles.mt2)}>
          <AppText variant="caption" style={{ fontVariant: ["tabular-nums"] }}>
            {formatPrice(low)}
          </AppText>
          <AppText variant="caption" style={{ fontVariant: ["tabular-nums"] }}>
            {formatPrice(high)}
          </AppText>
        </View>
      </View>
    </Section>
  );
}

/** A titled block, set off from the one above by a hairline. */
function Section({
  title,
  children,
}: Readonly<{ title: string; children: ReactNode }>) {
  const styles = useStyles();

  return (
    <View style={view(styles.borderT, styles.borderBorder, styles.pt4)}>
      <AppText variant="title" style={styles.mb3}>
        {title}
      </AppText>
      {children}
    </View>
  );
}

/** Label-over-value cells, `columns` to a row; the row wraps. */
function MetricGrid({
  metrics,
  columns,
}: Readonly<{ metrics: Metric[]; columns: number }>) {
  const styles = useStyles();

  return (
    <View style={view(styles.flexRow, styles.flexWrap)}>
      {metrics.map(({ label, value, tone = "foreground" }) => (
        <View
          key={label}
          style={view(styles.py2, styles.pr2, {
            width: `${100 / columns}%`,
          })}
        >
          <AppText variant="caption" color="muted" numberOfLines={1}>
            {label}
          </AppText>
          <AppText
            weight="semibold"
            color={tone}
            numberOfLines={1}
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {value}
          </AppText>
        </View>
      ))}
    </View>
  );
}

/** Placeholder shaped like the top of the page, for a deep link cold start. */
function LoadingDetail() {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <View
      accessible
      accessibilityLabel={t("features.search.detail.loading")}
      style={styles.gap3}
    >
      <Skeleton width="70%" height={24} />
      <Skeleton width="40%" height={16} />
      <Skeleton width="55%" height={40} style={styles.mt4} />
      <Skeleton width="35%" height={16} />
    </View>
  );
}

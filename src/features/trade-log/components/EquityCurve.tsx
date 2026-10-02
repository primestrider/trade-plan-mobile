import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View, type GestureResponderEvent } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";

import { AppText } from "@/shared/components";
import { useStyles, useTheme, view } from "@/styles";

import { formatRupiah } from "../helpers/format";

const HEIGHT = 168;
/** Room around the line so the marker and its ring are never clipped. */
const PAD_X = 8;
const PAD_Y = 8;

export type EquityCurveProps = {
  /** Running total in rupiah, starting from 0 before the first trade. */
  curve: number[];
};

/**
 * The running total of realized profit, trade by trade.
 *
 * One series, so no legend: the section title names it. The line is the
 * accent at 2px over a dashed zero baseline, the only gridline — above it the
 * account is up, below it down. Touching the chart moves a marker to the
 * nearest trade and reads its total out above, which is the hover layer on a
 * touch screen; it starts on the latest trade, the one a trader asks about.
 */
export function EquityCurve({ curve }: Readonly<EquityCurveProps>) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState(curve.length - 1);

  const index = Math.min(selected, curve.length - 1);
  const min = Math.min(0, ...curve);
  const max = Math.max(0, ...curve);
  const span = max - min || 1;
  const step =
    curve.length > 1 ? (width - PAD_X * 2) / (curve.length - 1) : 0;

  const x = (i: number) => PAD_X + i * step;
  const y = (value: number) =>
    PAD_Y + (1 - (value - min) / span) * (HEIGHT - PAD_Y * 2);

  const path = curve
    .map((value, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(value).toFixed(1)}`)
    .join(" ");

  const pick = (event: GestureResponderEvent) => {
    if (step === 0) return;
    const i = Math.round((event.nativeEvent.locationX - PAD_X) / step);
    setSelected(Math.max(0, Math.min(curve.length - 1, i)));
  };

  const value = curve[index];
  const total = curve[curve.length - 1];

  return (
    <View>
      <View style={view(styles.flexRow, styles.justifyBetween, styles.itemsEnd)}>
        <AppText variant="caption" color="muted">
          {index === 0
            ? t("features.tradeLog.stats.curveStart")
            : t("features.tradeLog.stats.curveAfter", { count: index })}
        </AppText>
        <AppText
          variant="label"
          color={value > 0 ? "success" : value < 0 ? "destructive" : "foreground"}
          style={{ fontVariant: ["tabular-nums"] }}
        >
          {value > 0 ? "+" : ""}
          {formatRupiah(value)}
        </AppText>
      </View>

      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={t("features.tradeLog.stats.curveSummary", {
          count: curve.length - 1,
          total: formatRupiah(total),
          high: formatRupiah(max),
          low: formatRupiah(min),
        })}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={pick}
        onResponderMove={pick}
        style={view(styles.mt2, { height: HEIGHT })}
      >
        {width > 0 ? (
          <Svg width={width} height={HEIGHT}>
            <Line
              x1={0}
              x2={width}
              y1={y(0)}
              y2={y(0)}
              stroke={colors.border}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <Line
              x1={x(index)}
              x2={x(index)}
              y1={0}
              y2={HEIGHT}
              stroke={colors.border}
              strokeWidth={1}
            />
            <Path
              d={path}
              fill="none"
              stroke={colors.primary}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <Circle
              cx={x(index)}
              cy={y(value)}
              r={5}
              fill={colors.primary}
              stroke={colors.background}
              strokeWidth={2}
            />
          </Svg>
        ) : null}
      </View>
    </View>
  );
}

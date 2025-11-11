<template>
  <VChart class="chart" :option="option" group="all-charts" autoresize />
</template>

<script setup lang="ts">
import { connect, use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  GridComponent,
  DataZoomComponent,
  VisualMapComponent,
  MarkAreaComponent,
} from "echarts/components";
import VChart, { THEME_KEY } from "vue-echarts";
import { provide, computed, onMounted } from "vue";
import { UniversalTransition } from "echarts/features";
import { TimeSeries, Timestamp } from "src/types/series";

interface Props {
  title?: string,
  series: TimeSeries | TimeSeries[],
  pieces?: { start: Timestamp, end: Timestamp, color: string }[]
}

const props = defineProps<Props>();

onMounted(() => {
  connect('all-charts');
});

use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
  DataZoomComponent,
  VisualMapComponent,
  MarkAreaComponent,
]);

provide(THEME_KEY, "dark");

const serieses = computed(() => {
  if (Array.isArray(props.series)) {
    return props.series.map((s) => {
      const sortedPoints = s.points.toSorted((a, b) => a.time - b.time);
      return {
        name: s.name,
        points: sortedPoints
      }
    });
  }

  const sortedPoints = props.series.points.toSorted((a, b) => a.time - b.time);
  return [{
    name: props.series.name,
    points: sortedPoints
  }]
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
function fillGaps(pieces: { min: number, max: number, color: string }[], howToFill: (toFill: any) => unknown) {
  if (!Array.isArray(pieces) || pieces.length === 0) return [howToFill({})];

  // sort by min (assume each piece has min and max numeric)
  const sorted = [...pieces].sort((a, b) => a.min - b.min);
  const result = [];

  // left gap (before first piece)
  const first = sorted[0];
  if (first === undefined) return [howToFill({})];

  if (first.min !== undefined) result.push(howToFill({ max: first.min }));

  // pieces and intermediate gaps
  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i]!;
    result.push({ min: cur.min, max: cur.max, color: cur.color });

    const next = sorted[i + 1];
    if (next) {
      // if there's a gap between cur.max and next.min, add a gap entry
      if (cur.max < next.min) {
        result.push(howToFill({ min: cur.max, max: next.min }));
      }
      // if they touch (cur.max === next.min) no gap; if overlap, we keep original pieces order
    }
  }

  // right gap (after last piece)
  const last = sorted[sorted.length - 1]!;
  if (last.max !== undefined) result.push(howToFill({ min: last.max }));

  return result;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function* zip(...arrays: any[]) {
  const maxLength = arrays.reduce((max, curIterable) => curIterable.length > max ? curIterable.length : max, 0);
  for (let i = 0; i < maxLength; i++) {
    yield arrays.map(array => array[i]);
  }
}

const option = computed(() => {
  let seriesAndPieces;
  if (Array.isArray(props.series)) {
    seriesAndPieces = zip(serieses.value, props.pieces).map(([s, p]) => [s, [p]]).toArray();
  }
  else {
    seriesAndPieces = [[props.series, props.pieces]];
  }

  const seriesEntries = seriesAndPieces.filter(([serie, pieces]) => serie !== undefined && pieces !== undefined).map(([s, p]) => {
    return {
      name: s.name,
      // lineStyle: {
      //   color: '#ff0000',
      //   // width: 5
      // },
      areaStyle: {
        color: 'rgba(0,0,0,0)'
      }, // needed!

      type: 'line',
      symbol: 'none',
      sampling: 'lttb',
      data: structuredClone(s.points).toSorted((a: { time: Timestamp; }, b: { time: Timestamp; }) => a.time - b.time).map((pt: { time: Timestamp; value: number; }) => [pt.time, pt.value]),
      markArea:
      {
        itemStyle: {
          color: 'rgba(0,1,0,1)'
        },
        data:
          p.map((piece: { start: Timestamp; end: Timestamp; color: string; }) => {
            return [
              { xAxis: piece.start },
              { xAxis: piece.end, itemStyle: { color: piece.color, } },
            ];
          }),
      }

    }
  });

  const output = {
    title: {
      text: props.title
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: serieses.value.map((s) => s.name)
    },
    // grid: serieses.value.map(() => {
    //   return {
    //     left: '3%',
    //     right: '4%',
    //     bottom: '3%',
    //     containLabel: true
    //   }
    // }),
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },

    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
        filterMode: 'none'
      },
      {
        type: 'slider',
        start: 0,
        end: 100,
        filterMode: 'none'
      }
    ],

    // visualMap: {
    //   type: 'piecewise',
    //   show: false,
    //   dimension: 0,
    //   seriesIndex: 0,
    //   pieces: fillGaps(pieces, (piece) => { piece.color = 'rgba(0,0,0,0)'; return piece; }),
    // },

    xAxis: {
      type: 'value',
      // boundaryGap: false,
      // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: seriesEntries,
    // {
    //   name: 'Email',
    //   type: 'line',
    //   stack: 'Total',
    //   data: [120, 132, 101, 134, 90, 230, 210]
    // },

  };
  console.log(output);
  return output;
});

</script>

<style scoped>
.chart {
  height: 400px;
}
</style>

<template>
  <VChart class="chart" ref="chart" :option="option" group="all-charts" autoresize @zr:click="onClick" />
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
import { provide, computed, onMounted, ref, Ref } from "vue";
import { UniversalTransition } from "echarts/features";
import { findMetricByName, SegmentData } from "src/types/api-types";

interface Props {
  title?: string,
  segments: SegmentData[],
  metrics: string[],
  cursor: number | undefined
}

const props = defineProps<Props>();

const emit = defineEmits<{
  changeTime: [time: number]
}>()

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const chart: Ref<any> = ref(null);


const option = computed(() => {
  let min = 0;
  let max = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const series: any[] = props.metrics.map((metricName) => {
    const dataRow: number[][] = [];

    props.segments.forEach((segment) => {
      const metric = findMetricByName(segment.metrics, metricName);
      if (metric && typeof (metric.value) === "number") {
        dataRow.push([segment.start, metric.value]);
        dataRow.push([segment.end, 0]);

        min = Math.min(min, metric.value);
        max = Math.max(max, metric.value);
      }
    });


    return {
      symbolSize: 10,
      data: dataRow,
      name: metricName,
      symbol: 'circle',
      type: 'line',
      step: 'end',
    };
  });

  const legend = props.metrics.map(metric => {
    return {
      name: metric
    }
  });

  const cursor = props.cursor;
  if (cursor !== undefined) {
    series.unshift({
      type: 'line',
      data: [
        [cursor, min],
        [cursor, max],
      ],
      lineStyle: {
        color: '#ff0000',
      }
    })

    legend.unshift({
      name: 'cursor'
    })
  }


  const opt = {
    title: {
      text: props.title
    },
    xAxis: {},
    yAxis: {},
    series: series,
    legend: {
      data: legend
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
    ]
  };
  return opt;
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onClick = (params: any) => {
  console.log(params, chart);
  const myChart = chart.value?.chart;
  if (!myChart) {
    return;
  }

  console.error(myChart.getOption());

  const pointInPixel = [params.offsetX, params.offsetY];
  const pointInGrid = myChart.convertFromPixel('grid', pointInPixel);
  // const category = myChart.getModel().get('xAxis')[0].data
  emit('changeTime', pointInGrid[0]);
};

</script>

<style scoped>
.chart {
  height: 400px;
}
</style>

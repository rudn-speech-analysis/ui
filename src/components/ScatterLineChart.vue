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
import { MetricValue } from "src/types/dialog-data";

interface Props {
  title?: string,
  data: Map<string, {
    valence: MetricValue,
    arousal: MetricValue,
  }[]>
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


const option = computed(() => {
  const dataRows: number[][][] = [];
  props.data.forEach((speaker) => {
    const dataRow: number[][] = [];

    speaker.forEach((s) => {
      dataRow.push([s.valence, s.arousal]);
    });

    dataRows.push(dataRow);
  });

  const series = dataRows.map((data) => {
    return {
      symbolSize: 20,
      data: data,
      symbol: 'circle',
      type: 'line'
    };
  });

  const opt = {
    title: {
      text: props.title
    },
    xAxis: {},
    yAxis: {},
    series: series,
  };
  return opt;

});

</script>

<style scoped>
.chart {
  height: 400px;
}
</style>

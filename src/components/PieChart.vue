<template>
  <VChart class="chart" :option="option" group="all-charts" autoresize />
</template>

<script setup lang="ts">
import { connect, use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart } from "echarts/charts";
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

interface Props {
  title?: string,
  data: Map<string, number>,
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
  CanvasRenderer,
  UniversalTransition,
  DataZoomComponent,
  VisualMapComponent,
  MarkAreaComponent,
  PieChart,
]);

provide(THEME_KEY, "dark");

const option = computed(() => {
  const nameValuePairs: { name: string; value: number; }[] = [];
  props.data.forEach((value, key) => {
    nameValuePairs.push({
      name: key,
      value: value,
    });
  });

  console.log(nameValuePairs);

  const data = {
    title: {
      text: props.title,
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: nameValuePairs,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  return data;
});

</script>

<style scoped>
.chart {
  height: 400px;
}
</style>

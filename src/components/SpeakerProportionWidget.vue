<template>
  <q-card>
    <q-card-section class="row items-center no-wrap">
      <div class="text-h6">Speaker Proportion</div>
    </q-card-section>
    <q-card-section v-if="typeof (speakerProportions) !== 'string'">
      <PieChart :data="speakerProportions" title="Speaker Proportion" style="width: 100%" />
    </q-card-section>
    <q-card-section v-else>
      {{ speakerProportions }}
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ChannelData, findMetricByName } from 'src/types/api-types';
import { computed, ComputedRef } from 'vue';
import PieChart from './PieChart.vue';

interface PropType {
  channelDatas: ChannelData[]
}
const props = defineProps<PropType>();

const speakerProportions: ComputedRef<Map<string, number> | string> = computed(() => {
  let silence = 100;
  const data = new Map<string, number>();
  if (!props.channelDatas) {
    return "No channels are currently available, wait for analysis...";
  }
  for (let i = 0; i < props.channelDatas.length; i++) {
    const channel = (props.channelDatas[i])!;
    const name = channel.assigned_name || `Channel ${i}`;
    const metric = findMetricByName(channel.metrics, "talk percent");
    if (!metric) {
      return "For channel idx " + i + ", there is no `talk percent` metric, maybe wait for analysis?";
    }

    if (typeof (metric.value) === "number") {
      data.set(name, metric.value);
      silence -= metric.value;
    } else {
      return "For channel idx " + i + ", the `talk percent` metric is not a number. Error on backend?";
    }
  }

  data.set('Silence', silence);
  return data;
})
</script>

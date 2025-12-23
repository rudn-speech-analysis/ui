<template>
  <div class="text-h6">Channel metrics</div>
  <div v-if="props.channelDatas.length > 0">
    <q-tabs v-model="selectedChannel">
      <q-tab v-for="channelData in props.channelDatas" :key="channelData.self_url" :name="channelData.self_url" :label="channelData.assigned_name === null ? 'Channel ' + channelData.idx_in_file :
        channelData.assigned_name" />
    </q-tabs>

    <q-separator />
    <q-tab-panels v-model="selectedChannel" animated>
      <q-tab-panel name="empty">
        <h6>No channel selected</h6>
      </q-tab-panel>
      <q-tab-panel v-for="channelData in props.channelDatas" :key="channelData.self_url" :name="channelData.self_url">
        <div class="text-h6 cursor-pointer">
          {{ channelData.assigned_name === null ? "Channel " + channelData.idx_in_file :
            channelData.assigned_name }}
          <q-icon name="edit" size="xs" right />
          <q-popup-edit v-model="channelData.assigned_name" auto-save title="Set channel name" v-slot="scope"
            @save="val => updateAssignedName(channelData.self_url, val)">
            <q-input v-model="scope.value" autofocus @keyup.enter="scope.set" />
          </q-popup-edit>
        </div>

        <div v-for="collection in channelData.metrics" :key="collection.provider">
          <div v-for="metric in collection.metrics" :key="metric.name">
            <div class="text-h6">
              {{ metric.name }}
              <template v-if="metric.description">
                <q-icon name="info" size="xs" right />
                <q-tooltip>
                  {{ metric.description }}
                </q-tooltip>
              </template>
            </div>
            <div>
              {{ metric.value }} {{ metric.unit !== null ? metric.unit : '' }}
            </div>
          </div>
        </div>

        <div>
          <div class="text-h6">Widgets</div>
          <div>
            <!-- checkboxes for metric types -->
            <q-checkbox v-for="type in metricsEligibleForPerSegment" :key="type" :label="type" :val="type"
              v-model="metricsForPerSegment" />
          </div>

          <PerSegmentBarChart title="title" :segments="myChannelSegments" :metrics="metricsForPerSegment"
            :cursor="props.cursor" @changeTime="t => emit('changeTime', t)" />
          <!-- <SpeakerProportionWidget :channelData="channelData" /> -->
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <!-- <q-card v-for="channelData in channelDatas" :key="channelData.self_url">
      <q-card-section>
      </q-card-section>
      <q-card-section class="row custom-space-between">
        <template v-for="collection in channelData.metrics" :key="collection.provider">
          <q-card v-for="metric in collection.metrics" :key="metric.name">
            <q-card-section>
              <div class="text-h6">
                {{ metric.name }}
                <template v-if="metric.description">
                  <q-icon name="info" size="xs" right />
                  <q-tooltip>
                    {{ metric.description }}
                  </q-tooltip>
                </template>
              </div>
            </q-card-section>
            <q-card-section>
              {{ metric.value }} {{ metric.unit !== null ? metric.unit : '' }}
            </q-card-section>
          </q-card>
        </template>
      </q-card-section>
    </q-card> -->
  </div>
  <div v-else>
    <p>Channel metrics are not available yet, wait for analysis results...</p>
  </div>

</template>

<script setup lang="ts">
import { ChannelData, ChannelSegmentData } from 'src/types/api-types';
import { computed, ComputedRef, Ref, ref } from 'vue';
import PerSegmentBarChart from './PerSegmentBarChart.vue';


interface PropsData {
  channelDatas: ChannelData[],
  channelSegments: ChannelSegmentData[],
  cursor: number | undefined
}

const props = defineProps<PropsData>();

const emit = defineEmits<{
  changeTime: [time: number]
}>()

const selectedChannel = ref('empty');

const myChannelSegments = computed(() => {
  return props.channelSegments.filter(segment => segment.channel === selectedChannel.value).map(s => s.data);
});

const metricsForPerSegment: Ref<string[]> = ref(['valence', 'arousal']);
const metricsEligibleForPerSegment: ComputedRef<string[]> = computed(() => {
  // find all metrics that are defined for each segment in the current channel
  // and that are numeric
  const currentChannel = selectedChannel.value;
  const firstSegment = myChannelSegments.value.at(0);
  if (!currentChannel || !firstSegment) {
    return [];
  }
  const names = new Set<string>();
  // First add the names of each metric for the first segment

  for (const collection of firstSegment.metrics) {
    for (const metric of collection.metrics) {
      if (metric.value !== null && typeof metric.value === 'number') {
        names.add(metric.name);
      }
    }
  }

  // Then, for every other segment,
  // if the metric with this name is not defined,
  // remove it from the set
  for (const segment of myChannelSegments.value.slice(1)) {
    for (const collection of segment.metrics) {
      for (const metric of collection.metrics) {
        if (metric.value === null || typeof metric.value !== 'number') {
          names.delete(metric.name);
        }
      }
    }
  }

  console.log("names", names)
  return Array.from(names);
});

const updateAssignedName = async (self_url: string, new_name: string | null) => {
  console.log("update assigned name", self_url, new_name)
  try {
    const response = await fetch(self_url + "/assigned_name", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(new_name),
    })
    if (response.ok) {
      console.log('Assigned name updated successfully')
    } else {
      throw new Error('Failed to update assigned name')
    }
  } catch (error) {
    console.error('Error updating assigned name:', error)
    alert('Failed to update assigned name')
  }
}


</script>

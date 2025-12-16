<template>


  <q-splitter v-model="splitterModel">
    <template v-slot:before>
      <div class="q-pa-md row" style="overflow-y: auto; height: 90vh; text-align: left !important;">
        <QBtn style="width: 100%;" flat no-caps :align="'left'" v-for="segment in segmentDatas" :key="segment.data.id"
          @click="onSegmentClicked(segment)">
          <q-chat-message :text="[segment.data.text]" :sent="segment.channel === recordingData?.channels.at(0)"
            :stamp="segment.data.start + ' - ' + segment.data.end"
            :style="currentTime >= segment.data.start && currentTime <= segment.data.end ? 'outline: dotted red 4px' : ''" />
        </QBtn>
      </div>
      <!-- <QList style="overflow-y: auto; height: 90vh">
          evil hack, but without overflow-y + height, scrolling cannot work
          <QItem v-for="segment in segmentDatas" :key="segment.data.id" clickable v-ripple
            @click="onSegmentClicked(segment)">
            <QItemSection>
              <QItemLabel>
                {{ segment.data.text }}
              </QItemLabel>
              <QItemLabel caption>
                {{ segment.data.start }} - {{ segment.data.end }}
              </QItemLabel>
            </QItemSection>
          </QItem>
        </QList> -->
    </template>

    <template v-slot:after>
      <q-linear-progress v-if="loading" indeterminate color="primary" class="q-ma-md" />
      <div style="overflow-y: scroll; height: 90vh">

        <h3 class="text-negative" v-if="errorText">
          {{ errorText }}
        </h3>

        <div class="q-pa-md q-gutter-md">
          <audio controls :src="audioUrl" ref="player" style="width: 100%" @timeupdate="onTimeUpdate">
            Your browser does not support the HTML5 audio element.
          </audio>

          <q-card v-if="!loading">
            <q-card-section>
              <div class="text-h6">Analysis status</div>
            </q-card-section>
            <q-card-section>
              <div v-if="recordingData?.analysis_status === 'pending'">
                <q-spinner color="primary" size="3em" />
                Waiting for worker to start...
              </div>
              <div v-else-if="recordingData?.analysis_status === 'running'">
                <q-spinner color="primary" size="3em" />
                Analyzing ({{ recordingData?.analysis_percent_done }}% complete)...
              </div>
              <div v-else-if="recordingData?.analysis_status === 'done'">
                <q-icon name="done" color="positive" size="3em" />
                Analysis complete
              </div>
              <div v-else>
                Unknown status: {{ recordingData?.analysis_status }}
              </div>
            </q-card-section>
            <q-card-section>
              <div class="q-pa-md row items-start q-gutter-sm">
                <template v-for="collection in recordingData?.metrics" :key="collection.provider">
                  <q-card v-for="metric in collection.metrics" :key="metric.name">
                    <q-card-section>
                      <div class="text-h6">
                        {{ metric.name }}
                      </div>
                      <div class="text-subtitle2">
                        {{ metric.description }}
                      </div>
                    </q-card-section>
                    <q-card-section>
                      {{ metric.value }} {{ metric.unit !== null ? metric.unit : '' }}
                    </q-card-section>
                  </q-card>
                </template>
              </div>

            </q-card-section>
            <q-card-section v-if="recordingData?.analysis_error_message">
              <div class="text-negative">
                {{ recordingData?.analysis_error_message }}
              </div>
            </q-card-section>
          </q-card>
          <q-card v-else>
            <q-card-section>
              <div class="text-h6">Loading recording data...</div>
            </q-card-section>
          </q-card>

          <div v-if="channelDatas.length > 0" class="row q-gutter-sm">
            <q-card v-for="channelData in channelDatas" :key="channelData.self_url">
              <q-card-section>
                <div class="text-h6 cursor-pointer">
                  {{ channelData.assigned_name === null ? "Channel " + channelData.idx_in_file :
                    channelData.assigned_name }}
                  <q-popup-edit v-model="channelData.assigned_name" auto-save title="Set channel name" v-slot="scope"
                    @save="updateAssignedName(channelData.self_url, channelData.assigned_name)">
                    <q-input v-model="scope.value" autofocus @keyup.enter="scope.set" />
                  </q-popup-edit>
                </div>
              </q-card-section>
              <q-card-section class="row q-gutter-sm">
                <template v-for="collection in channelData.metrics" :key="collection.provider">
                  <q-card v-for="metric in collection.metrics" :key="metric.name">
                    <q-card-section>
                      <div class="text-h6">
                        {{ metric.name }}
                      </div>
                      <div class="text-subtitle2">
                        {{ metric.description }}
                      </div>
                    </q-card-section>
                    <q-card-section>
                      {{ metric.value }} {{ metric.unit !== null ? metric.unit : '' }}
                    </q-card-section>
                  </q-card>
                </template>
              </q-card-section>
            </q-card>
          </div>

          <q-card v-if="activeSegment !== null">
            <q-card-section>
              <div class="text-h6">Active segment: {{ activeSegment.data.start }} &mdash; {{ activeSegment.data.end }}
              </div>
            </q-card-section>
            <q-card-section class="force-chat-on-one-side">
              <q-chat-message :text="[activeSegment.data.text]"
                :sent="activeSegment.channel === recordingData?.channels.at(0)" />
            </q-card-section>
            <q-card-section class="row q-gutter-sm">
              <template v-for="collection in activeSegment?.data.metrics" :key="collection.provider">
                <q-card v-for="metric in collection.metrics" :key="metric.name">
                  <q-card-section>
                    <div class="text-h6">
                      {{ metric.name }}
                    </div>
                    <div class="text-subtitle2">
                      {{ metric.description }}
                    </div>
                  </q-card-section>
                  <q-card-section>
                    {{ metric.value }} {{ metric.unit !== null ? metric.unit : '' }}
                  </q-card-section>
                </q-card>
              </template>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>

  </q-splitter>
</template>

<script setup lang="ts">
import { QBtn } from 'quasar'

import { ref, onMounted, watch, Ref, useTemplateRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  uuid: {
    type: String,
    required: true
  }
})

interface RecordingData {
  id: string,
  uploaded_at: string,
  download_url: string,
  channels: string[],
  metrics: MetricCollection[] | null,
  analysis_status: string,
  analysis_percent_done: number,
  analysis_error_message: string | null,
  analysis_updated_at: Date,
}

interface SegmentData {
  id: string,
  start: number,
  end: number,
  text: string,
  metrics: MetricCollection[],
}

interface SegmentItem {
  channel: string,
  data: SegmentData,
}

interface MetricCollection {
  provider: string,
  metrics: Metric[],
  description: string | null,
}

interface Metric {
  type: string,
  name: string,
  value: number | string | boolean,
  description: string | null,
  unit: string | null
}

const recordingData: Ref<RecordingData | null> = ref(null)
const channelDatas: Ref<ChannelData[]> = ref([])
const segmentDatas = ref<SegmentItem[]>([])

const loading = ref(true)
const errorText: Ref<string | null> = ref(null)
const splitterModel = ref(20)

const currentTime = ref(0)

const audioElementRef = useTemplateRef('player')
const audioUrl = ref('')

const route = useRoute()
const router = useRouter()

const onSegmentClicked = (segment: SegmentItem) => {
  const audioElement = audioElementRef.value
  if (audioElement) {
    audioElement.currentTime = segment.data.start
  }
};

const activeSegment = ref<SegmentItem | null>(null)

const onTimeUpdate = async () => {
  const audioElement = audioElementRef.value
  if (audioElement) {
    currentTime.value = audioElement.currentTime
  }

  const segment = segmentDatas.value.findLast(s => s.data.start <= currentTime.value && s.data.end >= currentTime.value)
  if (segment) {
    activeSegment.value = segment
    await router.replace(`/details/${props.uuid}/segments/${segment.data.id}`)
  }
  else {
    activeSegment.value = null
  }
};

const fetchData = async (reset = true) => {
  if (reset) {
    loading.value = true
    recordingData.value = null
    errorText.value = null
    channelDatas.value = []
    segmentDatas.value = []
    audioUrl.value = ''
  }
  try {
    const response = await fetch(`http://localhost:3000/recordings/${props.uuid}`)
    if (response.ok) {
      recordingData.value = await response.json()
      if (!audioUrl.value) {
        audioUrl.value = recordingData.value!.download_url
      }
    } else {
      throw new Error('Failed to fetch data')
    }
  } catch (error) {
    console.error('Error fetching upload details:', error)
    alert('Failed to fetch upload details')
    loading.value = false
    errorText.value = "Error while fetching upload details"
  }

  if (recordingData.value) {
    const channelUrls: string[] = recordingData.value?.channels || [];

    for (let i = 0; i < channelUrls.length; i++) {
      const channelData = await fetchChannelData(channelUrls.at(i)!)
      channelDatas.value.push(channelData)
    }
  }

  for (let i = 0; i < channelDatas.value.length; i++) {
    const channelData = channelDatas.value.at(i)!
    await fetchSegments(channelData);
  }

  if (route.params.sid) {
    const segment = segmentDatas.value.find(s => s.data.id === route.params.sid)
    if (segment) {
      const audioElement = audioElementRef.value
      if (audioElement) {
        audioElement.currentTime = segment.data.start
      }
    } else {
      console.warn('Segment not found')
      await router.replace(`/details/${props.uuid}`)
    }
  }

  loading.value = false

  if (recordingData.value?.analysis_status !== 'done' && recordingData.value?.analysis_status !== 'error') {
    if (route.params.id === recordingData.value?.id) {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      setTimeout(async () => await fetchData(true), 1000)
    }
  }
}

const fetchSegments = async (channelData: ChannelData) => {
  let nextUrl = channelData.segments_begin_url;

  while (true) {
    const response = await fetch(nextUrl)
    if (response.ok) {
      const data: {
        segments: SegmentData[],
        next_url: string | null,
      } = await response.json();

      data.segments.forEach(item => {
        if (segmentDatas.value.some(s => s.data.id === item.id)) {
          return;
        }
        segmentDatas.value.push({
          channel: channelData.self_url,
          data: item,
        });
      });
      segmentDatas.value.sort((a, b) => a.data.start - b.data.start);

      if (data.next_url === null) {
        break;
      }
      nextUrl = data.next_url;
    } else {
      throw new Error('Failed to fetch segments')
    }
  }
}

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

interface ChannelData {
  self_url: string,
  idx_in_file: number,
  assigned_name: string | null,
  segments_begin_url: string,
  metrics: MetricCollection[],
}

const fetchChannelData = async (url: string): Promise<ChannelData> => {
  try {
    const response = await fetch(url)
    if (response.ok) {
      const data = await response.json()
      return data;
    } else {
      throw new Error('Failed to fetch data')
    }
  } catch (error) {
    console.error('Error fetching channel data:', error)
    alert('Failed to fetch channel data')
    loading.value = false
    errorText.value = "Error while fetching channel data"
    throw error;
  }
}

onMounted(fetchData)

watch(() => props.uuid, () => fetchData())
</script>

<style lang="css">
.force-chat-on-one-side .q-message-sent .q-message-container.row.reverse {
  flex-direction: row !important;
}
</style>

<template>
  <QLayout view="hHh Lpr lff">
    <QHeader elevated>
      <QToolbar>
        <QBtn flat @click="drawer = !drawer" round dense icon="menu" />
        <QToolbarTitle>Header</QToolbarTitle>
      </QToolbar>
    </QHeader>

    <QDrawer v-model="drawer" show-if-above :breakpoint="500" bordered>
      <QScrollArea class="fit">
        <ChatWindow :data="data" v-model="selected_utterance" />
      </QScrollArea>
    </QDrawer>

    <QPageContainer>
      <QPage padding>
        <div v-if="selected_utterance">
          <div class="text-h6">Text</div>
          <QChatMessage :text="[selected_utterance.text]" />
          <div class="text-h6">Metrics</div>
          <div class="row">
            <QCard flat bordered>
              <QCardSection>
                <div class="text-h6">Valence</div>
              </QCardSection>
              <QCardSection class="q-pt-none">
                <div class="text-h4">{{ selected_utterance.metrics.valence }}
                </div>
              </QCardSection>
            </QCard>

            <QCard flat bordered>
              <QCardSection>
                <div class="text-h6">Arousal</div>
              </QCardSection>
              <QCardSection class="q-pt-none">
                <div class="text-h4">{{ selected_utterance.metrics.arousal }}
                </div>
              </QCardSection>
            </QCard>

          </div>
        </div>
        <div v-else>
          <div class="text-h6">No utterance selected</div>
          <div class="row">
            <LineChart :series="data.generalMetrics.volume" :pieces="data.makeSegments()" title="Volume chart"
              style="width: 50%" />
            <PieChart :data="data.calculateSpeakerTimes()" title="Speaker times" style="width: 30%" />

            <ScatterLineChart :data="data.calculatePerSpeakerMetricSequence()" title="Speaker V/A chart"
              style="width: 30%" />

            <div class="row">
              <QCard bordered inset>

                <QCard flat bordered>
                  <QCardSection>
                    <div class="text-h6">Loudness</div>
                  </QCardSection>
                  <QCardSection class="q-pt-none">
                    <div class="text-h4">-4.20 iDFC</div>
                  </QCardSection>
                </QCard>
                <QCard flat bordered>
                  <QCardSection>
                    <div class="text-h6">Churn rate</div>
                  </QCardSection>
                  <QCardSection class="q-pt-none">
                    <div class="text-h4">69.67%</div>
                  </QCardSection>
                </QCard>
                <QCard flat bordered>
                  <QCardSection>
                    <div class="text-h6">Approval</div>
                  </QCardSection>
                  <QCardSection class="q-pt-none" style="font-size: xx-large">
                    ★☆☆☆☆
                  </QCardSection>
                </QCard>
              </QCard>

            </div>

          </div>

        </div>

      </QPage>
    </QPageContainer>
  </QLayout>
</template>

<script setup lang="ts">
// import ChatWindow from 'src/components/ChatWindow.vue';
import { QPage, QLayout, QHeader, QToolbar, QToolbarTitle, QBtn, QDrawer, QScrollArea, QPageContainer, QCard, QCardSection, QChatMessage } from 'quasar';
import ChatWindow from 'src/components/ChatWindow.vue';
import LineChart from 'src/components/LineChart.vue';
import PieChart from 'src/components/PieChart.vue';
import ScatterLineChart from 'src/components/ScatterLineChart.vue';
import { DialogUtterance, generate_fake_dialog } from 'src/types/dialog-data';
import { ref } from 'vue';



const data = generate_fake_dialog();
const drawer = ref(true);

const selected_utterance = ref<DialogUtterance | null>(null);

// const valences = data.utterances.map((utterance) => utterance.metrics.valence.shift(100));
// const valences = data.utterances.map((utterance) => utterance.metrics.valence);
// valences[0] = valences[0]!.shift(100)!;

</script>

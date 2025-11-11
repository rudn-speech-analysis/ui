<template>
  <div class="row">
    <ChatWindow :data="data" />
    <LineChart :series="data.generalMetrics.volume" :pieces="data.makeSegments()"
      style="width: 50%; max-width: 600px;" />
    <LineChart :series="valences" :pieces="data.makeSegments()" style="width: 50%; max-width: 600px;" />
  </div>
</template>

<script setup lang="ts">
import ChatWindow from 'src/components/ChatWindow.vue';
import LineChart from 'src/components/LineChart.vue';
import { generate_fake_dialog } from 'src/types/dialog-data';

const data = generate_fake_dialog();

// const valences = data.utterances.map((utterance) => utterance.metrics.valence.shift(100));
const valences = data.utterances.map((utterance) => utterance.metrics.valence);
// valences[0] = valences[0]!.shift(100)!;

</script>

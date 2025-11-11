<template>
  <div class="q-pa-md row justify-center">
    <div style="width: 100%; max-width: 400px">
      <QChatMessage v-bind:key="utter.startTime" v-for="utter in props.data.utterances" :text="[utter.text]"
        :sent="utter.speakerIdx == 0" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { QChatMessage } from 'quasar';
import { DialogData } from 'src/types/dialog-data';

interface Props {
  data: DialogData,
}

const props = defineProps<Props>();
console.log(props.data);

</script>

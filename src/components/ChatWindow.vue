<template>
  <div class="q-pa-md row justify-center">
    <div style="width: 100%; max-width: 400px">
      <QList>
        <QItem v-for="utterance in data.utterances" :key="utterance.startTime" clickable v-ripple
          :active="model?.startTime === utterance.startTime && model?.endTime === utterance.endTime"
          active-class="bg-blue text-white" @click="on_click(utterance)">
          <QItemSection avatar>
            <QAvatar v-if="utterance.speakerIdx === 0" icon="person" color="teal" text-color="white" />
            <QAvatar v-else icon="person_4" color="red" text-color="white" />
          </QItemSection>
          <QItemSection>{{ utterance.text }}</QItemSection>
          <QItemSection side>Side</QItemSection>
        </QItem>
      </QList>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QList, QItem, QItemSection, QAvatar } from 'quasar';
import { DialogData, DialogUtterance } from 'src/types/dialog-data';

interface Props {
  data: DialogData,
}

const model = defineModel<DialogUtterance | null>();

const props = defineProps<Props>();
console.log(props.data);

const on_click = (utterance: DialogUtterance) => {
  if (model.value?.startTime === utterance.startTime && model.value?.endTime === utterance.endTime) {
    model.value = null;
  } else {
    model.value = utterance;
  }
};

</script>

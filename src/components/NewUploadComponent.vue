<template>
  <q-page class="window-height row justify-center items-center">
    <div class="column items-center">
      <h4>Choose a file to analyze</h4>
      <q-form @submit="handleSubmit" class="q-pa-md">
        <q-file v-model="audio" label="Audio" filled required class="q-mb-md" accept="audio/*" />
        <q-file v-model="transcript" label="Transcript (optional)" filled class="q-mb-md" accept=".txt" />
        <q-toggle toggle-indeterminate keep-color color="primary" v-model="diarize"
          :label="diarize === null ? 'Auto diarize' : (diarize ? 'Force diarize' : 'Force channels')" class="q-mb-md" />
        <br />
        <q-btn label="Upload" type="submit" color="primary" />
      </q-form>
    </div>
  </q-page>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const audio = ref<File | null>(null)
const transcript = ref<File | null>(null)
const diarize = ref<boolean | null>(null)

const handleSubmit = () => {
  const formData = new FormData()
  if (audio.value) {
    formData.append('audio', audio.value)
  }
  if (transcript.value) {
    formData.append('transcript', transcript.value)
  }
  if (diarize.value === true) {
    formData.append('diarize', 'true')
  } else if (diarize.value === false) {
    formData.append('diarize', 'false')
  } else {
    formData.append('diarize', 'auto')
  }

  const xhr = new XMLHttpRequest()
  xhr.open('POST', '/api/upload')
  xhr.onload = async () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      await onUploaded({ xhr })
    } else {
      onFailed({ xhr })
    }
  }
  xhr.onerror = () => {
    onFailed({ xhr })
  }
  xhr.send(formData)
}

const onUploaded = async (info: { xhr: { response: string } }) => {
  try {
    const response: { upload_id: string } = JSON.parse(info.xhr.response)
    const uuid = response.upload_id
    if (uuid) {
      console.log('UUID:', uuid)
      await router.push(`/details/${uuid}`)
    } else {
      throw new Error('UUID not found in response')
    }
  } catch (error) {
    console.error('Error parsing response:', error)
    alert('Unexpected upload response')
  }
  console.log('Uploaded:', info)
}

const onFailed = (info: unknown) => {
  alert('Upload failed')
  console.error('Upload failed:', info)
}
</script>

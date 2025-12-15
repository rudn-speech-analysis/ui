<template>
  <q-page class="window-height row justify-center items-center">
    <div class="column items-center">
      <h4>Choose a file to analyze</h4>
      <q-uploader url="http://localhost:3000/upload" label="Select a file to upload" accept="audio/*" auto-upload
        @uploaded="onUploaded" @failed="onFailed" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

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
    alert("Unexpected upload response")
  }
  console.log('Uploaded:', info)
}

const onFailed = (info: unknown) => {
  alert("Upload failed")
  console.error('Upload failed:', info)
}
</script>

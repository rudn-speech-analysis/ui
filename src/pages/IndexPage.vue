<template>
  <q-layout view="lHh Lpr lFf" class="fullscreen">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-toolbar-title>Uploads</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-scroll-area style="height: 100%;">
        <q-list bordered separator>
          <q-item clickable @click="select('new')" :active="selected === 'new'">
            <q-item-section>New Upload</q-item-section>
          </q-item>
          <q-slide-item v-for="upload in uploads" :key="upload.id" left-color="red"
            @left="reset => preDelete(upload.id, reset)">
            <template v-slot:left>
              <q-icon name="delete" color="negative" />
              Delete
            </template>
            <q-item clickable @click="select(upload.id)" :active="selected === upload.id">
              <q-item-section>ID: {{ upload.id }}</q-item-section>
            </q-item>
          </q-slide-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container style="height: 100%">
      <NewUploadComponent v-if="selected === 'new'" />
      <UploadDetails v-else :uuid="selected" />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, Ref, watch } from 'vue'
import NewUploadComponent from 'src/components/NewUploadComponent.vue'
import UploadDetails from 'src/components/UploadDetails.vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const leftDrawerOpen = ref(true)
const uploads: Ref<{ id: string }[]> = ref([])
const selected = ref('new')

const route = useRoute()
const router = useRouter()

const q = useQuasar();

const select = async (id: string) => {
  selected.value = id
  if (id === 'new') {
    await router.push('/new')
  } else {
    await router.push(`/details/${id}`)
  }
}

const updateSelectedFromRoute = async () => {
  if (route.path === '/new') {
    selected.value = 'new'
  } else if (typeof route.params.id === 'string') {
    selected.value = route.params.id
    await refreshUploadList();
    if (!uploads.value.some(u => u.id === selected.value)) {
      console.warn('UUID not found, redirecting to /new')
      await router.push('/new')
    }
  } else {
    // Default for '/' or other paths
    await router.push('/new')
  }
}

const refreshUploadList = async () => {
  try {
    const response = await fetch('http://localhost:3000/recordings')
    if (response.ok) {
      const data: { id: string }[] = await response.json()
      console.log(data)
      uploads.value = data
    } else {
      console.error('Failed to fetch uploads')
    }
  } catch (error) {
    console.error('Error fetching uploads:', error)
  }

}

onMounted(async () => {
  await refreshUploadList()
  await updateSelectedFromRoute()
})

watch(() => route.path, updateSelectedFromRoute)

const preDelete = (id: string, reset: { reset: () => void }) => {
  let doDelete = true;
  q.notify({
    message: 'About to delete upload ' + id,
    color: 'negative',
    icon: 'delete',
    position: 'bottom',
    timeout: 5000,
    progress: true,
    group: false,
    actions: [
      {
        label: 'No, wait!', color: 'white', handler: () => {
          doDelete = false
          reset.reset()
        }
      },
    ],
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onDismiss: async () => {
      if (doDelete) {
        const response = await fetch(`http://localhost:3000/recordings/${id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          if (selected.value === id) {
            await router.replace('/new')
          }
          await refreshUploadList()
        }
      }
    }
  })
}
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>

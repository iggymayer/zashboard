import { fetchDaeCapabilitiesAPI } from '@/api/dae'
import { activeBackend } from '@/store/setup'
import type { DaeCapabilities } from '@/types'
import { ref } from 'vue'

export const daeCapabilities = ref<DaeCapabilities | null>(null)

export const resetCapabilities = () => {
  daeCapabilities.value = null
}

export const fetchCapabilities = async () => {
  if (activeBackend.value?.type !== 'dae') {
    resetCapabilities()
    return
  }

  try {
    const { data } = await fetchDaeCapabilitiesAPI()

    daeCapabilities.value = data
  } catch {
    daeCapabilities.value = null
  }
}

export const daeResource = <K extends keyof DaeCapabilities['resources']>(key: K) =>
  daeCapabilities.value?.resources?.[key]

export const daeHas = (key: keyof DaeCapabilities['resources']) =>
  daeResource(key)?.available === true

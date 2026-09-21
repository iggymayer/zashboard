import {
  createDaeNodeAPI,
  createDaeProviderAPI,
  deleteDaeDnsCacheEntryAPI,
  deleteDaeDnsCacheNameAPI,
  deleteDaeNodeAPI,
  deleteDaeProviderAPI,
  fetchDaeConfigAPI,
  fetchDaeConfigSourceAPI,
  fetchDaeDatapathAPI,
  fetchDaeDnsCacheAPI,
  fetchDaeDnsLogAPI,
  fetchDaeFlowAPI,
  fetchDaeFlowsAPI,
  fetchDaeRuntimeAPI,
  fetchDaeRuntimeSettingsAPI,
  patchDaeGroupAPI,
  patchDaeRuntimeSettingsAPI,
  resumeDaeAPI,
  saveDaeConfigSourceAPI,
  suspendDaeAPI,
  traceDaeRoutingAPI,
  validateDaeConfigAPI,
  waitForDaeOperation,
} from '@/api/dae'
import type {
  DaeConfigSnapshot,
  DaeConfigValidation,
  DaeDatapath,
  DaeDnsCacheList,
  DaeDnsLogList,
  DaeFlowDetail,
  DaeFlowList,
  DaeJsonPatchOperation,
  DaeRoutingTrace,
  DaeRuntime,
  DaeRuntimeSettings,
  DaeTraceInput,
} from '@/types'
import { ref } from 'vue'
import { daeGroupDetails, daeNodeList, daeProviderList, registry } from './driver/dae'
import { fetchProxies } from './proxies'

export { daeGroupDetails, daeNodeList, daeProviderList }

export const daeRuntime = ref<DaeRuntime | null>(null)

export const fetchDaeRuntime = async () => {
  daeRuntime.value = (await fetchDaeRuntimeAPI()).data

  return daeRuntime.value
}

export const fetchDaeFlows = (params?: Parameters<typeof fetchDaeFlowsAPI>[0]) =>
  fetchDaeFlowsAPI(params).then((res): DaeFlowList => res.data)

export const fetchDaeFlow = (flowId: string) =>
  fetchDaeFlowAPI(flowId).then((res): DaeFlowDetail => res.data)

export const fetchDaeDnsCache = (params?: Parameters<typeof fetchDaeDnsCacheAPI>[0]) =>
  fetchDaeDnsCacheAPI(params).then((res): DaeDnsCacheList => res.data)

export const deleteDaeDnsCacheEntry = (entryId: string) =>
  deleteDaeDnsCacheEntryAPI(entryId).then((res) => res.data)

export const deleteDaeDnsCacheName = (name: string, type?: string) =>
  deleteDaeDnsCacheNameAPI(name, type).then((res) => res.data)

export const fetchDaeDnsLog = (params?: Parameters<typeof fetchDaeDnsLogAPI>[0]) =>
  fetchDaeDnsLogAPI(params).then((res): DaeDnsLogList => res.data)

export const traceDaeRouting = (input: DaeTraceInput) =>
  traceDaeRoutingAPI(input).then((res): DaeRoutingTrace => res.data)

export const fetchDaeDatapath = () => fetchDaeDatapathAPI().then((res): DaeDatapath => res.data)

export const fetchDaeConfig = () => fetchDaeConfigAPI().then((res): DaeConfigSnapshot => res.data)

export const fetchDaeConfigSource = (sourceId: string) =>
  fetchDaeConfigSourceAPI(sourceId).then((res) => res.data)

export const validateDaeConfig = (
  mode: 'syntax' | 'full',
  sources: { id: string; path?: string; content: string }[],
) => validateDaeConfigAPI(mode, sources).then((res): DaeConfigValidation => res.data)

export const saveDaeConfigSource = async (sourceId: string, sha256: string, content: string) => {
  const { data } = await saveDaeConfigSourceAPI(sourceId, sha256, content)

  return waitForDaeOperation(data)
}

export const fetchDaeRuntimeSettings = () =>
  fetchDaeRuntimeSettingsAPI().then((res): DaeRuntimeSettings => res.data)

export const patchDaeRuntimeSettings = (payload: Record<string, unknown>) =>
  patchDaeRuntimeSettingsAPI(payload).then((res): DaeRuntimeSettings => res.data)

export const createDaeNode = async (name: string, link: string) => {
  const { data } = await createDaeNodeAPI(name, link)

  await fetchProxies()

  return data
}

export const deleteDaeNode = async (nodeId: string) => {
  const { data } = await deleteDaeNodeAPI(nodeId)

  await fetchProxies()

  return data
}

export const createDaeProvider = async (name: string, url: string) => {
  const { data } = await createDaeProviderAPI(name, url)

  await fetchProxies()

  return data
}

export const deleteDaeProvider = async (providerId: string) => {
  const { data } = await deleteDaeProviderAPI(providerId)

  await fetchProxies()

  return data
}

export const patchDaeGroup = async (
  groupId: string,
  revision: string,
  operations: DaeJsonPatchOperation[],
) => {
  const { data } = await patchDaeGroupAPI(groupId, revision, operations)

  await waitForDaeOperation(data)
  await fetchProxies()
}

export const suspendDae = async () => {
  const { data } = await suspendDaeAPI()

  await waitForDaeOperation(data)
  await fetchDaeRuntime()
}

export const resumeDae = async () => {
  const { data } = await resumeDaeAPI()

  await waitForDaeOperation(data)
  await fetchDaeRuntime()
  await fetchProxies()
}

export const daeGroupByName = (name: string) =>
  daeGroupDetails.value.find((group) => group.id === registry.groupIdByName.get(name))

export const daeNodeNameById = (id: string) => registry.memberNameById.get(id) ?? id

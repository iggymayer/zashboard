import type { ProbeResult } from '@/helper/connectivity'
import { getUrlFromBackend } from '@/helper/utils'
import { activeBackend } from '@/store/setup'
import type {
  Backend,
  DaeCapabilities,
  DaeCloseResult,
  DaeConfigSnapshot,
  DaeConfigSource,
  DaeConfigValidation,
  DaeConnectionList,
  DaeDatapath,
  DaeDeleteResult,
  DaeDnsCacheList,
  DaeDnsLogList,
  DaeDnsQueryResponse,
  DaeFlowDetail,
  DaeFlowList,
  DaeGeoData,
  DaeGroup,
  DaeGroupSummary,
  DaeJsonPatchOperation,
  DaeMemoryHistory,
  DaeNode,
  DaeNodeList,
  DaeOperation,
  DaeOperationAccepted,
  DaeProbeRequest,
  DaeProvider,
  DaeProviderList,
  DaeRoutingTrace,
  DaeRuleList,
  DaeRuntime,
  DaeRuntimeMemory,
  DaeRuntimeOutbounds,
  DaeRuntimeSettings,
  DaeSelectionResult,
  DaeTraceInput,
  DaeTrafficHistory,
  DaeVersion,
} from '@/types'
import axios from 'axios'
import { createParser } from 'eventsource-parser'
import './http'

const V1 = '/api/v1'

const bearerHeaders = (backend: Backend): Record<string, string> =>
  backend.password ? { Authorization: `Bearer ${backend.password}` } : {}

export const fetchDaeVersionAPI = () => axios.get<DaeVersion>(`${V1}/version`)

export const fetchDaeCapabilitiesAPI = () => axios.get<DaeCapabilities>(`${V1}/capabilities`)

export const fetchDaeRuntimeAPI = () => axios.get<DaeRuntime>(`${V1}/runtime`)

export const fetchDaeRuntimeMemoryAPI = () => axios.get<DaeRuntimeMemory>(`${V1}/runtime/memory`)

export const fetchDaeRuntimeOutboundsAPI = () =>
  axios.get<DaeRuntimeOutbounds>(`${V1}/runtime/outbounds`)

export const fetchDaeRuntimeSettingsAPI = () =>
  axios.get<DaeRuntimeSettings>(`${V1}/runtime/settings`)

export const fetchDaeGroupsAPI = () => axios.get<DaeGroupSummary[]>(`${V1}/groups`)

export const fetchDaeGroupAPI = (groupId: string) =>
  axios.get<DaeGroup>(`${V1}/groups/${encodeURIComponent(groupId)}`)

export const fetchDaeNodesAPI = (params?: { limit?: number; cursor?: string }) =>
  axios.get<DaeNodeList>(`${V1}/nodes`, { params })

export const fetchDaeProvidersAPI = (params?: { limit?: number; cursor?: string }) =>
  axios.get<DaeProviderList>(`${V1}/providers`, { params })

export const refreshDaeProviderAPI = (providerId: string) =>
  axios.post<DaeOperationAccepted>(`${V1}/providers/${encodeURIComponent(providerId)}/refresh`)

export const selectDaeGroupMemberAPI = (
  groupId: string,
  memberId: string,
  network: 'tcp' | 'udp' | 'both' = 'both',
) =>
  axios.put<DaeSelectionResult>(`${V1}/groups/${encodeURIComponent(groupId)}/selection`, {
    member_id: memberId,
    network,
  })

export const patchDaeGroupAPI = (
  groupId: string,
  revision: string,
  operations: DaeJsonPatchOperation[],
) =>
  axios.patch<DaeOperationAccepted>(`${V1}/groups/${encodeURIComponent(groupId)}`, operations, {
    headers: {
      'Content-Type': 'application/json-patch+json',
      'If-Match': `"${revision}"`,
    },
  })

export const fetchDaeRulesAPI = () => axios.get<DaeRuleList>(`${V1}/rules`)

export const fetchDaeConnectionsAPI = (params?: { type?: 'tcp' | 'udp' | 'all'; limit?: number }) =>
  axios.get<DaeConnectionList>(`${V1}/connections`, {
    params: { detail: 'full', ...params },
  })

export const closeDaeConnectionAPI = (id: string) =>
  axios.delete(`${V1}/connections/${encodeURIComponent(id)}`)

export const closeDaeConnectionsAPI = (filter?: { type?: 'tcp' | 'udp'; src?: string }) => {
  const params: Record<string, string | boolean> = {}

  if (filter?.type) params.type = filter.type
  if (filter?.src) params.src = filter.src
  if (!filter?.type && !filter?.src) params.all = true

  return axios.delete<DaeCloseResult>(`${V1}/connections`, { params })
}

export const createDaeProbeAPI = (payload: DaeProbeRequest) =>
  axios.post<DaeOperationAccepted>(`${V1}/probes`, payload)

export const fetchDaeOperationAPI = (operationId: string) =>
  axios.get<DaeOperation>(`${V1}/operations/${encodeURIComponent(operationId)}`)

export const startDaeReloadAPI = () => axios.post<DaeOperationAccepted>(`${V1}/operations/reload`)

export const fetchDaeGeoDataAPI = () => axios.get<DaeGeoData>(`${V1}/geodata`)

export const updateDaeGeoDataAPI = () => axios.post<DaeOperationAccepted>(`${V1}/geodata/update`)

export const flushDaeDnsCacheAPI = () => axios.post(`${V1}/dns/cache/flush`)

export const queryDaeDnsAPI = (domain: string, types: string[]) =>
  axios.get<DaeDnsQueryResponse>(`${V1}/dns/query`, {
    params: { domain, type: types },
    paramsSerializer: {
      indexes: null,
    },
  })

export const fetchDaeFlowsAPI = (params?: {
  network?: 'tcp' | 'udp'
  state?: string
  connection_id?: string
  limit?: number
  cursor?: string
  detail?: 'summary' | 'full'
}) => axios.get<DaeFlowList>(`${V1}/flows`, { params })

export const fetchDaeFlowAPI = (flowId: string) =>
  axios.get<DaeFlowDetail>(`${V1}/flows/${encodeURIComponent(flowId)}`)

export const fetchDaeDnsCacheAPI = (params?: {
  name?: string
  type?: string
  include_expired?: boolean
  limit?: number
  cursor?: string
}) =>
  axios.get<DaeDnsCacheList>(`${V1}/dns/cache`, {
    params: { detail: 'full', ...params },
  })

export const deleteDaeDnsCacheEntryAPI = (entryId: string) =>
  axios.delete<DaeDeleteResult>(`${V1}/dns/cache/${encodeURIComponent(entryId)}`)

export const deleteDaeDnsCacheNameAPI = (name: string, type?: string) =>
  axios.delete<DaeDeleteResult>(`${V1}/dns/cache`, { params: type ? { name, type } : { name } })

export const fetchDaeDnsLogAPI = (params?: {
  name?: string
  type?: string
  src?: string
  limit?: number
  cursor?: string
}) => axios.get<DaeDnsLogList>(`${V1}/dns/log`, { params })

export const traceDaeRoutingAPI = (input: DaeTraceInput) =>
  axios.post<DaeRoutingTrace>(`${V1}/routing/trace`, { input, resolve: 'none' })

export const fetchDaeConfigAPI = () => axios.get<DaeConfigSnapshot>(`${V1}/config`)

export const fetchDaeConfigSourceAPI = (sourceId: string) =>
  axios.get<DaeConfigSource>(`${V1}/config/sources/${encodeURIComponent(sourceId)}`)

export const validateDaeConfigAPI = (
  mode: 'syntax' | 'full',
  sources: { id: string; path?: string; content: string }[],
) => axios.post<DaeConfigValidation>(`${V1}/config/validate`, { mode, sources })

export const saveDaeConfigSourceAPI = (sourceId: string, sha256: string, content: string) =>
  axios.put<DaeOperationAccepted>(
    `${V1}/config/sources/${encodeURIComponent(sourceId)}`,
    { content },
    { headers: { 'If-Match': `"${sha256}"` } },
  )

export const createDaeNodeAPI = (name: string, link: string) =>
  axios.post<DaeNode>(`${V1}/nodes`, { name, link })

export const deleteDaeNodeAPI = (nodeId: string) =>
  axios.delete<DaeDeleteResult>(`${V1}/nodes/${encodeURIComponent(nodeId)}`)

export const createDaeProviderAPI = (name: string, url: string) =>
  axios.post<DaeProvider>(`${V1}/providers`, { name, kind: 'subscription', url })

export const deleteDaeProviderAPI = (providerId: string) =>
  axios.delete<DaeDeleteResult>(`${V1}/providers/${encodeURIComponent(providerId)}`)

export const suspendDaeAPI = () => axios.post<DaeOperationAccepted>(`${V1}/operations/suspend`, {})

export const resumeDaeAPI = () => axios.post<DaeOperationAccepted>(`${V1}/operations/resume`, {})

export const fetchDaeDatapathAPI = () =>
  axios.get<DaeDatapath>(`${V1}/datapath`, { params: { detail: 'full' } })

export const fetchDaeTrafficHistoryAPI = (params?: {
  window_seconds?: number
  max_points?: number
}) => axios.get<DaeTrafficHistory>(`${V1}/runtime/traffic/history`, { params })

export const fetchDaeMemoryHistoryAPI = (params?: {
  window_seconds?: number
  max_points?: number
}) => axios.get<DaeMemoryHistory>(`${V1}/runtime/memory/history`, { params })

export const patchDaeRuntimeSettingsAPI = (payload: Record<string, unknown>) =>
  axios.patch<DaeRuntimeSettings>(`${V1}/runtime/settings`, payload)

const OPERATION_POLL_INTERVAL = 500
const OPERATION_TIMEOUT = 60000

export const waitForDaeOperation = async (
  accepted: DaeOperationAccepted,
  timeout = OPERATION_TIMEOUT,
): Promise<DaeOperation> => {
  const deadline = Date.now() + timeout

  for (;;) {
    const { data } = await fetchDaeOperationAPI(accepted.operation_id)

    if (data.status === 'succeeded') return data
    if (data.status === 'failed') {
      throw new Error(data.error?.message || 'operation failed')
    }
    if (Date.now() > deadline) {
      throw new Error('operation timeout')
    }

    await new Promise((resolve) => setTimeout(resolve, OPERATION_POLL_INTERVAL))
  }
}

export type DaeSseHandler = (event: string, data: string) => void

const SSE_RETRY_DELAY = 3000
const SSE_MAX_BUFFER = 1024 * 1024
const EVENT_CURSOR_EXPIRED = 409

export const createDaeEventSource = (
  path: string,
  searchParams: Record<string, string>,
  onEvent: DaeSseHandler,
) => {
  const backend = activeBackend.value!
  const url = new URL(`${getUrlFromBackend(backend)}${V1}${path}`)

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value)
  })

  const controller = new AbortController()
  let closed = false
  let retryTimer: ReturnType<typeof setTimeout> | undefined
  let retryDelay = SSE_RETRY_DELAY
  let lastEventId = ''

  const parser = createParser({
    maxBufferSize: SSE_MAX_BUFFER,
    onId: (id) => (lastEventId = id),
    onRetry: (delay) => (retryDelay = delay),
    onEvent: (message) => onEvent(message.event ?? 'message', message.data),
  })

  const connect = async () => {
    const headers: Record<string, string> = {
      Accept: 'text/event-stream',
      ...bearerHeaders(backend),
    }

    if (lastEventId) headers['Last-Event-ID'] = lastEventId

    parser.reset()

    try {
      const response = await fetch(url.toString(), { headers, signal: controller.signal })

      if (response.status === EVENT_CURSOR_EXPIRED) lastEventId = ''
      if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      for (;;) {
        const { done, value } = await reader.read()

        if (done) break

        parser.feed(decoder.decode(value, { stream: true }))
      }
    } catch {}

    if (!closed) retryTimer = setTimeout(connect, retryDelay)
  }

  connect()

  return {
    close: () => {
      closed = true
      clearTimeout(retryTimer)
      controller.abort()
    },
  }
}

export const probeDaeChannel = async (
  backend: Backend,
  timeout: number,
  signal?: AbortSignal,
): Promise<ProbeResult> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  const onAbort = () => controller.abort()

  signal?.addEventListener('abort', onAbort, { once: true })

  const startAt = Date.now()
  const latency = () => Date.now() - startAt

  try {
    const res = await fetch(`${getUrlFromBackend(backend)}${V1}/version`, {
      method: 'GET',
      headers: bearerHeaders(backend),
      signal: controller.signal,
    })

    if (res.ok) return { ok: true, latency: latency() }

    return {
      ok: false,
      latency: latency(),
      kind: res.status === 401 ? 'unauthorized' : 'http',
      message: `HTTP ${res.status}`,
    }
  } catch (e) {
    return {
      ok: false,
      latency: latency(),
      kind: controller.signal.aborted ? 'timeout' : 'network',
      message: e instanceof Error ? e.message : String(e),
    }
  } finally {
    clearTimeout(timeoutId)
    signal?.removeEventListener('abort', onAbort)
  }
}

<template>
  <div>
    <NavBar />

    <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="mb-6">
        <h1 class="text-2xl sm:text-2xl font-semibold text-gray-900">ვიზიტორების სია</h1>
        <p class="mt-1 text-sm text-gray-500">ვიზიტორების მოძრაობის ინფორმაცია</p>
      </div>

      <!-- Controls -->
      <div class="bg-white rounded-xl shadow-sm p-4 bg-white rounded-xl shadow-sm p-4 mb-4">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
          <!-- Search -->
          <div class="md:col-span-4">
            <label class="block text-sm text-gray-600 mb-1">ძიება (სახელი, გვარი, პირადი ნომერი, სტუმრად)</label>
            <input
                v-model.trim="filters.q"
                type="text"
                placeholder=""
                class="w-full h-11 text-sm rounded-xl border border-gray-300 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <!-- From -->
          <div class="md:col-span-3">
            <label class="block text-sm text-gray-600 mb-1">საიდან</label>
            <input
                v-model="filters.from"
                type="datetime-local"
                class="w-full h-11 text-sm rounded-xl border border-gray-300 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <!-- To -->
          <div class="md:col-span-3">
            <label class="block text-sm text-gray-600 mb-1">სადამდე</label>
            <input
                v-model="filters.to"
                type="datetime-local"
                class="w-full h-11 text-sm rounded-xl border border-gray-300 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <!-- Reset -->
          <div class="md:col-span-2 flex items-end">
            <button
                @click="resetFilters"
                class="w-full h-11 rounded-xl border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              გასუფთავება
            </button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm p-4 bg-white rounded-xl shadow-sm p-4 mb-4">
        <div class="p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <h2 class="text-lg font-semibold text-gray-900">ვიზიტორების სია</h2>
        </div>

        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">#</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">სახელი</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">გვარი</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">პირადი ნომერი</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">სტუმრად</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">სტატუსი</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">მოსვლის დრო</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">წასვლის დრო</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">ბარათი</th>
            <th class="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wide">მონიშვნა</th>
          </tr>
          </thead>

          <tbody v-if="filtered.length" class="bg-white divide-y divide-gray-100">
          <tr v-for="(row, idx) in filtered" :key="row.pid" class="align-middle">
            <td class="px-4 py-3 text-gray-500 whitespace-nowrap">{{ row.seq || idx + 1 }}</td>
            <td class="px-4 py-3 text-gray-900 whitespace-nowrap truncate max-w-[180px]">{{ row.firstName }}</td>
            <td class="px-4 py-3 text-gray-900 whitespace-nowrap truncate max-w-[220px]">{{ row.lastName }}</td>

            <!-- MASKED PID -->
            <td class="px-4 py-3 font-mono text-gray-800 whitespace-nowrap">
              {{ maskPid(row.pid) }}
            </td>

            <!-- HOST (name + position) -->
            <td class="px-4 py-3 text-gray-900 whitespace-nowrap truncate max-w-[320px]">
                <span v-if="row.hostName">
                  {{ row.hostName }}<br />
                  <span v-if="row.hostPosition" class="text-gray-500">{{ row.hostPosition }}</span>
                </span>
              <span v-else class="text-gray-400">—</span>
            </td>

            <td class="px-4 py-3 whitespace-nowrap">
              <span v-if="row.status === 'arrived'" class="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">მოვიდა</span>
              <span v-else-if="row.status === 'left'" class="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">წავიდა</span>
              <span v-else-if="row.status === 'არ გამოცხადდა'" class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">არ გამოცხადდა</span>
              <span v-else class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">მოუნიშნავი</span>
            </td>

            <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ formatDT(row.arrivalTime) }}</td>
            <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ formatDT(row.departureTime) }}</td>

            <!-- ბარათის select: ბლოკირება arrived/left-ზე -->
            <td class="px-4 py-3 whitespace-nowrap">
              <select
                  :value="row.cardNo || ''"
                  @change="setCard(row.pid, $event.target.value)"
                  :disabled="row.status === 'arrived' || row.status === 'left'"
                  class="h-9 rounded-lg border border-gray-300 px-2 text-sm text-gray-700
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none
                         disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">ბარათი</option>
                <option v-for="n in CARD_OPTIONS" :key="n" :value="String(n)">{{ n }}</option>
              </select>
            </td>

            <!-- ქმედება: ბლოკირება თუ ბარათი არაა არჩეული ან უკვე left -->
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <div class="relative inline-block text-left">
                <button
                    @click="toggleDropdown(row.pid)"
                    :disabled="row.status === 'left' || !row.cardNo"
                    :title="!row.cardNo ? 'ბარათის ნომერი აირჩიე' : ''"
                    class="h-9 rounded-lg border border-gray-300 px-3 text-sm text-gray-700 flex items-center gap-1
                           hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  ქმედება
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                <!-- DROPDOWN: თუ არ არის მონიშნული - მხოლოდ "მოვიდა"; თუ უკვე მოვიდა - მხოლოდ "წავიდა" -->
                <div
                    v-if="dropdownOpen === row.pid && row.status !== 'left' && row.cardNo"
                    class="absolute right-0 mt-1 w-28 bg-white border border-gray-200 rounded-xl shadow-lg z-10"
                >
                  <!-- "მოვიდა" მხოლოდ მაშინ, როცა ჯერ არ არის მოვიდა -->
                  <button
                      v-if="row.status !== 'arrived'"
                      @click="markArrival(row.pid)"
                      class="block w-full text-left text-sm text-gray-700 hover:bg-red-50 px-3 py-2"
                  >
                    მოვიდა
                  </button>

                  <!-- "წავიდა" მხოლოდ მაშინ, როცა სტატუსი უკვე arrived-ია -->
                  <button
                      v-if="row.status === 'arrived'"
                      @click="markDeparture(row.pid)"
                      class="block w-full text-left text-sm text-gray-700 hover:bg-green-50 px-3 py-2"
                  >
                    წავიდა
                  </button>
                </div>
              </div>
            </td>
          </tr>
          </tbody>

          <tbody v-else>
          <tr>
            <td colspan="10" class="px-4 py-10 text-center text-gray-500">ჩანაწერები არ მოიძებნა.</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import NavBar from '@/components/NavBar.vue'

const dropdownOpen = ref(null)
const LS_KEY = 'visitors_table_v1'           // ვიზიტორების სია (Form-დან)
const LS_ATT = 'visitors_attendance_v1'      // სტატუსები + დროები + ბარათი
const LS_EMP = 'employees_list_v1'           // თანამშრომლები: { id, fullName, position }

const attendances = reactive([])
let intervalId = null

const filters = reactive({
  q: '',
  from: '', // datetime-local
  to: ''    // datetime-local
})

/* ბარათების სია 1..20 */
const CARD_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1)

/* თანამშრომლების ინდექსი */
function buildEmployeeIndex(list = []) {
  const byId = new Map()
  list.forEach(e => {
    const id = String(e.id ?? '')
    if (!id) return
    byId.set(id, {
      name: e.fullName || '',
      position: e.position || ''
    })
  })
  return { byId }
}

/* ჩატვირთვა + ნორმალიზაცია */
function loadVisitors() {
  const vraw = localStorage.getItem(LS_KEY)
  const araw = localStorage.getItem(LS_ATT)
  const eraw = localStorage.getItem(LS_EMP)

  const visitors = vraw ? safeJSON(vraw, []) : []
  const attendance = araw ? safeJSON(araw, {}) : {}
  const employees = eraw ? safeJSON(eraw, []) : []

  const empIndex = buildEmployeeIndex(employees)

  attendances.splice(0)

  visitors.forEach(v => {
    // თუ host-ის სახელი/პოზიცია აკლია, ავავსოთ employees-დან
    let hostName = v.hostName || ''
    let hostPosition = v.hostPosition || ''
    const id = String(v.hostId ?? '')

    if ((!hostName || !hostPosition) && id && empIndex.byId.has(id)) {
      const m = empIndex.byId.get(id)
      hostName = hostName || m.name || ''
      hostPosition = hostPosition || m.position || ''
    }

    const a = attendance[v.pid] || {}

    attendances.push({
      ...v,
      hostName,
      hostPosition,
      status: a.status || '',
      arrivalTime: a.arrivalTime || '',
      departureTime: a.departureTime || '',
      cardNo: a.cardNo || ''
    })
  })
}

/* 7-დღიანი no-show */
function checkNoShows() {
  const vraw = localStorage.getItem(LS_KEY)
  if (!vraw) return

  const visitors = safeJSON(vraw, [])
  const araw = localStorage.getItem(LS_ATT)
  const attendance = araw ? safeJSON(araw, {}) : {}

  const now = Date.now()
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
  let changed = false

  visitors.forEach(v => {
    if (!v?.pid || !v?.createdAt) return

    const createdTs = new Date(v.createdAt).getTime()
    if (Number.isNaN(createdTs)) return

    const a = attendance[v.pid] || {}
    const hasArrival = !!a.arrivalTime
    const isFinal = a.status === 'arrived' || a.status === 'left'
    const isOlderThan7d = (now - createdTs) >= sevenDaysMs

    if (isOlderThan7d && !hasArrival && !isFinal && a.status !== 'არ გამოცხადდა') {
      attendance[v.pid] = {
        ...a,
        status: 'არ გამოცხადდა',
        noShowAt: new Date().toISOString()
      }
      changed = true
    }
  })

  if (changed) {
    localStorage.setItem(LS_ATT, JSON.stringify(attendance))
    loadVisitors()
  }
}

/* შენახვა LS-ში */
function saveAttendance() {
  const obj = {}
  attendances.forEach(a => {
    obj[a.pid] = {
      status: a.status,
      arrivalTime: a.arrivalTime,
      departureTime: a.departureTime,
      cardNo: a.cardNo || ''
    }
  })
  localStorage.setItem(LS_ATT, JSON.stringify(obj))
}

/* UI actions */
function toggleDropdown(pid) {
  dropdownOpen.value = dropdownOpen.value === pid ? null : pid
}

function markArrival(pid) {
  const target = attendances.find(a => a.pid === pid)
  if (!target) return

  // ბლოკი: ბარათი უნდა იყოს არჩეული
  if (!target.cardNo) {
    alert('გთხოვ, აირჩიე ბარათის ნომერი სანამ მონიშნავ "მოვიდა"-დ!')
    dropdownOpen.value = null
    return
  }

  // უკვე მოვიდა? არაფერი ქნა
  if (target.status === 'arrived') {
    dropdownOpen.value = null
    return
  }

  target.status = 'arrived'
  target.arrivalTime = new Date().toISOString()
  dropdownOpen.value = null
  saveAttendance()
}

function markDeparture(pid) {
  const target = attendances.find(a => a.pid === pid)
  if (!target) return

  // დაცვა: სანამ არ არის "arrived", ვერ წავა
  if (target.status !== 'arrived') {
    alert('სანამ ვიზიტორი "მოვიდა"-დ არ მოინიშნება, "წავიდა"-ს მონიშვნა შეუძლებელია.')
    dropdownOpen.value = null
    return
  }

  target.status = 'left'
  target.departureTime = new Date().toISOString()
  dropdownOpen.value = null
  saveAttendance()
}

function setCard(pid, value) {
  const target = attendances.find(a => a.pid === pid)
  if (!target) return
  target.cardNo = value || ''
  saveAttendance()
}

function resetFilters() {
  filters.q = ''
  filters.from = ''
  filters.to = ''
}

/* Filters */
const filtered = computed(() => {
  const q = filters.q.toLowerCase().trim()
  const fromMs = toMillis(filters.from)
  const toMs = toMillis(filters.to)

  return attendances.filter(r => {
    const matchesText =
        !q ||
        r.firstName?.toLowerCase().includes(q) ||
        r.lastName?.toLowerCase().includes(q) ||
        r.pid?.includes(q) ||
        r.hostName?.toLowerCase().includes(q) ||
        r.hostPosition?.toLowerCase().includes(q)

    if (!matchesText) return false

    if (!fromMs && !toMs) return true

    const a = isoToMs(r.arrivalTime)
    const d = isoToMs(r.departureTime)

    const inRange = (t) => {
      if (!t) return false
      if (fromMs && t < fromMs) return false
      if (toMs && t > toMs) return false
      return true
    }

    return inRange(a) || inRange(d)
  })
})

/* utils */
function maskPid(pid) {
  if (!pid) return ''
  const s = String(pid)
  const last3 = s.slice(-3)
  return '•'.repeat(Math.max(0, s.length - 3)) + last3
}

function toMillis(dtLocal) {
  if (!dtLocal) return null
  const ms = new Date(dtLocal).getTime()
  return Number.isNaN(ms) ? null : ms
}

function isoToMs(iso) {
  if (!iso) return null
  const ms = new Date(iso).getTime()
  return Number.isNaN(ms) ? null : ms
}

function formatDT(iso) {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleString('ka-GE', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

function safeJSON(s, fallback) {
  try { return JSON.parse(s) } catch { return fallback }
}

function onStorage(e) {
  if ([LS_KEY, LS_ATT, LS_EMP].includes(e.key)) {
    loadVisitors()
    checkNoShows()
  }
}

onMounted(() => {
  loadVisitors()
  checkNoShows()

  window.addEventListener('storage', onStorage)
  window.addEventListener('focus', checkNoShows)

  // საათში ერთხელ, სანამ გვერდი ღიაა
  intervalId = window.setInterval(checkNoShows, 60 * 60 * 1000)
})

onBeforeUnmount(() => {
  window.removeEventListener('storage', onStorage)
  window.removeEventListener('focus', checkNoShows)
  if (intervalId) {
    window.clearInterval(intervalId)
    intervalId = null
  }
})
</script>

<style scoped>
table td, table th { line-height: 1.25; }
</style>

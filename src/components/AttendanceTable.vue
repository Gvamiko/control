<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-0">
    <h2 class="text-2xl font-semibold text-gray-900 mb-6">დასწრების ცხრილი</h2>

    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-visible">
      <!-- Filters -->
      <div class="p-4 border-b border-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
          <!-- Search -->
          <div class="md:col-span-4">
            <label class="block text-sm text-gray-600 mb-1">ძიება (სახელი, გვარი, პირადი)</label>
            <input
                v-model.trim="filters.q"
                type="text"
                placeholder="მაგ: გიორგი, დოლმაზაშვილი ან 12345678901"
                class="w-full h-11 text-sm rounded-xl border border-gray-300 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <!-- From -->
          <div class="md:col-span-3">
            <label class="block text-sm text-gray-600 mb-1">დრო — საიდან</label>
            <input
                v-model="filters.from"
                type="datetime-local"
                class="w-full h-11 text-sm rounded-xl border border-gray-300 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
          </div>

          <!-- To -->
          <div class="md:col-span-3">
            <label class="block text-sm text-gray-600 mb-1">დრო — სადამდე</label>
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
              ფილტრების გასუფთავება
            </button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm relative">
          <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">#</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">სახელი</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">გვარი</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">პირადი ნომერი</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">სტატუსი</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">მოსვლის დრო</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">წასვლის დრო</th>
            <th class="px-4 py-3 text-right font-medium text-gray-500 uppercase tracking-wide">მონიშვნა</th>
          </tr>
          </thead>

          <tbody v-if="filtered.length" class="bg-white divide-y divide-gray-100 relative z-0">
          <tr v-for="(row, idx) in filtered" :key="row.pid" class="align-middle relative z-0">
            <td class="px-4 py-3 text-gray-500">{{ idx + 1 }}</td>
            <td class="px-4 py-3 text-gray-900">{{ row.firstName }}</td>
            <td class="px-4 py-3 text-gray-900">{{ row.lastName }}</td>
            <td class="px-4 py-3 font-mono text-gray-800">{{ row.pid }}</td>

            <td class="px-4 py-3">
                <span
                    v-if="row.status === 'arrived'"
                    class="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full"
                >მოვიდა</span
                >
              <span
                  v-else-if="row.status === 'left'"
                  class="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full"
              >წავიდა</span
              >
              <span
                  v-else
                  class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full"
              >მოუნიშნავი</span
              >
            </td>

            <td class="px-4 py-3 text-gray-600">{{ formatDT(row.arrivalTime) }}</td>
            <td class="px-4 py-3 text-gray-600">{{ formatDT(row.departureTime) }}</td>

            <td class="px-4 py-3 text-right relative z-[1000]">
              <div class="relative inline-block text-left z-[9999]">
                <button
                    @click="toggleDropdown(row.pid)"
                    class="h-9 rounded-lg border border-gray-300 px-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-1 z-99"
                >
                  მონიშვნა
                  <svg
                      class="w-4 h-4 text-gray-500 z-99"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                <!-- DROPDOWN -->
                <div
                    v-if="dropdownOpen === row.pid"
                    class="absolute right-0 mt-1 w-28 bg-white border border-gray-200 rounded-xl shadow-xl z-99"
                >
                  <button
                      @click="markArrival(row.pid)"
                      class="block w-full text-left text-sm text-gray-700 hover:bg-red-50 px-3 py-2 z-99"
                  >
                    მოვიდა
                  </button>
                  <button
                      @click="markDeparture(row.pid)"
                      class="block w-full text-left text-sm text-gray-700 hover:bg-green-50 px-3 py-2 z-99"
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
            <td colspan="8" class="px-4 py-10 text-center text-gray-500">ჩანაწერები არ მოიძებნა.</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'

const dropdownOpen = ref(null)
const LS_KEY = 'visitors_table_v1'
const LS_ATTENDANCE = 'visitors_attendance_v1'

const attendances = reactive([])

const filters = reactive({
  q: '',
  from: '',
  to: ''
})

function loadVisitors() {
  const visitorsRaw = localStorage.getItem(LS_KEY)
  const attendanceRaw = localStorage.getItem(LS_ATTENDANCE)
  const visitors = visitorsRaw ? JSON.parse(visitorsRaw) : []
  const attendanceData = attendanceRaw ? JSON.parse(attendanceRaw) : {}

  attendances.splice(0)
  visitors.forEach(v => {
    attendances.push({
      ...v,
      status: attendanceData[v.pid]?.status || '',
      arrivalTime: attendanceData[v.pid]?.arrivalTime || '',
      departureTime: attendanceData[v.pid]?.departureTime || ''
    })
  })
}

function saveAttendance() {
  const obj = {}
  attendances.forEach(a => {
    obj[a.pid] = {
      status: a.status,
      arrivalTime: a.arrivalTime,
      departureTime: a.departureTime
    }
  })
  localStorage.setItem(LS_ATTENDANCE, JSON.stringify(obj))
}

function toggleDropdown(pid) {
  dropdownOpen.value = dropdownOpen.value === pid ? null : pid
}

function markArrival(pid) {
  const target = attendances.find(a => a.pid === pid)
  if (target) {
    target.status = 'arrived'
    target.arrivalTime = new Date().toISOString()
  }
  dropdownOpen.value = null
  saveAttendance()
}

function markDeparture(pid) {
  const target = attendances.find(a => a.pid === pid)
  if (target) {
    target.status = 'left'
    target.departureTime = new Date().toISOString()
  }
  dropdownOpen.value = null
  saveAttendance()
}

function resetFilters() {
  filters.q = ''
  filters.from = ''
  filters.to = ''
}

const filtered = computed(() => {
  const q = filters.q.toLowerCase().trim()
  const fromMs = toMillis(filters.from)
  const toMs = toMillis(filters.to)

  return attendances.filter(r => {
    const matchesText =
        !q ||
        r.firstName.toLowerCase().includes(q) ||
        r.lastName.toLowerCase().includes(q) ||
        r.pid.includes(q)
    if (!matchesText) return false

    if (!fromMs && !toMs) return true

    const a = isoToMs(r.arrivalTime)
    const d = isoToMs(r.departureTime)
    const inRange = t => {
      if (!t) return false
      if (fromMs && t < fromMs) return false
      if (toMs && t > toMs) return false
      return true
    }
    return inRange(a) || inRange(d)
  })
})

function toMillis(dt) {
  if (!dt) return null
  const ms = new Date(dt).getTime()
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
  return d.toLocaleString('ka-GE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

onMounted(loadVisitors)
</script>

<style scoped>
table td,
table th {
  line-height: 1.25;
}
</style>

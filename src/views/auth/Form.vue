<template>
  <div>
    <NavBar />

    <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl sm:text-2xl font-semibold text-gray-900">შევსების ფორმა</h1>
        <p class="mt-1 text-sm text-gray-500">შეავსე ველები და დაამატე ჩანაწერი ცხრილში</p>
      </div>

      <!-- Form Card -->
      <div class="bg-white rounded-xl shadow-sm p-4 bg-white rounded-xl shadow-sm p-4 mb-4">
        <form @submit.prevent="handleAdd" class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <!-- სახელი -->
          <div class="md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">სახელი</label>
            <input
                v-model.trim="form.firstName"
                type="text"
                placeholder="მაგ: გიორგი"
                class="w-full h-11 text-sm rounded-xl border border-gray-300 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
            <p v-if="errors.firstName" class="text-xs text-red-600 mt-1">{{ errors.firstName }}</p>
          </div>

          <!-- გვარი -->
          <div class="md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">გვარი</label>
            <input
                v-model.trim="form.lastName"
                type="text"
                placeholder="მაგ: დოლმაზაშვილი"
                class="w-full h-11 text-sm rounded-xl border border-gray-300 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
            <p v-if="errors.lastName" class="text-xs text-red-600 mt-1">{{ errors.lastName }}</p>
          </div>

          <!-- პირადი ნომერი -->
          <div class="md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">პირადი ნომერი</label>
            <input
                v-model.trim="form.pid"
                inputmode="numeric"
                maxlength="11"
                placeholder="11 ციფრი"
                @input="form.pid = form.pid.replace(/\D/g, '').slice(0,11)"
                class="w-full h-11 text-sm rounded-xl border border-gray-300 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            />
            <p v-if="errors.pid" class="text-xs text-red-600 mt-1">{{ errors.pid }}</p>
          </div>

          <!-- სტუმრად ვისთან (დროპდაუნი თანამშრომლების სიიდან) -->
          <div class="md:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">სტუმრად ვისთან</label>
            <select
                v-model="form.hostId"
                class="w-full h-11 text-sm rounded-xl border border-gray-300 px-3 pr-8 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
            >
              <option disabled value="">აირჩიე თანამშრომელი</option>
              <option v-for="e in employees" :key="e.id" :value="e.id">
                {{ e.fullName }} — {{ e.position }}
              </option>
            </select>
            <p v-if="errors.hostId" class="text-xs text-red-600 mt-1">{{ errors.hostId }}</p>
          </div>

          <!-- Action buttons -->
          <div class="md:col-span-1">
            <div class="flex justify-start mt-6 gap-3">
              <button
                  type="submit"
                  class="rounded-xl bg-green-600 text-white px-3 h-11 text-sm font-medium hover:bg-green-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  :disabled="!canSubmit"
                  title="დამატება"
              >
                დამატება
              </button>



              <button
                  type="button"
                  @click="resetForm"
                  class="rounded-xl border border-gray-300 text-gray-700 px-3 h-11 text-sm font-medium hover:bg-gray-50 transition"
                  title="გასუფთავება"
              >
                გასუფთავება
              </button>
            </div>
          </div>
        </form>

        <!-- Alert -->
        <div
            v-if="alert.message"
            :class="[
            'mt-4 rounded-xl px-4 py-3 text-sm',
            alert.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : alert.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-blue-50 text-blue-700 border border-blue-200',
          ]"
        >
          {{ alert.message }}
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm bg-white rounded-xl shadow-sm ">
        <div class="p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div class="md:col-span-2">
            <div class="md:col-span-4 flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
              <div class="sm:ml-auto w-full sm:w-72">
                <input
                    v-model.trim="search"
                    type="text"
                    placeholder="ძიება (სახელი, გვარი, პირადი, მასპინძელი)"
                    class="w-full h-11 text-sm rounded-xl border border-gray-300 px-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
                @click="clearAll"
                class="h-10 rounded-xl border border-red-300 text-red-600 px-3 text-sm hover:bg-red-50 transition"
                title="ყველას წაშლა"
            >
              გასუფთავება
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">#</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">სახელი</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">გვარი</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">პირადი ნომერი</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">სტუმრად</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wide">დამატდა</th>
              <th class="px-4 py-3 text-right font-medium text-gray-500 uppercase tracking-wide">ქმედება</th>
            </tr>
            </thead>

            <tbody v-if="filteredRows.length" class="bg-white divide-y divide-gray-100">
            <tr v-for="row in filteredRows" :key="row.pid" class="align-middle">
              <td class="px-4 py-3 text-gray-500 whitespace-nowrap">{{ row.seq }}</td>
              <td class="px-4 py-3 text-gray-900 whitespace-nowrap truncate max-w-[180px]">{{ row.firstName }}</td>
              <td class="px-4 py-3 text-gray-900 whitespace-nowrap truncate max-w-[220px]">{{ row.lastName }}</td>

              <td class="px-4 py-3 font-mono text-gray-800 whitespace-nowrap">
                {{ maskPid(row.pid) }}
              </td>

              <!-- Host column -->
              <td class="px-4 py-3 text-gray-800 whitespace-nowrap">
                <div class="flex flex-col">
                  <span class="font-medium">{{ row.hostName }}</span>
                  <span class="text-xs text-gray-500">{{ row.hostPosition }}</span>
                </div>
              </td>

              <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ formatDate(row.createdAt) }}</td>
              <td class="px-4 py-3 text-right whitespace-nowrap">
                <button
                    @click="removeRow(row.pid)"
                    class="h-9 inline-flex items-center rounded-lg border border-gray-300 px-3 text-sm text-gray-700 hover:bg-gray-50"
                >
                  წაშლა
                </button>
              </td>
            </tr>
            </tbody>

            <tbody v-else>
            <tr>
              <td colspan="7" class="px-4 py-10 text-center text-gray-500">ჩანაწერები არ მოიძებნა.</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue'

const LS_KEY = 'visitors_table_v1'
const LS_EMP = 'employees_list_v1'

const form = reactive({ firstName: '', lastName: '', pid: '', hostId: '' })
const errors = reactive({ firstName: '', lastName: '', pid: '', hostId: '' })
const alert = reactive({ type: 'info', message: '' })
const state = reactive({ rows: [], search: '' })
const employees = reactive([])

const search = computed({
  get: () => state.search,
  set: v => (state.search = v)
})

const filteredRows = computed(() => {
  const q = state.search.toLowerCase().trim()
  if (!q) return state.rows
  return state.rows.filter(r =>
      r.firstName.toLowerCase().includes(q) ||
      r.lastName.toLowerCase().includes(q) ||
      r.pid.includes(q) ||
      r.hostName.toLowerCase().includes(q) ||
      r.hostPosition.toLowerCase().includes(q)
  )
})

const canSubmit = computed(() =>
    form.firstName.trim().length >= 2 &&
    form.lastName.trim().length >= 2 &&
    /^\d{11}$/.test(form.pid) &&
    !!form.hostId
)

function validate() {
  errors.firstName = form.firstName.trim().length >= 2 ? '' : 'შეიყვანე მინ. 2 ასო.'
  errors.lastName  = form.lastName.trim().length  >= 2 ? '' : 'შეიყვანე მინ. 2 ასო.'
  errors.pid       = /^\d{11}$/.test(form.pid) ? '' : 'პირადი ნომერი უნდა იყოს 11 ციფრი.'
  errors.hostId    = form.hostId ? '' : 'აირჩიე თანამშრომელი (სტუმრად ვისთან).'
  if (!errors.pid && state.rows.some(r => r.pid === form.pid)) {
    errors.pid = 'ეს პირადი ნომერი უკვე დამატებულია.'
  }
  return !errors.firstName && !errors.lastName && !errors.pid && !errors.hostId
}

function getNextSeq() {
  if (!state.rows.length) return 1
  return Math.max(...state.rows.map(r => r.seq || 0)) + 1
}

function handleAdd() {
  alert.message = ''
  if (!validate()) {
    alert.type = 'error'
    alert.message = 'გთხოვ, შეასწორე ველები.'
    return
  }

  const host = employees.find(e => e.id === form.hostId)
  const next = getNextSeq()

  state.rows.unshift({
    seq: next,
    firstName: capitalize(form.firstName),
    lastName: capitalize(form.lastName),
    pid: form.pid,
    hostId: form.hostId,
    hostName: host ? host.fullName : '',
    hostPosition: host ? host.position : '',
    createdAt: new Date().toISOString(),
  })
  persist()
  alert.type = 'success'
  alert.message = 'ჩანაწერი წარმატებით დაემატა.'
  resetForm()
}

function removeRow(pid) {
  state.rows = state.rows.filter(r => r.pid !== pid)
  persist()
}

function clearAll() {
  if (confirm('ნამდვილად გსურს ყველა ჩანაწერის წაშლა?')) {
    state.rows = []
    persist()
  }
}

function resetForm() {
  form.firstName = ''
  form.lastName = ''
  form.pid = ''
  form.hostId = ''
  errors.firstName = errors.lastName = errors.pid = errors.hostId = ''
}

function persist() {
  localStorage.setItem(LS_KEY, JSON.stringify(state.rows))
}

function load() {
  // Load visitors
  const raw = localStorage.getItem(LS_KEY)
  if (raw) {
    try { state.rows = JSON.parse(raw) || [] } catch { state.rows = [] }
  }

  // Backfill seq old rows
  const hasAnySeq = state.rows.some(r => typeof r.seq === 'number')
  if (!hasAnySeq && state.rows.length) {
    const sorted = [...state.rows].sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt))
    sorted.forEach((r,i) => r.seq = i + 1)
    const map = new Map(sorted.map(r => [r.pid, r.seq]))
    state.rows.forEach(r => { r.seq = map.get(r.pid) })
    persist()
  }

  // Load employees
  const eraw = localStorage.getItem(LS_EMP)
  if (eraw) {
    try {
      const arr = JSON.parse(eraw) || []
      employees.splice(0, employees.length, ...arr)
    } catch {
      seedEmployees()
    }
  } else {
    seedEmployees()
  }
}

function seedEmployees() {
  // შეგიძლიათ ჩაანაცვლოთ რეალური მონაცემებით ან API-დან ჩატვირთოთ
  const demo = [
    { id: 'e001', fullName: 'ანა ქავთარაძე', position: 'HR Manager' },
    { id: 'e002', fullName: 'გიორგი კაპანაძე', position: 'IT Support' },
    { id: 'e003', fullName: 'მარიამ მაჭარაშვილი', position: 'Finance Specialist' },
    { id: 'e004', fullName: 'დავით ლომიძე', position: 'Network Engineer' },
    { id: 'e005', fullName: 'სოფო ჭანტურია', position: 'Operations Lead' },
  ]
  localStorage.setItem(LS_EMP, JSON.stringify(demo))
  employees.splice(0, employees.length, ...demo)
}

function capitalize(s) {
  if (!s) return s
  const t = s.trim()
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/** მხოლოდ ჩვენებაზე ვამასკებთ – ბოლო 3 ციფრი ჩანს */
function maskPid(pid) {
  if (!pid) return ''
  const s = String(pid)
  const last3 = s.slice(-3)
  return '•'.repeat(Math.max(0, s.length - 3)) + last3
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleString('ka-GE')
}

onMounted(load)
</script>

<style scoped>
table td, table th { line-height: 1.25; }
</style>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div class="w-full max-w-md">
      <div class="bg-white shadow-xl rounded-2xl p-6 md:p-8">
        <img src="../../assets/img/water.png" alt="logo" class="mb-3  object-contain mx-auto">
        <div class="mb-6 text-center">
          <h1 class="text-2xl font-semibold text-gray-900">ავტორიზაცია</h1>
          <p class="text-sm text-gray-500 mt-1">ვიზიტორების კონტროლი</p>
        </div>

        <!-- Stepper -->
        <div class="flex items-center justify-center gap-3 mb-6">
          <div :class="['h-2 w-24 rounded-full', step===1 ? 'bg-blue-600' : 'bg-blue-200']"></div>
          <div :class="['h-2 w-24 rounded-full', step===2 ? 'bg-blue-600' : 'bg-blue-200']"></div>
        </div>

        <!-- STEP 1: Phone only -->
        <form v-if="step === 1" @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">მობილურის ნომერი</label>
            <input
                v-model.trim="form.phone"
                type="tel"
                inputmode="tel"
                autocomplete="tel"
                class="w-full h-11 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 text-sm"
                placeholder="599123123"
                required
                @input="onPhoneInput"
            />
            <p class="text-xs text-gray-500 mt-1">გთხოვთ აკრიფოთ  მობილურის ნოემრი</p>
          </div>

          <button
              type="submit"
              class="w-full h-11 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              :disabled="loading"
          >
            <svg v-if="loading" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l0 0A4 4 0 008 12H4z"/>
            </svg>
            {{ loading ? 'კოდის გაგზავნა...' : 'კოდის მიღება' }}
          </button>

          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        </form>

        <!-- STEP 2: OTP -->
        <form v-else @submit.prevent="handleVerify" class="space-y-5">
          <div class="text-center">
            <h2 class="text-lg font-medium text-gray-900">დაადასტურეთ კოდი</h2>
            <p class="text-sm text-gray-500 mt-1">
              კოდი გამოგზავნილია მობილურის ნომერზე
            </p>
            <span class="font-medium text-gray-700">{{ maskedDestination }}</span>
          </div>

          <div class="flex justify-center gap-2">
            <input
                v-for="(d,i) in otp"
                :key="i"
                ref="otpRefs"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="1"
                class="w-11 h-12 text-center text-lg tracking-widest rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                v-model="otp[i]"
                @input="onOtpInput(i)"
                @keydown.backspace.prevent="onOtpBackspace(i, $event)"
                @paste.prevent="onOtpPaste($event)"
                required
            />
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-500">კოდი იწურება: {{ mm }}:{{ ss }}</span>
              <button
                  type="button"
                  @click="resendCode"
                  :disabled="resendDisabled"
                  class="text-sm font-medium"
                  :class="resendDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:underline'"
              >
                კოდის თავიდან გაგზავნა
              </button>
            </div>
          </div>

          <button
              type="submit"
              class="w-full h-11 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              :disabled="loading || !isOtpComplete"
          >
            <svg v-if="loading" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l0 0A4 4 0 008 12H4z"/>
            </svg>
            დადასტურება
          </button>

          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// --- State
const step = ref(1)
const loading = ref(false)
const error = ref('')

const form = ref({
  phone: '',
})

// OTP state
const OTP_LENGTH = 6
const otp = ref(Array.from({ length: OTP_LENGTH }, () => ''))
const otpRefs = ref([])
const destination = ref('') // ნორმალიზებული ტელეფონი (e.g. +9955XXXXXXXX)

// Timer
const EXPIRE_SECONDS = 120
const left = ref(EXPIRE_SECONDS)
let timer = null
const mm = computed(() => String(Math.floor(left.value / 60)).padStart(2, '0'))
const ss = computed(() => String(left.value % 60).padStart(2, '0'))
const resendDisabled = computed(() => left.value > 0)
const isOtpComplete = computed(() => otp.value.every(d => d !== '' && /^\d$/.test(d)))

// --- Helpers (phone)
function onlyDigits(str) { return (str || '').replace(/\D/g, '') }

// ქართულზე ორიენტირებული მარტივი ნორმალიზაცია:
// "5XXXXXXXX" -> "+9955XXXXXXXX"
// "+9955XXXXXXXX" რჩება იგივე
function normalizePhone(input) {
  const raw = (input || '').trim()
  const digits = onlyDigits(raw)
  if (!digits) return ''

  if (raw.startsWith('+995')) {
    return `+995${onlyDigits(raw).slice(-9)}`
  }

  if (digits.length === 9 && digits.startsWith('5')) {
    return `+995${digits}`
  }

  if (digits.length >= 9) {
    return `+995${digits.slice(-9)}`
  }
  return ''
}

// მაკსირება: ვაჩვენოთ მხოლოდ ბოლო 3 ციფრი
function formatMaskedPhone(p) {
  const d = onlyDigits(p)
  if (d.length < 9) return p || ''
  const last9 = d.slice(-9)        // 5XXXXXXXX
  const visible = last9.slice(-2)  // ბოლო 3 ციფრი
  const masked = last9.slice(0, -2).replace(/\d/g, '*')
  // შედეგი: +995 ***** ** *XYZ  (ვინახავთ ვიზუალურ ჯგუფირებას)
  return `+995 ${masked.slice(0,5)} ${masked.slice(5,7)} ${masked.slice(7,8)}${visible}`
}
const maskedDestination = computed(() => formatMaskedPhone(destination.value))

function onPhoneInput() {
  // სურვილის შემთხვევაში აქვე ჩასვი live-ფორმატირება
}

// --- Mock API (demo)
const fakeApi = {
  login: (phone) => new Promise((resolve, reject) => {
    setTimeout(() => {
      const normalized = normalizePhone(phone)
      if (normalized) resolve({ ok: true, destination: normalized })
      else reject(new Error('არასწორი მობილურის ნომერი'))
    }, 500)
  }),
  sendOtp: () => new Promise(res => setTimeout(() => res({ ok: true }), 400)),
  verifyOtp: (code) => new Promise((resolve, reject) => {
    setTimeout(() => {
      if (code === '123456') resolve({ ok: true })
      else reject(new Error('კოდი არასწორია'))
    }, 600)
  }),
}

// --- Actions
async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    const res = await fakeApi.login(form.value.phone)
    destination.value = res.destination // +9955XXXXXXXX
    step.value = 2
    await nextTick()
    left.value = EXPIRE_SECONDS
    startTimer()
    focusOtp(0)
  } catch (e) {
    error.value = e.message || 'ავტორიზაცია ვერ მოხერხდა'
  } finally {
    loading.value = false
  }
}

async function handleVerify() {
  error.value = ''
  if (!isOtpComplete.value) {
    error.value = 'შეავსეთ ყველა ველი'
    return
  }
  loading.value = true
  try {
    const code = otp.value.join('')
    const res = await fakeApi.verifyOtp(code)
    if (res.ok) {
      // წარმატებული ვერიფიკაცია → ავტორიზებული
      localStorage.setItem('auth_token', 'demo-token')

      const redirectTo =
          typeof route.query.redirect === 'string' && route.query.redirect
              ? route.query.redirect
              : '/'

      await router.replace(redirectTo)
    }
  } catch (e) {
    error.value = e.message || 'დადასტურება ვერ მოხერხდა'
  } finally {
    loading.value = false
  }
}

async function resendCode() {
  if (resendDisabled.value) return
  error.value = ''
  loading.value = true
  try {
    await fakeApi.sendOtp()
    left.value = EXPIRE_SECONDS
    startTimer()
    otp.value = Array.from({ length: OTP_LENGTH }, () => '')
    await nextTick()
    focusOtp(0)
  } catch {
    error.value = 'ვერ გაიგზავნა კოდი'
  } finally {
    loading.value = false
  }
}

// --- OTP UX
function focusOtp(i) {
  const el = otpRefs.value[i]
  if (el) el.focus()
}

function onOtpInput(i) {
  const v = otp.value[i]
  if (!/^\d$/.test(v)) {
    otp.value[i] = ''
    return
  }
  if (i < OTP_LENGTH - 1) focusOtp(i + 1)
}

function onOtpBackspace(i) {
  if (otp.value[i]) {
    otp.value[i] = ''
    return
  }
  if (i > 0) {
    otp.value[i - 1] = ''
    focusOtp(i - 1)
  }
}

function onOtpPaste(e) {
  const text = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, OTP_LENGTH)
  if (!text) return
  for (let i = 0; i < OTP_LENGTH; i++) otp.value[i] = text[i] || ''
  const last = Math.min(text.length, OTP_LENGTH) - 1
  if (last >= 0) focusOtp(last)
}

// --- Timer
function startTimer() {
  stopTimer()
  timer = setInterval(() => {
    if (left.value > 0) left.value -= 1
    else stopTimer()
  }, 1000)
}
function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}
onBeforeUnmount(stopTimer)
</script>

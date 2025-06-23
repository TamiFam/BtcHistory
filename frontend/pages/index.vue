<template>
  <div class="container">
    <h1>Биткоин</h1>

    <div class="filter">
      <label for="range">Период:</label>
      <select id="range" v-model="range">
        <option value="day">📅 День</option>
        <option value="week">🗓️ Неделя</option>
        <option value="month">📘 Месяц</option>
        <option value="year">📆 Год</option>
        <option value="custom">⚙️ Пользовательский</option>
      </select>
    </div>

    <div class="custom-range" v-if="range === 'custom'">
      <input type="date" v-model="startDate" />
      <span>–</span>
      <input type="date" v-model="endDate" />
      <div v-if="dateError" style="color: red; margin-top: 6px;">{{ dateError }}</div>
      <div v-if="noDataError" style="color: red; margin-top: 6px;">{{ noDataError }}</div>
    </div>

    <PriceChart v-if="history.length" :data="history" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import PriceChart from '../components/PriceChart.vue'
import axios from 'axios'
import { useRuntimeConfig } from 'nuxt/app'
import '@/assets/css/chart-page.css'

type DataPoint = {
  timestamp: string
  price: number
}

const history = ref<DataPoint[]>([])
const range = ref('day')
const startDate = ref('')
const endDate = ref('')
const dateError = ref('')
const noDataError = ref('')
const config = useRuntimeConfig()

function getRangeDates() {
  const now = new Date()
  let from = new Date()
  let to = now

  switch (range.value) {
    case 'day':
      from.setHours(0, 0, 0, 0)
      break
    case 'week':
      from.setDate(now.getDate() - 7)
      break
    case 'month':
      from.setMonth(now.getMonth() - 1)
      break
    case 'year':
      from.setFullYear(now.getFullYear() - 1)
      break
    case 'custom':
      if (!startDate.value || !endDate.value) return null
      from = new Date(startDate.value)
      to = new Date(endDate.value)
      break
  }

  return { from, to }
}

async function fetchPrices() {
  const dates = getRangeDates()
  if (!dates) return

  const { from, to } = dates
  if (from > to) {
    dateError.value = 'Начальная дата не может быть позже конечной'
    noDataError.value = ''
    history.value = []
    return
  } else {
    dateError.value = ''
  }

  try {
    const response = await axios.get(`${config.public.backendApi}/prices`, {
      params: {
        start: from.toISOString(),
        end: to.toISOString()
      }
    })

    if (response.data.length === 0) {
      noDataError.value = 'Данные за выбранный период отсутствуют'
      history.value = []
    } else {
      noDataError.value = ''
      history.value = response.data
    }
  } catch (err) {
    console.error('Ошибка получения данных', err)
    noDataError.value = 'Ошибка получения данных с сервера'
    history.value = []
  }
}

watch(range, () => {
  noDataError.value = ''
  if (range.value !== 'custom') {
    fetchPrices()
  }
})

watch([startDate, endDate], () => {
  noDataError.value = ''
  if (range.value === 'custom' && startDate.value && endDate.value) {
    const from = new Date(startDate.value)
    const to = new Date(endDate.value)
    if (from <= to) {
      dateError.value = ''
      fetchPrices()
    } else {
      dateError.value = 'Начальная дата не может быть позже конечной'
      history.value = []
    }
  }
})

fetchPrices()
</script>

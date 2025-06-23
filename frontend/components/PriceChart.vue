<template>
  <canvas ref="canvas"></canvas>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

interface Price {
  timestamp: string
  price: number
}

const props = defineProps<{ data: Price[] }>()

const canvas = ref<HTMLCanvasElement>()
let chart: Chart | null = null

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString() // например, 20.06.2025
}
function updateChart(data: Price[]) {
  if (!canvas.value) return
  if (chart) chart.destroy()

  const labels = data.map(p => formatDate(p.timestamp))
  const prices = data.map(p => p.price)

  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.value.height)
  gradient.addColorStop(0, 'rgba(75,192,192,0.4)')
  gradient.addColorStop(1, 'rgba(75,192,192,0)')

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Цена BTC',
        data: prices,
        fill: true,
        backgroundColor: gradient,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)'
      }]
    },
    options: {
      responsive: true,
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      },
      
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#333',
            font: {
              size: 14
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (context) => ` $${context.parsed.y.toFixed(2)}`
          }
        }
      },
      scales: {
        x: {
          ticks: {
            maxTicksLimit: 15,
            autoSkip: true,
            maxRotation: 45,
            minRotation: 45
          },
          grid: {
            color: 'rgba(200, 200, 200, 0.2)'
          }
        },
        y: {
          ticks: {
            callback: value => `$${value}`
          },
          grid: {
            color: 'rgba(200, 200, 200, 0.2)'
          }
        }
      }
    }
  })
}


// Следим за изменением данных и обновляем график
watch(() => props.data, (newData) => {
  updateChart(newData)
}, { immediate: true })

// При монтировании, если данные уже есть, инициализируем график
onMounted(() => {
  if (props.data.length) {
    updateChart(props.data)
  }
})
</script>

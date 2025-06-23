import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  css: [
    '@/assets/css/chart-page.css' // 🔥 вот эта строка подключает CSS
  ],
  modules: [],
  runtimeConfig: {
    public: {
      backendApi: 'http://localhost:3001/api'
    }
  }
})

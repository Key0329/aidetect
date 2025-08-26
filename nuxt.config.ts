// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  ssr: false,
  modules: ['@nuxt/eslint', '@nuxt/image', '@unocss/nuxt'],
  css: ['~/assets/styles/base.scss'],
  nitro: {
    prerender: {
      routes: ['/']
    }
  },
  app: {
    baseURL: '/aidetect/'
  }
})
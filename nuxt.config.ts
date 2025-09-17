// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  ssr: true, // 改為 true 以支援 SSG
  modules: ['@nuxt/eslint', '@nuxt/image', '@unocss/nuxt'],
  css: ['~/assets/styles/base.scss'],
  
  // GitHub Pages 配置
  app: {
    baseURL: '/aidetect/',
    cdnURL: '/aidetect/'
  },
  
  // Nitro 配置用於靜態生成
  nitro: {
    prerender: {
      routes: ['/', '/ai-resume-detect', '/bc', '/per'],
      crawlLinks: true
    },
    // 確保靜態資源正確路徑
    publicAssets: [
      {
        baseURL: '/aidetect/',
        dir: 'public'
      }
    ]
  },
  
  // 確保生產環境配置
  runtimeConfig: {
    public: {
      baseURL: process.env.NODE_ENV === 'production' ? '/aidetect/' : '/'
    }
  }
})
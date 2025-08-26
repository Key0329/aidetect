<script setup>
// 設定頁面標題
useHead({
  title: "AI Detect - 智能檢測工具集",
});
</script>

<template>
  <div class="home min-h-screen bg-grayscale-100">
    <!-- 頁面 Header -->
    <header class="bg-white shadow-sm">
      <div
        class="headerBlack bg-#292929 h-30px flex justify-start items-center"
      >
        <div class="py-5px px-8px">
          <a href="#" class="text-white text-14px font-bold">招募管理</a>
        </div>
        <div class="py-5px px-8px">
          <a href="#" class="text-white text-14px">人才管理</a>
        </div>
        <div class="py-5px px-8px">
          <a href="#" class="text-white text-14px">人資市集</a>
        </div>
        <div class="py-5px px-8px">
          <a href="#" class="text-white text-14px">人資充電</a>
        </div>
      </div>
      <div
        class="headerWhite bg-white h-70px flex justify-between items-center px-16px border-b-solid border-b-1px border-b-#eee"
      >
        <div class="py-5px px-8px">
          <div class="text-24px font-bold">AI Detect 工具集</div>
        </div>
        <div class="py-5px px-8px flex items-center">
          <div class="font-bold mr-1">開發者</div>
          <img
            src="@/assets/images/ai/icon_arrow_right.svg"
            alt="arrow"
            class="rotate-90"
          />
        </div>
      </div>
    </header>

    <!-- 主要內容 -->
    <main class="container mx-auto px-4 py-12">
      <!-- 歡迎區塊 -->
      <div class="text-center mb-16">
        <h1 class="text-48px font-bold text-grayscale-600 mb-6">
          AI Detect 工具集
        </h1>
        <p class="text-20px text-grayscale-500 mb-8 leading-32px">
          使用最新的 AI 技術，提供智能檢測和搜尋服務<br />
          整合多種 AI 模型，為您提供準確可靠的分析結果
        </p>
      </div>

      <!-- 功能卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Perplexity 搜尋 -->
        <div
          class="feature-card bg-white rounded-16px shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
        >
          <div class="text-center mb-6">
            <div
              class="w-16 h-16 bg-secondary-200 rounded-12px flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
            <h3 class="text-20px font-bold text-grayscale-600 mb-2">
              Perplexity AI 搜尋
            </h3>
            <p class="text-14px text-grayscale-500 mb-6 leading-24px">
              使用 Perplexity AI
              進行智能搜尋，獲得準確且有引用來源的答案，支援多種 AI 模型選擇
            </p>
          </div>
          <div class="text-center">
            <NuxtLink
              to="/per"
              class="button-primary-lg inline-flex items-center gap-2"
            >
              開始搜尋
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </NuxtLink>
          </div>
        </div>

        <!-- AI 履歷檢測 -->
        <div
          class="feature-card bg-white rounded-16px shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
        >
          <div class="text-center mb-6">
            <div
              class="w-16 h-16 bg-primary-200 rounded-12px flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
            <h3 class="text-20px font-bold text-grayscale-600 mb-2">
              AI 履歷檢測
            </h3>
            <p class="text-14px text-grayscale-500 mb-6 leading-24px">
              智能分析履歷內容，檢測 AI 生成痕跡，提供詳細的分析報告和改善建議
            </p>
          </div>
          <div class="text-center">
            <NuxtLink
              to="/ai-resume-detect"
              class="button-primary-lg inline-flex items-center gap-2"
            >
              開始檢測
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </NuxtLink>
          </div>
        </div>

        <!-- 商務卡片 -->
        <div
          class="feature-card bg-white rounded-16px shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
        >
          <div class="text-center mb-6">
            <div
              class="w-16 h-16 bg-third-200 rounded-12px flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 2h8a1 1 0 110 2H6a1 1 0 110-2zm0 3h8a1 1 0 110 2H6a1 1 0 110-2z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
            <h3 class="text-20px font-bold text-grayscale-600 mb-2">
              商務卡片
            </h3>
            <p class="text-14px text-grayscale-500 mb-6 leading-24px">
              專業的商務卡片展示功能，提供企業級的視覺效果和互動體驗
            </p>
          </div>
          <div class="text-center">
            <NuxtLink
              to="/bc"
              class="button-primary-lg inline-flex items-center gap-2"
            >
              查看展示
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- 技術特色 -->
      <div class="mt-20">
        <div class="text-center mb-12">
          <h2 class="text-32px font-bold text-grayscale-600 mb-4">技術特色</h2>
          <p class="text-16px text-grayscale-500">
            基於最新的 AI 技術和現代化的 Web 框架
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="tech-item text-center p-6">
            <div
              class="w-12 h-12 bg-secondary-300 rounded-8px flex items-center justify-center mx-auto mb-3"
            >
              <span class="text-white font-bold">AI</span>
            </div>
            <h4 class="font-semibold text-grayscale-600 mb-2">Perplexity AI</h4>
            <p class="text-14px text-grayscale-500">先進的搜尋和推理能力</p>
          </div>

          <div class="tech-item text-center p-6">
            <div
              class="w-12 h-12 bg-secondary-300 rounded-8px flex items-center justify-center mx-auto mb-3"
            >
              <span class="text-white font-bold">NU</span>
            </div>
            <h4 class="font-semibold text-grayscale-600 mb-2">Nuxt 3</h4>
            <p class="text-14px text-grayscale-500">現代化的全端框架</p>
          </div>

          <div class="tech-item text-center p-6">
            <div
              class="w-12 h-12 bg-secondary-300 rounded-8px flex items-center justify-center mx-auto mb-3"
            >
              <span class="text-white font-bold">TS</span>
            </div>
            <h4 class="font-semibold text-grayscale-600 mb-2">TypeScript</h4>
            <p class="text-14px text-grayscale-500">類型安全的開發體驗</p>
          </div>

          <div class="tech-item text-center p-6">
            <div
              class="w-12 h-12 bg-secondary-300 rounded-8px flex items-center justify-center mx-auto mb-3"
            >
              <span class="text-white font-bold">UI</span>
            </div>
            <h4 class="font-semibold text-grayscale-600 mb-2">UnoCSS</h4>
            <p class="text-14px text-grayscale-500">原子化 CSS 框架</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-grayscale-200 py-8 mt-20">
      <div class="container mx-auto px-4 text-center">
        <p class="text-14px text-grayscale-500">
          © 2025 AI Detect 工具集. 使用 Nuxt 3 和 Perplexity AI 構建.
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.feature-card {
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.tech-item {
  transition: transform 0.2s ease;
}

.tech-item:hover {
  transform: translateY(-2px);
}
</style>

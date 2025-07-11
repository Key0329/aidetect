<script setup>
const searchQuery = ref("");
const searchResult = ref(null);
const isLoading = ref(false);
const error = ref("");
const selectedModel = ref("sonar");
const refineWithOpenAI = ref(false);
const refinePrompt = ref("請將以下內容進行整理和總結，讓它更加簡潔明了：");

const models = [
  { value: "sonar", label: "Sonar" },
  { value: "sonar-pro", label: "Sonar Pro" },
  { value: "sonar-reasoning", label: "Sonar Reasoning" },
  { value: "sonar-reasoning-pro", label: "Sonar Reasoning Pro" },
];

const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    error.value = "請輸入搜尋查詢";
    return;
  }

  isLoading.value = true;
  error.value = "";
  searchResult.value = null;

  try {
    const response = await $fetch("/api/perplexity/search", {
      method: "POST",
      body: {
        query: searchQuery.value,
        model: selectedModel.value,
        refineWithOpenAI: refineWithOpenAI.value,
        refinePrompt: refinePrompt.value,
      },
    });

    searchResult.value = response;
  } catch (err) {
    error.value = err?.data?.message || err?.message || "搜尋時發生錯誤";
    console.error("Search error:", err);
  } finally {
    isLoading.value = false;
  }
};

const clearResults = () => {
  searchResult.value = null;
  error.value = "";
};

const handleKeyPress = (event) => {
  if (event.key === "Enter" && !isLoading.value) {
    performSearch();
  }
};
</script>

<template>
  <div class="perplexity-search min-h-screen bg-grayscale-100 py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- 頁面標題 -->
      <div class="text-center mb-8">
        <h1 class="text-32px font-bold text-grayscale-600 mb-4">
          Perplexity AI 搜尋
        </h1>
        <p class="text-16px text-grayscale-500">
          使用 Perplexity AI 進行智能搜尋，獲得準確且有引用來源的答案
        </p>
      </div>

      <!-- 搜尋介面 -->
      <div class="bg-white rounded-12px shadow-md p-6 mb-8">
        <!-- 模型選擇 -->
        <div class="mb-4">
          <label class="block text-14px font-medium text-grayscale-600 mb-2">
            選擇模型
          </label>
          <select
            v-model="selectedModel"
            class="w-full md:w-auto px-3 py-2 border border-grayscale-300 rounded-6px focus:outline-none focus:ring-2 focus:ring-secondary-200"
          >
            <option
              v-for="model in models"
              :key="model.value"
              :value="model.value"
            >
              {{ model.label }}
            </option>
          </select>
        </div>

        <!-- OpenAI 整理選項 -->
        <div class="mb-4 p-4 bg-grayscale-50 rounded-8px">
          <div class="flex items-center mb-3">
            <input
              id="refineWithOpenAI"
              v-model="refineWithOpenAI"
              type="checkbox"
              class="mr-2 h-4 w-4 text-secondary-200 focus:ring-secondary-200 border-grayscale-300 rounded"
            />
            <label for="refineWithOpenAI" class="text-14px font-medium text-grayscale-600">
              啟用 OpenAI 內容整理
            </label>
          </div>
          <div v-if="refineWithOpenAI" class="ml-6">
            <label class="block text-14px font-medium text-grayscale-600 mb-2">
              整理指令
            </label>
            <textarea
              v-model="refinePrompt"
              rows="3"
              class="w-full px-3 py-2 border border-grayscale-300 rounded-6px focus:outline-none focus:ring-2 focus:ring-secondary-200 text-14px"
              placeholder="請輸入希望 OpenAI 如何整理內容的指令..."
            ></textarea>
            <p class="text-12px text-grayscale-500 mt-1">
              啟用後，Perplexity 回應將透過 OpenAI 進行進一步整理和優化
            </p>
          </div>
        </div>

        <!-- 搜尋輸入 -->
        <div class="flex flex-col md:flex-row gap-4">
          <div class="w-full">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="請輸入您的搜尋查詢..."
              class="w-full px-4 py-3 border border-grayscale-300 rounded-8px focus:outline-none focus:ring-2 focus:ring-secondary-200 text-16px"
              :disabled="isLoading"
              @keypress="handleKeyPress"
            />
          </div>
          <div class="flex gap-2">
            <button
              :disabled="isLoading || !searchQuery.trim()"
              class="button-primary-md flex items-center gap-2 whitespace-nowrap"
              :class="{
                'opacity-50 cursor-not-allowed':
                  isLoading || !searchQuery.trim(),
              }"
              @click="performSearch"
            >
              <span v-if="isLoading" class="animate-spin">⏳</span>
              {{ isLoading ? "搜尋中..." : "搜尋" }}
            </button>
            <button
              v-if="searchResult"
              class="button-secondary-md"
              @click="clearResults"
            >
              清除
            </button>
          </div>
        </div>

        <!-- 錯誤訊息 -->
        <div
          v-if="error"
          class="mt-4 p-4 bg-red-50 border border-red-200 rounded-8px"
        >
          <p class="text-red-600 text-14px">{{ error }}</p>
        </div>
      </div>

      <!-- 載入狀態 -->
      <div
        v-if="isLoading"
        class="bg-white rounded-12px shadow-md p-8 text-center"
      >
        <div class="animate-pulse">
          <div class="h-4 bg-grayscale-200 rounded mb-4"></div>
          <div class="h-4 bg-grayscale-200 rounded mb-4 w-3/4 mx-auto"></div>
          <div class="h-4 bg-grayscale-200 rounded w-1/2 mx-auto"></div>
        </div>
        <p class="text-grayscale-500 mt-4">正在使用 AI 搜尋相關資訊...</p>
      </div>

      <!-- 搜尋結果 -->
      <div
        v-if="searchResult && !isLoading"
        class="bg-white rounded-12px shadow-md p-6"
      >
        <!-- 結果標題 -->
        <div class="border-b border-grayscale-200 pb-4 mb-6">
          <h2 class="text-20px font-bold text-grayscale-600 mb-2">搜尋結果</h2>
          <div class="flex flex-wrap gap-4 text-14px text-grayscale-500">
            <span>模型: {{ searchResult.model }}</span>
            <span>用量: {{ searchResult.usage?.total_tokens }} tokens</span>
            <span v-if="searchResult.usage?.num_search_queries">
              搜尋次數: {{ searchResult.usage.num_search_queries }}
            </span>
          </div>
        </div>

        <!-- AI 回應內容 -->
        <div class="mb-6">
          <!-- OpenAI 整理後的內容 -->
          <div v-if="searchResult.is_refined" class="mb-6">
            <h3 class="text-18px font-semibold text-grayscale-600 mb-3 flex items-center">
              <span class="mr-2">✨ OpenAI 整理後內容</span>
              <span class="text-12px bg-secondary-100 text-secondary-600 px-2 py-1 rounded-full">
                已優化
              </span>
            </h3>
            <div class="prose max-w-none mb-4">
              <div
                class="text-16px leading-28px text-grayscale-600 whitespace-pre-wrap p-4 bg-gradient-to-r from-secondary-50 to-blue-50 rounded-8px border border-secondary-100"
                v-html="
                  searchResult.refined_content?.replace(/\n/g, '<br>') || ''
                "
              ></div>
            </div>
            <div class="text-12px text-grayscale-500 mb-4">
              OpenAI 處理用量: {{ searchResult.openai_tokens_used }} tokens
            </div>
            
            <!-- 原始內容折疊顯示 -->
            <details class="mb-4">
              <summary class="cursor-pointer text-14px text-grayscale-500 hover:text-grayscale-600 mb-2">
                查看原始 Perplexity 回應
              </summary>
              <div class="p-4 bg-grayscale-50 rounded-8px border">
                <div
                  class="text-14px leading-24px text-grayscale-600 whitespace-pre-wrap"
                  v-html="
                    searchResult.choices?.[0]?.message?.content?.replace(
                      /\n/g,
                      '<br>'
                    ) || ''
                  "
                ></div>
              </div>
            </details>
          </div>

          <!-- 一般 AI 回應 -->
          <div v-else>
            <h3 class="text-18px font-semibold text-grayscale-600 mb-3">
              AI 回應
            </h3>
            <div class="prose max-w-none">
              <div
                class="text-16px leading-28px text-grayscale-600 whitespace-pre-wrap"
                v-html="
                  searchResult.choices?.[0]?.message?.content?.replace(
                    /\n/g,
                    '<br>'
                  ) || ''
                "
              ></div>
            </div>
          </div>

          <!-- 整理錯誤提示 -->
          <div v-if="searchResult.refine_error" class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-8px">
            <p class="text-yellow-700 text-14px">
              ⚠️ {{ searchResult.refine_error }}
            </p>
          </div>
        </div>

        <!-- 引用來源 -->
        <div
          v-if="searchResult.citations && searchResult.citations.length > 0"
          class="mb-6"
        >
          <h3 class="text-18px font-semibold text-grayscale-600 mb-3">
            引用來源
          </h3>
          <div class="grid gap-3">
            <div
              v-for="(citation, index) in searchResult.citations"
              :key="index"
              class="p-3 bg-grayscale-100 rounded-8px"
            >
              <a
                :href="citation"
                target="_blank"
                rel="noopener noreferrer"
                class="text-secondary-200 hover:text-secondary-100 text-14px break-all"
              >
                {{ citation }}
              </a>
            </div>
          </div>
        </div>

        <!-- 搜尋結果詳情 -->
        <div
          v-if="
            searchResult.search_results &&
            searchResult.search_results.length > 0
          "
          class="mb-6"
        >
          <h3 class="text-18px font-semibold text-grayscale-600 mb-3">
            相關搜尋結果
          </h3>
          <div class="grid gap-4">
            <div
              v-for="(result, index) in searchResult.search_results"
              :key="index"
              class="p-4 border border-grayscale-200 rounded-8px hover:shadow-sm transition-shadow"
            >
              <h4 class="font-medium text-grayscale-600 mb-2">
                {{ result.title }}
              </h4>
              <a
                :href="result.url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-secondary-200 hover:text-secondary-100 text-14px break-all mb-1 block"
              >
                {{ result.url }}
              </a>
              <p v-if="result.date" class="text-12px text-grayscale-400">
                {{ result.date }}
              </p>
            </div>
          </div>
        </div>

        <!-- 詳細資訊 -->
        <div class="border-t border-grayscale-200 pt-4">
          <details class="text-14px">
            <summary
              class="cursor-pointer text-grayscale-500 hover:text-grayscale-600"
            >
              詳細資訊
            </summary>
            <div class="mt-3 p-3 bg-grayscale-50 rounded-6px">
              <pre
                class="text-12px text-grayscale-600 whitespace-pre-wrap overflow-auto"
                >{{ JSON.stringify(searchResult, null, 2) }}</pre
              >
            </div>
          </details>
        </div>
      </div>

      <!-- 返回鏈接 -->
      <div class="text-center mt-8">
        <NuxtLink
          to="/"
          class="text-secondary-200 hover:text-secondary-100 text-16px"
        >
          ← 返回首頁
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.prose {
  color: inherit;
}

.prose h1,
.prose h2,
.prose h3 {
  color: inherit;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

.prose p {
  margin-bottom: 1em;
}

.prose ul,
.prose ol {
  margin-bottom: 1em;
  padding-left: 1.5em;
}
</style>

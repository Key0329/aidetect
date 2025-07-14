<script setup>
import { ref } from "vue";

const showAIDetectDrawer = ref(false);
const isLoading = ref(false);
const isInterviewQuestionsExpanded = ref(false);
const highlightedElement = ref(null);
const isCopied = ref(false);

// 新增 tab 切換控制變數
const activeTab = ref("condition"); // 可選值: 'condition', 'description', 'ai', 'fact-check'

// 新增狀態管理變數
const showQuestionGuide = ref(false);
const showQuestionPrompt = ref(true); // 新增控制問題提示區域顯示的變數
const needQuestions = ref(false);
const isQuestionsLoading = ref(false);
const showDenyTip = ref(false);
const questionsRef = ref(null); // 添加對問題區域的引用

// 新增反饋狀態追蹤
const feedbacks = ref({
  item1: {
    liked: false,
    disliked: false,
  },
  item2: {
    liked: false,
    disliked: false,
  },
  item3: {
    liked: false,
    disliked: false,
  },
  item4: {
    liked: false,
    disliked: false,
  },
  item5: {
    liked: false,
    disliked: false,
  },
});

// 事實查核狀態追蹤
const factCheckFeedbacks = ref({
  education: {
    liked: false,
    disliked: false,
    verified: false,
  },
  experience: {
    liked: false,
    disliked: false,
    verified: false,
  },
  skills: {
    liked: false,
    disliked: false,
    verified: false,
  },
  achievements: {
    liked: false,
    disliked: false,
    verified: false,
  },
});

// 新的事實查核系統狀態
const resumeInput = ref("");
const isFactChecking = ref(false);
const factCheckProgress = ref(0); // 0: 未開始, 1: 解析中, 2: 搜尋中, 3: 分析中, 4: 完成
const factCheckResult = ref(null);
const factCheckError = ref("");

// // 追蹤已點擊過的項目
// const clickedItems = ref({
//   item1: false,
//   item2: false,
//   item3: false,
//   item4: false,
//   item5: false,
// })

// 處理用戶反饋
const handleFeedback = (itemId, type) => {
  // 如果用戶點擊已選中的按鈕，則取消選中
  if (type === "like" && feedbacks.value[itemId].liked) {
    feedbacks.value[itemId].liked = false;
  } else if (type === "dislike" && feedbacks.value[itemId].disliked) {
    feedbacks.value[itemId].disliked = false;
  } else {
    // 否則，選中新按鈕並取消另一個按鈕的選中狀態
    feedbacks.value[itemId].liked = type === "like";
    feedbacks.value[itemId].disliked = type === "dislike";
  }
};

// 處理事實查核反饋
const handleFactCheckFeedback = (itemId, type) => {
  if (type === "like" && factCheckFeedbacks.value[itemId].liked) {
    factCheckFeedbacks.value[itemId].liked = false;
  } else if (type === "dislike" && factCheckFeedbacks.value[itemId].disliked) {
    factCheckFeedbacks.value[itemId].disliked = false;
  } else if (type === "verify" && factCheckFeedbacks.value[itemId].verified) {
    factCheckFeedbacks.value[itemId].verified = false;
  } else {
    if (type === "like" || type === "dislike") {
      factCheckFeedbacks.value[itemId].liked = type === "like";
      factCheckFeedbacks.value[itemId].disliked = type === "dislike";
    } else if (type === "verify") {
      factCheckFeedbacks.value[itemId].verified = true;
    }
  }
};

const openAIDetectDrawer = () => {
  showAIDetectDrawer.value = true;
  isLoading.value = true;

  // 模擬AI檢測過程，3秒後顯示結果
  setTimeout(() => {
    isLoading.value = false;
  }, 2000);
};

const closeAIDetectDrawer = () => {
  showAIDetectDrawer.value = false;
  // 清除高亮效果
  if (highlightedElement.value) {
    highlightedElement.value.classList.remove("highlight-content");
    highlightedElement.value = null;
  }
};

// 控制面試問題展開/折疊
const toggleInterviewQuestions = () => {
  isInterviewQuestionsExpanded.value = !isInterviewQuestionsExpanded.value;
};

// 複製文字到剪貼簿
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  });
};

// 事實查核項目標記為已驗證
const markAsVerified = (itemId) => {
  factCheckFeedbacks.value[itemId].verified = !factCheckFeedbacks.value[itemId].verified;
};

// 開始事實查核流程
const startFactCheck = async () => {
  if (!resumeInput.value.trim()) {
    factCheckError.value = "請輸入履歷內容";
    return;
  }

  isFactChecking.value = true;
  factCheckProgress.value = 1;
  factCheckError.value = "";
  factCheckResult.value = null;

  try {
    const response = await $fetch("/api/resume/fact-check", {
      method: "POST",
      body: {
        resumeText: resumeInput.value,
      },
    });

    factCheckResult.value = response;
    factCheckProgress.value = 4;
  } catch (err) {
    factCheckError.value = err?.data?.message || err?.message || "事實查核時發生錯誤";
    console.error("Fact check error:", err);
    factCheckProgress.value = 0;
  } finally {
    isFactChecking.value = false;
  }
};

// 重置事實查核
const resetFactCheck = () => {
  resumeInput.value = "";
  factCheckProgress.value = 0;
  factCheckResult.value = null;
  factCheckError.value = "";
  isFactChecking.value = false;
};

// 獲取置信度顏色
const getConfidenceColor = (confidence) => {
  if (confidence >= 0.9) return "#2e7d32"; // 綠色 - 非常確信
  if (confidence >= 0.7) return "#388e3c"; // 淺綠 - 較為確信
  if (confidence >= 0.5) return "#f57f17"; // 黃色 - 不確定
  return "#d32f2f"; // 紅色 - 可能不匹配
};

// 獲取置信度文字
const getConfidenceText = (confidence) => {
  if (confidence >= 0.9) return "非常確信";
  if (confidence >= 0.7) return "較為確信";
  if (confidence >= 0.5) return "不確定";
  return "可能不匹配";
};

// 增強型定位功能：滾動到指定段落並高亮顯示
const scrollToSection = (sectionId, targetText) => {
  // 清除之前的高亮效果
  if (highlightedElement.value) {
    highlightedElement.value.classList.remove("highlight-content");
  }

  const section = document.getElementById(sectionId);
  if (section) {
    // 如果有提供目標文字，直接尋找並高亮包含該文字的元素
    if (targetText) {
      // 尋找包含特定文本的段落元素
      const paragraphs = section.querySelectorAll("p");
      for (const p of paragraphs) {
        if (p.textContent.includes(targetText)) {
          // 添加高亮效果
          p.classList.add("highlight-content");
          highlightedElement.value = p;

          // 直接滾動到高亮元素，不先滾動到段落頂部
          p.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          return; // 找到目標後直接返回
        }
      }
    }

    // 如果沒有找到匹配文本或沒有提供目標文字，則滾動到段落頂部
    section.scrollIntoView({ behavior: "smooth" });
  }
};

// 新增重置問題區塊的函數
const resetQuestionSection = () => {
  needQuestions.value = false;
  showQuestionGuide.value = false;
  showQuestionPrompt.value = true;
  isInterviewQuestionsExpanded.value = false;
  showDenyTip.value = false;
};

// 新增處理問題請求的函數
const handleQuestionsRequest = (need) => {
  if (need) {
    needQuestions.value = true;
    isQuestionsLoading.value = true;

    // 確保UI更新，顯示loading動畫
    setTimeout(() => {
      // 模擬載入時間
      setTimeout(() => {
        isQuestionsLoading.value = false;
        showQuestionGuide.value = true;
        isInterviewQuestionsExpanded.value = true;
        showQuestionPrompt.value = false; // 隱藏問題提示區域

        // 等待DOM更新後滾動到問題區塊
        setTimeout(() => {
          if (questionsRef.value) {
            questionsRef.value.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 100);
      }, 2000);
    }, 0);
  } else {
    needQuestions.value = false;
    showDenyTip.value = true;

    // 滾動到提示訊息位置
    setTimeout(() => {
      const questionSection = document.getElementById("question-section");
      if (questionSection) {
        questionSection.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  }
};

// 問問求職者功能 - 跳轉到外部頁面
// const redirectToChat = () => {
//   window.open(
//     'https://vip.104-dev.com.tw/message/msgMaster/8347546/259944',
//     '_blank'
//   )
// }

// 下載提問建議功能
const downloadQuestions = () => {
  // 問題範本文本
  const content = `李先生您好，感謝您應徵我們的職位！

我們對您的履歷很有興趣，希望您能先協助回覆以下幾個問題，幫助我們更了解您的專業背景：

1. 您在履歷中提到在ABC科技時提升系統可擴展性30%，能否簡要說明當時的系統架構以及您採取了哪些具體措施來實現這個改善？

2. 您列出精通多種技術如Python、JavaScript和Java等，能否分享一個您最熟悉的技術棧，以及一個您使用這些技術解決的最具挑戰性問題？

3. 關於數位轉型平台專案，您提到降低了40%的運營成本，這個數據是如何計算的？過程中遇到了哪些主要困難，您是如何解決的？

感謝您的配合！您的回覆將幫助我們更好地準備面試內容。期待您的回音，也期待不久後與您見面交流。`;

  // 創建Blob對象
  const blob = new Blob([content], { type: "text/plain" });

  // 創建URL
  const url = URL.createObjectURL(blob);

  // 創建臨時連結並模擬點擊下載
  const link = document.createElement("a");
  link.href = url;
  link.download = "面試前問題範本.txt";
  document.body.appendChild(link);
  link.click();

  // 清理
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="resume bg-#f3f3f3 flex flex-col min-h-screen">
    <header>
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
          <div class="text-24px font-bold">104 招募管理</div>
        </div>
        <div class="py-5px px-8px flex items-center">
          <div class="font-bold mr-1">企業HR</div>
          <img
            src="@/assets/images/ai/icon_arrow_right.svg"
            alt="arrow"
            class="rotate-90"
          />
        </div>
      </div>
    </header>
    <nav class="flex items-center px-44px h-40px bg-white">
      <ul class="flex items-center list-none p-0 m-0">
        <li>
          <a
            href="#"
            class="py-10px px-16px text-18px leading-27px text-#292929 font-normal"
            >首頁</a
          >
        </li>
        <li>
          <a
            href="#"
            class="py-10px px-16px text-18px leading-27px text-#292929 font-normal"
            >公司</a
          >
        </li>
        <li>
          <a
            href="#"
            class="py-10px px-16px text-18px leading-27px text-#292929 font-normal"
            >職務</a
          >
        </li>
        <li>
          <a
            href="#"
            class="py-10px px-16px text-18px leading-27px text-#292929 font-normal"
            >查詢</a
          >
        </li>
        <li>
          <a
            href="#"
            class="pt-10px py-7px px-16px text-18px leading-27px font-700 text-#00AFB8 border-b-solid border-b-#00AFB8 border-b-3"
            >履歷</a
          >
        </li>
        <li>
          <a
            href="#"
            class="py-10px px-16px text-18px leading-27px text-#292929 font-normal"
            >聯絡</a
          >
        </li>
        <li>
          <a
            href="#"
            class="py-10px px-16px text-18px leading-27px text-#292929 font-normal"
            >數據</a
          >
        </li>
        <li>
          <a
            href="#"
            class="py-10px px-16px text-18px leading-27px text-#292929 font-normal"
            >購買</a
          >
        </li>
        <li>
          <a
            href="#"
            class="py-10px px-16px text-18px leading-27px text-#292929 font-normal"
            >設定</a
          >
        </li>
        <li>
          <a
            href="#"
            class="py-10px px-16px text-18px leading-27px text-#292929 font-normal"
            >更多</a
          >
        </li>
      </ul>
    </nav>
    <main class="bg-#f3f3f3 py-10 px-6 max-w-1320px mx-auto">
      <div class="pt-5 px-3 pb-20">
        <h2 class="m-0 text-start font-400 h-12 border-b-dashed border-b-#ddd">
          <span>軟體工程師</span>
          <span class="ml-5">應徵履歷</span>
        </h2>
        <div class="py-4 flex justify-between gap-12">
          <div class="w-full">
            <div class="py-6px px-4 flex justify-between bg-#eee">
              <div>應徵日期：2025/05/15 13:20</div>
              <div>代碼：37889955665566</div>
            </div>
            <!-- 履歷區塊 -->
            <section>
              <div
                class="banner bg-[url(https://cdn.104-dev.com.tw/static/images/cprofile/themeDefault/info-default-1.svg)] bg-no-repeat bg-center bg-cover h-270px w-full"
              ></div>
              <div class="relative bg-white pb-4 relative px-6">
                <!-- avatar -->
                <div
                  class="flex justify-center items-center w-32 h-32 rounded-full bg-white absolute -top-8 -translate-y-8"
                >
                  <img
                    src="@/assets/images/ai/avatar.svg"
                    alt=""
                    class="w-30 h-30 object-cover bg-gray-300 rounded-full"
                  />
                </div>
                <!-- name -->
                <div
                  class="absolute -top-10 left-43 text-24px font-bold text-#292929 flex items-center"
                >
                  <div>李冠宇</div>
                  <div
                    class="text-14px leading-20px font-400 text-white ml-3 bg-#292929 opacity-70 px-2 rounded-full"
                  >
                    軟體工程師
                  </div>
                </div>
                <!-- 履歷資訊 -->
                <div class="pt-4 ml-38 text-start pb-15">
                  <p class="leading-28px font-700 mb-1 mt-0">
                    國立清華大學 | 資訊工程學系 碩士
                  </p>
                  <p class="leading-28px font-700 mb-1 mt-0">
                    國立中興大學 | 資訊管理學系 學士
                  </p>
                  <p
                    class="leading-20px text-14px font-700 text-#7e7e7e mb-4 mt-0"
                  >
                    台中市10~11年工作經驗希望職稱：資深軟體工程師
                  </p>
                  <div class="mb-4">
                    <button
                      class="w-32 py-2 bg-#eee border-solid border-1 border-#a9a9a9 font-400 rounded-4px mr-6"
                    >
                      邀約
                    </button>
                    <button
                      class="w-32 py-2 bg-#eee border-solid border-1 border-#a9a9a9 font-400 rounded-4px mr-6"
                    >
                      聊聊
                    </button>
                    <button
                      class="w-32 py-2 bg-#eee border-solid border-1 border-#a9a9a9 font-400 rounded-4px"
                    >
                      聯繫方式
                    </button>
                  </div>
                  <p class="leading-28px text-#7e7e7e">
                    資深軟體工程師、全端開發工程師
                  </p>
                </div>
                <div class="py-6 border-t-solid border-t-#eee">
                  <div class="flex items-center gap-6 mb-2">
                    <p class="m-0 leading-28px font-700 text-start">基本資料</p>
                    <p class="m-0 leading-28px">男、34歲</p>
                  </div>
                  <div class="flex items-center gap-6 mb-2">
                    <p class="m-0 leading-28px font-700 text-start">就業狀態</p>
                    <p class="m-0 leading-28px">積極尋求新事業挑戰</p>
                  </div>
                  <div class="flex items-center gap-6 mb-2">
                    <p class="m-0 leading-28px font-700 text-start">居住地區</p>
                    <p class="m-0 leading-28px">台中市西區公益路***</p>
                  </div>
                  <div class="flex items-center gap-6 mb-2">
                    <p class="m-0 leading-28px font-700 text-start">持有駕照</p>
                    <p class="m-0 leading-28px">普通小型車及重型機車駕照</p>
                  </div>
                  <div class="flex items-center gap-6 mb-2">
                    <p class="m-0 leading-28px font-700 text-start">自備車輛</p>
                    <p class="m-0 leading-28px">自備汽車</p>
                  </div>
                  <div class="flex items-center gap-6 mb-2">
                    <p class="m-0 leading-28px font-700 text-start">特殊身分</p>
                    <p class="m-0 leading-28px">無</p>
                  </div>
                </div>
                <div class="py-6 border-t-solid border-t-#eee">
                  <h2
                    class="m-0 leading-24px text-18px font-700 text-start mb-3"
                  >
                    應徵資訊
                  </h2>
                  <div class="flex items-center gap-6 mb-2">
                    <p class="m-0 leading-28px font-700 text-start">應徵職務</p>
                    <p class="m-0 leading-28px">資深軟體工程師</p>
                  </div>
                  <div class="flex items-center gap-6 mb-2">
                    <p class="m-0 leading-28px font-700 text-start">自我推薦</p>
                    <p class="m-0 leading-28px">
                      您好，我叫李冠宇，近日得知貴公司在徵人，希望能有參加面試的機會，謝謝！
                    </p>
                  </div>
                </div>
              </div>
              <!-- 教育背景 -->
              <div id="education-section" class="bg-white mt-4">
                <div class="px-6 py-3 border-b-solid border-b-#eeeeee">
                  <p class="text-18px font-700 leading-24px m-0 text-start">
                    教育背景
                  </p>
                </div>
                <div class="py-3">
                  <div class="flex items-start justify-between px-6 py-3">
                    <div>
                      <p class="m-0 leading-28px font-700 text-start">
                        國立清華大學
                      </p>
                      <p class="m-0 text-14px leading-24px text-start">
                        資訊工程學系｜碩士畢業
                      </p>
                    </div>
                    <p class="m-0 text-14px leading-20px font-400 text-#7e7e7e">
                      2012/09~2014/06
                    </p>
                  </div>
                  <div class="flex items-start justify-between px-6 py-3">
                    <div>
                      <p class="m-0 leading-28px font-700 text-start">
                        國立中興大學
                      </p>
                      <p class="m-0 text-14px leading-24px text-start">
                        資訊管理學系｜學士畢業
                      </p>
                    </div>
                    <p class="m-0 text-14px leading-20px font-400 text-#7e7e7e">
                      2008/09~2012/06
                    </p>
                  </div>
                </div>
              </div>
              <!-- 專業技能 -->
              <div id="skills-section" class="bg-white mt-4">
                <div class="px-6 py-3 border-b-solid border-b-#eeeeee">
                  <p class="text-18px font-700 leading-24px m-0 text-start">
                    專業技能
                  </p>
                </div>
                <div class="p-6">
                  <div class="mb-4">
                    <p class="m-0 leading-28px font-700 text-start mb-2">
                      高級程式設計
                    </p>
                    <p class="m-0 leading-28px text-start">
                      精通
                      Python、JavaScript、Java，具備跨平台全端開發能力，驅動高效能系統建構。
                    </p>
                  </div>
                  <div class="mb-4">
                    <p class="m-0 leading-28px font-700 text-start mb-2">
                      前端與後端框架
                    </p>
                    <p class="m-0 leading-28px text-start">
                      熟練運用
                      React、Node.js、Django，打造無縫用戶體驗與穩健後端架構。
                    </p>
                  </div>
                  <div class="mb-4">
                    <p class="m-0 leading-28px font-700 text-start mb-2">
                      雲端與 DevOps
                    </p>
                    <p class="m-0 leading-28px text-start">
                      掌握 AWS、Docker、Kubernetes，實現自動化部署與雲端優化。
                    </p>
                  </div>
                  <div class="mb-4">
                    <p class="m-0 leading-28px font-700 text-start mb-2">
                      資料庫管理
                    </p>
                    <p class="m-0 leading-28px text-start">
                      深入操作
                      MySQL、MongoDB，具備大規模資料處理與效能調校經驗。
                    </p>
                  </div>
                  <div>
                    <p class="m-0 leading-28px font-700 text-start mb-2">
                      領導與協作
                    </p>
                    <p class="m-0 leading-28px text-start">
                      卓越的跨部門溝通與專案管理能力，擅長引領團隊實現業務目標。
                    </p>
                  </div>
                </div>
              </div>
              <!-- 工作經驗 -->
              <div id="experience-section" class="bg-white mt-4">
                <div class="px-6 py-3 border-b-solid border-b-#eeeeee">
                  <p class="text-18px font-700 leading-24px m-0 text-start">
                    工作經驗
                  </p>
                </div>
                <div class="py-3">
                  <div class="py-3 px-6 flex gap-6">
                    <p
                      class="m-0 leading-24px text-18px font-700 text-start whitespace-nowrap"
                    >
                      總年資
                    </p>
                    <div>
                      <p class="m-0 leading-24px text-18px font-700 text-start">
                        10~11年工作經驗
                      </p>
                      <p class="m-0 leading-24px text-18px font-700 text-start">
                        資深軟體工程師 (6~7年)、軟體工程師 (3~4年)、實習生
                        (1年(含)以下)
                      </p>
                    </div>
                  </div>
                  <!-- 一個工作經驗 -->
                  <div class="flex py-5 px-6">
                    <div
                      class="bg-#1654B9 text-white rounded-8px box-border w-14 h-14 text-24px font-700 leading-14 text-center overflow-hidden mr-12 flex-shrink-0"
                    >
                      A
                    </div>
                    <div class="border-b-solid border-b-#eeeeee">
                      <div class="flex justify-between gap-6 w-full">
                        <div>
                          <p
                            class="text-start m-0 text-18px leading-24px font-700"
                          >
                            資深軟體工程師
                          </p>
                          <p
                            class="text-start m-0 text-16px leading-28px font-700"
                          >
                            ABC科技股份有限公司（科技業）
                          </p>
                          <p
                            class="text-start m-0 text-14px leading-20px font-400"
                          >
                            資深軟體工程師月薪約 120,000 元
                          </p>
                        </div>
                        <p class="m-0 text-14px leading-20px text-#7e7e7e">
                          2018/01~2024/06
                        </p>
                      </div>
                      <div class="pt-3 pb-6">
                        <p
                          class="m-0 text-start leading-28px font-400 text-#212529"
                        >
                          1. 系統架構設計：主導企業級應用程式架構，運用微服務與
                          AWS 雲端技術，提升系統可擴展性 30%。
                        </p>
                        <p
                          class="m-0 text-start leading-28px font-400 text-#212529"
                        >
                          2. 專案領導：帶領 10
                          人開發團隊，負責需求分析、功能規劃與敏捷開發，確保專案如期交付。
                        </p>
                        <p
                          class="m-0 text-start leading-28px font-400 text-#212529"
                        >
                          3. 效能優化：重構後端程式碼，縮短 API 響應時間
                          25%，顯著提升用戶滿意度。
                        </p>
                        <p
                          class="m-0 text-start leading-28px font-400 text-#212529"
                        >
                          重要專案
                        </p>
                        <p
                          class="m-0 text-start leading-28px font-400 text-#212529"
                        >
                          【數位轉型平台】成效：成功將傳統系統遷移至雲端，降低
                          40% 運營成本，業績增長 15%。
                        </p>
                      </div>
                    </div>
                  </div>
                  <!-- 一個工作經驗 -->
                  <div class="flex py-5 px-6">
                    <div
                      class="bg-#6FB823 text-white rounded-8px box-border w-14 h-14 text-24px font-700 leading-14 text-center overflow-hidden mr-12 flex-shrink-0"
                    >
                      X
                    </div>
                    <div class="border-b-solid border-b-#eeeeee w-full">
                      <div class="flex justify-between gap-6 w-full">
                        <div>
                          <p
                            class="text-start m-0 text-18px leading-24px font-700"
                          >
                            軟體工程師
                          </p>
                          <p
                            class="text-start m-0 text-16px leading-28px font-700"
                          >
                            XYZ資訊有限公司（科技業）
                          </p>
                          <p
                            class="text-start m-0 text-14px leading-20px font-400"
                          >
                            軟體工程師月薪約 80,000 元
                          </p>
                        </div>
                        <p
                          class="flex flex-col m-0 text-14px leading-20px text-#7e7e7e"
                        >
                          <span class="text-end">2014/07~2017/12</span>
                          <span class="text-end">3年5個月</span>
                        </p>
                      </div>
                      <div class="pt-3 pb-6">
                        <p
                          class="m-0 text-start leading-28px font-400 text-#212529"
                        >
                          1. 全端開發：開發並維護企業內部管理系統，使用 React 與
                          Node.js 實現動態前端與高效後端。
                        </p>
                        <p
                          class="m-0 text-start leading-28px font-400 text-#212529"
                        >
                          2. 流程自動化：導入 CI/CD 流程，縮短部署週期
                          50%，提升團隊開發效率。
                        </p>
                        <p
                          class="m-0 text-start leading-28px font-400 text-#212529"
                        >
                          3.
                          跨部門協作：與產品經理及設計團隊合作，確保產品功能符合市場需求。
                        </p>
                        <p
                          class="m-0 text-start leading-28px font-400 text-#212529"
                        >
                          重要專案
                        </p>
                        <p
                          class="m-0 text-start leading-28px font-400 text-#212529"
                        >
                          【企業資源管理系統】成效：系統上線後，內部作業效率提升
                          35%，客戶滿意度提高至 90%。
                        </p>
                      </div>
                    </div>
                  </div>
                  <!-- 一個工作經驗 -->
                  <div class="flex py-5 px-6">
                    <div
                      class="bg-#00AFB8 text-white rounded-8px box-border w-14 h-14 text-24px font-700 leading-14 text-center overflow-hidden mr-12 flex-shrink-0"
                    >
                      D
                    </div>
                    <div class="w-full">
                      <div class="flex justify-between gap-6 w-full">
                        <div>
                          <p
                            class="text-start m-0 text-18px leading-24px font-700"
                          >
                            軟體開發實習生
                          </p>
                          <p
                            class="text-start m-0 text-16px leading-28px font-700"
                          >
                            DEF科技公司（科技業）
                          </p>
                          <p
                            class="text-start m-0 text-14px leading-20px font-400"
                          >
                            軟體開發實習生月薪約 30,000 元
                          </p>
                        </div>
                        <p
                          class="flex flex-col m-0 text-14px leading-20px text-#7e7e7e"
                        >
                          <span class="text-end">2013/07~2013/08</span>
                          <span class="text-end">2個月</span>
                        </p>
                      </div>
                      <div class="pt-3 pb-6">
                        <p
                          class="m-0 text-start leading-28px font-400 text-#212529"
                        >
                          1. 原型開發：協助開發公司產品原型，使用 Python 與
                          Django 框架實現初步功能。
                        </p>
                        <p
                          class="m-0 text-start leading-28px font-400 text-#212529"
                        >
                          2.
                          測試與除錯：執行單元測試，提交錯誤報告，確保產品穩定性。
                        </p>
                        <p
                          class="m-0 text-start leading-28px font-400 text-#212529"
                        >
                          3.
                          技術研究：探索新興前端技術，為團隊提供技術可行性報告。
                        </p>
                        <p
                          class="m-0 text-start leading-28px font-400 text-#212529"
                        >
                          重要專案
                        </p>
                        <p
                          class="m-0 text-start leading-28px font-400 text-#212529"
                        >
                          【產品原型展示】成果：原型獲得客戶高度評價，促成後續
                          500 萬資金投資。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 求職條件 -->
              <div id="job-requirements-section" class="bg-white mt-4">
                <div class="px-6 py-3 border-b-solid border-b-#eeeeee">
                  <p class="text-18px font-700 leading-24px m-0 text-start">
                    求職條件
                  </p>
                </div>
                <div class="p-6">
                  <div class="pb-6">
                    <div class="flex items-center gap-6 mb-2">
                      <p class="m-0 leading-28px font-700 text-start">
                        工作性質
                      </p>
                      <p class="m-0 leading-28px">全職，追求長期穩定發展</p>
                    </div>
                    <div class="flex items-center gap-6 mb-2">
                      <p class="m-0 leading-28px font-700 text-start">
                        上班時段
                      </p>
                      <p class="m-0 leading-28px">
                        日班、可配合輪班，具高度靈活性
                      </p>
                    </div>
                    <div class="flex items-center gap-6 mb-2">
                      <p class="m-0 leading-28px font-700 text-start">
                        可上班日
                      </p>
                      <p class="m-0 leading-28px">
                        錄取後隨時可上班，立即投入工作
                      </p>
                    </div>
                    <div class="flex items-center gap-6 mb-2">
                      <p class="m-0 leading-28px font-700 text-start">
                        希望待遇
                      </p>
                      <p class="m-0 leading-28px">期望月薪 130,000 元起</p>
                    </div>
                    <div class="flex items-center gap-6 mb-2">
                      <p class="m-0 leading-28px font-700 text-start">
                        希望地點
                      </p>
                      <p class="m-0 leading-28px">
                        台中市、台北市、其他科技中心城市
                      </p>
                    </div>
                    <div class="flex items-center gap-6 mb-2">
                      <p class="m-0 leading-28px font-700 text-start">
                        遠端工作
                      </p>
                      <p class="m-0 leading-28px">高度適應遠端與混合工作模式</p>
                    </div>
                  </div>
                  <div class="py-6 border-t-solid border-t-#eee">
                    <div class="flex items-center gap-6 mb-2">
                      <p class="m-0 leading-28px font-700 text-start">
                        希望職稱
                      </p>
                      <p class="m-0 leading-28px">資深軟體工程師</p>
                    </div>
                    <div class="flex items-center gap-6 mb-2">
                      <p class="m-0 leading-28px font-700 text-start">
                        希望職類
                      </p>
                      <p class="m-0 leading-28px">軟體工程師</p>
                    </div>
                    <div class="flex items-center gap-6 mb-2">
                      <p class="m-0 leading-28px font-700 text-start">
                        希望產業
                      </p>
                      <p class="m-0 leading-28px">科技業、電商</p>
                    </div>
                    <div class="flex items-center gap-6 mb-2">
                      <p class="m-0 leading-28px font-700 text-start">
                        希望內容
                      </p>
                      <p class="m-0 leading-28px">
                        系統架構設計、專案管理、技術領導
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 自傳 -->
              <div id="autobiography-section" class="bg-white mt-4">
                <div class="px-6 py-3 border-b-solid border-b-#eeeeee">
                  <p class="text-18px font-700 leading-24px m-0 text-start">
                    自傳
                  </p>
                </div>
                <div class="p-6">
                  <p class="m-0 text-16px leading-28px text-start">
                    本人在資訊科技領域深耕逾十年，畢業於國立中興大學資訊管理學系，並於國立清華大學取得資訊工程碩士學位，奠定堅實的技術基礎。職業生涯始於
                    DEF 科技公司實習，隨後於 XYZ 資訊有限公司及 ABC
                    科技股份有限公司擔任軟體工程師與資深工程師，累積豐富的全端開發、雲端架構與專案管理經驗。我精通多種程式語言與框架，擅長將複雜需求轉化為高效解決方案，曾主導多項關鍵專案，例如
                    ABC 科技的數位轉型平台，成功降低 40%
                    運營成本並提升市場競爭力。
                  </p>
                  <p class="m-0 text-16px leading-28px text-start mt-4">
                    我堅信技術創新與團隊協作是驅動成功的核心，始終以積極的學習態度與卓越的執行力迎接挑戰。未來，我期盼加入貴公司，貢獻我的專業技能與領導經驗，與團隊共同打造具影響力的產品，實現企業願景。
                  </p>
                </div>
              </div>
            </section>
          </div>
          <!-- 側邊欄 -->
          <div class="resume-side w-220px flex flex-col items-center">
            <button
              class="flex justify-center items-center mb-2 px-2 text-16px tracking-32px indent-32px min-w-50 text-white h-38px bg-#00afb8 border-solid border-1 border-#00afb8 rounded-4px font-400"
            >
              邀約
            </button>
            <button
              class="flex justify-center items-center mb-2 px-2 text-16px tracking-8px indent-8px min-w-50 h-38px bg-#eee border-solid border-1 border-#a9a9a9 rounded-4px font-400"
            >
              感謝函
            </button>
            <button
              class="flex justify-center items-center mb-2 px-2 text-16px tracking-32px indent-32px min-w-50 h-38px bg-#eee border-solid border-1 border-#a9a9a9 rounded-4px font-400"
            >
              儲存
            </button>
            <button
              class="flex justify-center items-center px-2 text-16px bg-transparent tracking-32px indent-32px min-w-50 h-38px rounded-4px font-400 text-#00afb8"
            >
              轉寄
            </button>
            <button
              class="flex justify-center items-center px-2 text-16px bg-transparent tracking-32px indent-32px min-w-50 h-38px rounded-4px font-400 text-#00afb8"
            >
              列印
            </button>
            <button
              class="flex justify-center items-center px-2 text-16px bg-transparent tracking-32px indent-32px min-w-50 h-38px rounded-4px font-400 text-#00afb8"
            >
              刪除
            </button>
            <button
              class="flex justify-center items-center px-2 text-16px bg-transparent tracking-32px indent-32px min-w-50 h-38px rounded-4px font-400 text-#00afb8"
            >
              備註
            </button>
            <button
              class="flex justify-center items-center px-2 text-16px bg-transparent tracking-32px indent-32px min-w-50 h-38px rounded-4px font-400 text-#00afb8"
            ></button>
            <button
              class="flex justify-center items-center px-2 text-16px bg-transparent tracking-32px indent-32px min-w-50 h-38px rounded-4px font-400 text-#00afb8"
            >
              失約
            </button>
            <button
              class="flex justify-center items-center px-2 text-16px bg-transparent tracking-32px indent-32px min-w-50 h-38px rounded-4px font-400 text-#00afb8"
            >
              封鎖
            </button>
            <button
              class="flex justify-center items-center mt-6 px-2 text-16px tracking-4px indent-4px min-w-50 text-white h-38px bg-#00afb8 border-solid border-1 border-#00afb8 rounded-4px font-400"
              @click="openAIDetectDrawer"
            >
              AI履歷總覽✨
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- AI檢測 Side Drawer (無遮罩層) -->
    <div
      class="side-drawer fixed top-0 right-0 h-full bg-#40C7CD z-50 w-800px transform transition-transform duration-300 ease-in-out shadow-lg text-start"
      :class="showAIDetectDrawer ? 'translate-x-0' : 'translate-x-full'"
    >
      <div
        class="drawer-header border-b-solid border-b-1px border-b-#292929 px-5 py-3 flex justify-between items-center"
      >
        <h2 class="text-24px font-bold m-0 text-#292929">AI 檢測結果</h2>
        <button
          class="text-32px hover:bg-#f3f3f3 rounded-full w-10 h-10 flex items-center justify-center"
          @click="closeAIDetectDrawer"
        >
          &times;
        </button>
      </div>
      <div class="drawer-body p-6 overflow-y-auto h-[calc(100%-78px)]">
        <!-- Skeleton loading -->
        <div v-if="isLoading" class="skeleton-container">
          <div class="flex items-center mb-8">
            <div class="skeleton-circle"></div>
            <div class="ml-4">
              <div class="skeleton-line w-3/4"></div>
              <div class="skeleton-line w-1/2 mt-3"></div>
            </div>
          </div>

          <div class="skeleton-block mb-8"></div>

          <div class="flex justify-center items-center mb-8">
            <div class="skeleton-progress"></div>
            <div class="skeleton-percentage ml-3"></div>
          </div>

          <div class="skeleton-line w-full"></div>
          <div class="skeleton-line w-full mt-3"></div>
          <div class="skeleton-line w-3/4 mt-3"></div>

          <div class="skeleton-block mt-8"></div>
          <div class="skeleton-block mt-6"></div>

          <div class="flex items-center justify-between mt-8">
            <div class="skeleton-button"></div>
            <div class="skeleton-button"></div>
            <div class="skeleton-button"></div>
          </div>

          <div class="skeleton-pulse text-center mt-6 text-white text-18px">
            正在分析履歷內容...
          </div>
        </div>

        <!-- 實際內容 -->
        <div v-else>
          <!-- AI 工具標題與介紹 -->
          <div class="mb-8">
            <p class="text-20px leading-28px text-#292929 font-bold mb-4">
              此工具透過分析履歷文本特徵，協助產生履歷導覽。
            </p>
            <div class="bg-#FFF8E1 p-5 rounded-6px text-20px text-#856404">
              <p class="m-0 leading-28px">
                分析僅供參考，建議結合面試表現進行綜合評估。
              </p>
            </div>
          </div>
          <!-- 內文 -->
          <div class="bg-white p-6 rounded-6px mb-10">
            <div class="flex mb-6 border-b-solid border-b-1px border-b-#eee">
              <div
                class="py-3 px-6 cursor-pointer text-22px"
                :class="
                  activeTab === 'condition'
                    ? 'text-#00afb8 border-b-solid border-b-3 border-b-#00afb8'
                    : 'text-#555'
                "
                @click="activeTab = 'condition'"
              >
                求職條件比對
              </div>
              <div
                class="py-3 px-6 cursor-pointer text-22px"
                :class="
                  activeTab === 'description'
                    ? 'text-#00afb8 border-b-solid border-b-3 border-b-#00afb8'
                    : 'text-#555'
                "
                @click="activeTab = 'description'"
              >
                學經歷地圖
              </div>
              <div
                class="py-3 px-6 cursor-pointer text-22px"
                :class="
                  activeTab === 'ai'
                    ? 'text-#00afb8 border-b-solid border-b-3 border-b-#00afb8'
                    : 'text-#555'
                "
                @click="activeTab = 'ai'"
              >
                AI 痕跡檢測
              </div>
              <div
                class="py-3 px-6 cursor-pointer text-22px"
                :class="
                  activeTab === 'fact-check'
                    ? 'text-#00afb8 border-b-solid border-b-3 border-b-#00afb8'
                    : 'text-#555'
                "
                @click="activeTab = 'fact-check'"
              >
                事實查核
              </div>
            </div>

            <!-- 職缺條件標籤內容 -->
            <div v-show="activeTab === 'condition'" class="mb-8">
              <div class="w-full mx-auto">
                <img
                  src="@/assets/images/ai/condition.jpg"
                  alt="職涯地圖"
                  class="w-full object-cover"
                />
              </div>
            </div>

            <div v-show="activeTab === 'description'" class="mb-8">
              <div class="w-full mx-auto">
                <img
                  src="@/assets/images/ai/roadmap.jpg"
                  alt="職涯地圖"
                  class="w-full object-cover"
                />
              </div>
            </div>

            <!-- 分類卡片區域 -->
            <div v-show="activeTab === 'ai'">
              <!-- 卡片1：經歷跳躍或邏輯不通 -->
              <div class="bg-#fff8e1 p-6 rounded-6px mb-6">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-24px font-bold m-0">經歷跳躍或邏輯不通</h3>
                  <div class="flex justify-end">
                    <button
                      class="p-3 mr-3 rounded-full hover:bg-#eee transition-colors w-12 h-12"
                      :class="{ 'bg-#e6f7f6': feedbacks.item1.liked }"
                      @click="handleFeedback('item1', 'like')"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="text-#00AFB8"
                      >
                        <path
                          d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
                        ></path>
                      </svg>
                    </button>
                    <button
                      class="p-3 rounded-full hover:bg-#eee transition-colors w-12 h-12"
                      :class="{
                        'bg-#ffeaea': feedbacks.item1.disliked,
                      }"
                      @click="handleFeedback('item1', 'dislike')"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="text-#ff5252"
                      >
                        <path
                          d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="flex items-start mb-1">
                    <div class="w-full">
                      <!-- 結束修改部分 -->
                      <div>
                        <p class="text-20px leading-28px text-#555 mt-0 mb-4">
                          使用過於精確的數字（30%、40%、90%）但缺乏計算方法說明，顯示AI傾向於產生整齊的百分比數據。時間線存在重疊矛盾，工作經驗總和與學歷期間不符，無法自圓其說，這是AI合成履歷常見的邏輯問題。
                        </p>
                      </div>
                      <p class="text-14px text-#292929">履歷內文</p>
                      <!-- 修改的部分：新的連結框 -->
                      <div
                        class="border-1 border-solid border-#ddd rounded-6px p-4 mb-5"
                      >
                        <div
                          class="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity duration-200"
                          @click="
                            scrollToSection(
                              'experience-section',
                              '【數位轉型平台】成效'
                            )
                          "
                        >
                          <span class="text-18px text-#292929 font-bold"
                            >【數位轉型平台】成效：成功將傳統系統遷移至雲端，降低
                            40% 運營成本，業績增長 15%。</span
                          >
                          <span
                            class="flex items-center justify-center ml-3 flex-shrink-0"
                          >
                            <img
                              src="@/assets/images/ai/arrow_circle_right_green.svg"
                              alt=""
                              class="text-#00afb8"
                            />
                          </span>
                        </div>
                      </div>

                      <div class="text-20px leading-28px text-#555 mt-0">
                        建議提問：
                        <div
                          class="p-5 bg-#f4eff9 rounded-8px mt-3 border-l-4 border-l-#00afb8 relative group cursor-pointer hover:bg-#e6daf2 transition-colors shadow-sm"
                          @click="
                            copyToClipboard(
                              '面試提問建議：\n\n闇於數據準確性，您可以請求求職者分享更詳細的計算方法，例如詢問系統可擴展性提升30%的具體指標，以及40%運營成本降低的計算基礎。\n\n關於時間線方面，可以委婉地請求確認在XYZ公司的確切在職時間，以及詢問碩士學位與第一份全職工作時間重疊的情況，了解求職者是如何兼顧的。透過這些對話，您能更全面評估履歷的真實性。'
                            )
                          "
                        >
                          <div
                            class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#00AFB8"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              <rect
                                x="9"
                                y="9"
                                width="13"
                                height="13"
                                rx="2"
                                ry="2"
                              ></rect>
                              <path
                                d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                              ></path>
                            </svg>
                          </div>
                          <div class="font-normal">
                            <p class="m-0">
                              您可以詢問數據背後的計算方法，例如系統可擴展性提升30%的具體指標和運營成本降低40%的計算基礎。同時，委婉地核對時間線問題，如不同公司的在職時間及碩士學位與工作的時間重疊，這些對話有助於評估履歷真實性。
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="border-solid border-b-2 border-#eee my-5"></div>

              <!-- 卡片2：堆砌熱門關鍵字但缺乏上下文 -->
              <div class="bg-#fff8e1 p-6 rounded-6px mb-6">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-24px font-bold m-0">
                    堆砌熱門關鍵字但缺乏上下文
                  </h3>
                  <div class="flex justify-end">
                    <button
                      class="p-3 mr-3 rounded-full hover:bg-#eee transition-colors w-12 h-12"
                      :class="{ 'bg-#e6f7f6': feedbacks.item2.liked }"
                      @click="handleFeedback('item2', 'like')"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="text-#00AFB8"
                      >
                        <path
                          d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
                        ></path>
                      </svg>
                    </button>
                    <button
                      class="p-3 rounded-full hover:bg-#eee transition-colors w-12 h-12"
                      :class="{
                        'bg-#ffeaea': feedbacks.item2.disliked,
                      }"
                      @click="handleFeedback('item2', 'dislike')"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="text-#ff5252"
                      >
                        <path
                          d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="flex items-start mb-1">
                    <div class="w-full">
                      <div>
                        <p class="text-20px leading-24px text-#555 mt-0">
                          羅列多種技術但缺乏實際應用案例，未提供技術掌握程度的具體證明，無法判斷技術深度真實性。
                        </p>
                      </div>
                      <p class="text-14px text-#292929 mt-3">履歷內文</p>
                      <!-- 修改的部分：新的連結框 -->
                      <div
                        class="border-1 border-solid border-#ddd rounded-4px p-3 mb-3"
                      >
                        <div
                          class="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity duration-200 mb-3 pb-2 border-b-1 border-b-solid border-b-#eee"
                          @click="
                            scrollToSection('skills-section', '高級程式設計')
                          "
                        >
                          <span class="text-18px text-#292929 font-bold"
                            >高級程式設計：精通
                            Python、JavaScript、Java，具備跨平台全端開發能力，驅動高效能系統建構。</span
                          >
                          <span
                            class="flex items-center justify-center ml-2 flex-shrink-0"
                          >
                            <img
                              src="@/assets/images/ai/arrow_circle_right_green.svg"
                              alt=""
                              class="text-#00afb8"
                            />
                          </span>
                        </div>

                        <div
                          class="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity duration-200 mb-3 pb-2 border-b-1 border-b-solid border-b-#eee"
                          @click="
                            scrollToSection(
                              'experience-section',
                              '系統架構設計：主導企業級應用程式架構'
                            )
                          "
                        >
                          <span class="text-18px text-#292929 font-bold"
                            >系統架構設計：主導企業級應用程式架構，運用微服務與
                            AWS 雲端技術，提升系統可擴展性 30%。</span
                          >
                          <span
                            class="flex items-center justify-center ml-2 flex-shrink-0"
                          >
                            <img
                              src="@/assets/images/ai/arrow_circle_right_green.svg"
                              alt=""
                              class="text-#00afb8"
                            />
                          </span>
                        </div>

                        <div
                          class="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity duration-200"
                          @click="
                            scrollToSection(
                              'experience-section',
                              '專案領導：帶領 10'
                            )
                          "
                        >
                          <span class="text-18px text-#292929 font-bold"
                            >專案領導：帶領 10
                            人開發團隊，負責需求分析、功能規劃與敏捷開發，確保專案如期交付。</span
                          >
                          <span
                            class="flex items-center justify-center ml-2 flex-shrink-0"
                          >
                            <img
                              src="@/assets/images/ai/arrow_circle_right_green.svg"
                              alt=""
                              class="text-#00afb8"
                            />
                          </span>
                        </div>
                      </div>

                      <div class="text-20px leading-24px text-#555 mt-0">
                        建議提問：
                        <div
                          class="p-4 bg-#f4eff9 rounded-8px mt-2 border-l-4 border-l-#00afb8 relative group cursor-pointer hover:bg-#e6daf2 transition-colors shadow-sm"
                          @click="
                            copyToClipboard(
                              '面試提問建議：\n\n您可以邀請求職者深入分享技術經驗，例如詢問在列出的技術中（Python、JavaScript、Java）最擅長哪一項，以及使用這項技術解決過的具體挑戰。\n\n同時，關於專案經驗，您可以請求分享帶領10人開發團隊的管理方法，以及在微服務架構實踐中遇到的具體挑戰和解決方案。這些對話能幫助您評估求職者技術能力的真實深度。'
                            )
                          "
                        >
                          <div
                            class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#00AFB8"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              <rect
                                x="9"
                                y="9"
                                width="13"
                                height="13"
                                rx="2"
                                ry="2"
                              ></rect>
                              <path
                                d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                              ></path>
                            </svg>
                          </div>
                          <div class="font-normal">
                            <p class="m-0">
                              您可以請求職者分享技術專長的具體應用，例如在列出的技術中最擅長哪一項，以及解決過的實際挑戰。同時詢問團隊管理經驗和微服務架構實踐中遇到的困難，這有助於了解求職者技術深度與解決問題的能力。
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="border-solid border-b-2 border-#eee my-5"></div>

              <!-- 卡片3：敘述抽象、缺乏細節 -->
              <div class="bg-#fff8e1 p-4 rounded-4px mb-4">
                <div class="flex justify-between items-center">
                  <h3 class="text-24px font-bold">敘述抽象、缺乏細節</h3>
                  <div class="flex justify-end">
                    <button
                      class="p-2 mr-2 rounded-full hover:bg-#eee transition-colors w-10 h-10"
                      :class="{ 'bg-#e6f7f6': feedbacks.item3.liked }"
                      @click="handleFeedback('item3', 'like')"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="text-#00AFB8"
                      >
                        <path
                          d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
                        ></path>
                      </svg>
                    </button>
                    <button
                      class="p-2 rounded-full hover:bg-#eee transition-colors w-10 h-10"
                      :class="{
                        'bg-#ffeaea': feedbacks.item3.disliked,
                      }"
                      @click="handleFeedback('item3', 'dislike')"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="text-#ff5252"
                      >
                        <path
                          d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="flex items-start mb-1">
                    <div class="w-full">
                      <div>
                        <p class="text-20px leading-24px text-#555 mt-0">
                          使用抽象通用詞彙描述工作內容，缺少具體何種後端重構方法、如何優化雲端部署、實際解決了什麼技術挑戰等細節。AI傾向於提供籠統描述而非工作中可能遇到的實際問題與具體解決方案。
                        </p>
                      </div>
                      <p class="text-14px text-#292929 mt-3">履歷內文</p>
                      <!-- 修改的部分：新的連結框 -->
                      <div
                        class="border-1 border-solid border-#ddd rounded-4px p-3 mb-3"
                      >
                        <div
                          class="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity duration-200 mb-3 pb-2 border-b-1 border-b-solid border-b-#eee"
                          @click="
                            scrollToSection('skills-section', '雲端與 DevOps')
                          "
                        >
                          <span class="text-18px text-#292929 font-bold"
                            >雲端與 DevOps：掌握
                            AWS、Docker、Kubernetes，實現自動化部署與雲端優化。</span
                          >
                          <span
                            class="flex items-center justify-center ml-2 flex-shrink-0"
                          >
                            <img
                              src="@/assets/images/ai/arrow_circle_right_green.svg"
                              alt=""
                              class="text-#00afb8"
                            />
                          </span>
                        </div>

                        <div
                          class="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity duration-200"
                          @click="
                            scrollToSection(
                              'experience-section',
                              '效能優化：重構後端程式碼'
                            )
                          "
                        >
                          <span class="text-18px text-#292929 font-bold"
                            >效能優化：重構後端程式碼，縮短 API 響應時間
                            25%，顯著提升用戶滿意度。</span
                          >
                          <span
                            class="flex items-center justify-center ml-2 flex-shrink-0"
                          >
                            <img
                              src="@/assets/images/ai/arrow_circle_right_green.svg"
                              alt=""
                              class="text-#00afb8"
                            />
                          </span>
                        </div>
                      </div>

                      <div class="text-20px leading-24px text-#555 mt-0">
                        建議提問：
                        <div
                          class="p-4 bg-#f4eff9 rounded-8px mt-2 border-l-4 border-l-#00afb8 relative group cursor-pointer hover:bg-#e6daf2 transition-colors shadow-sm"
                          @click="
                            copyToClipboard(
                              '面試提問建議：\n\n您可以請求求職者分享關於技術實踐的具體細節，例如詢問一個使用AWS、Docker和Kubernetes的實際項目經驗，以及求職者在其中負責的具體部分。\n\n關於效能優化，可以請求分享如何縮短API響應時間的具體重構方法，以及如何識別性能瓶頸和量化成效。這樣的對話能幫助您更深入了解求職者的實際技術能力和解決問題的方法。'
                            )
                          "
                        >
                          <div
                            class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#00AFB8"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              <rect
                                x="9"
                                y="9"
                                width="13"
                                height="13"
                                rx="2"
                                ry="2"
                              ></rect>
                              <path
                                d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                              ></path>
                            </svg>
                          </div>
                          <div class="font-normal">
                            <p class="m-0">
                              您可以引導求職者分享雲端與DevOps的實際項目細節，包括如何架構自動化部署流程；並請其說明API效能優化的具體重構方法和如何識別性能瓶頸。這類具體技術問題能幫助評估求職者解決實際問題的能力。
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="border-solid border-b-2 border-#eee my-5"></div>

              <!-- 卡片4：語言過於通用或制式 -->
              <div class="bg-#fff8e1 p-4 rounded-4px mb-4">
                <div class="flex justify-between items-center">
                  <h3 class="text-24px font-bold">語言過於通用或制式</h3>
                  <div class="flex justify-end">
                    <button
                      class="p-2 mr-2 rounded-full hover:bg-#eee transition-colors w-10 h-10"
                      :class="{ 'bg-#e6f7f6': feedbacks.item4.liked }"
                      @click="handleFeedback('item4', 'like')"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="text-#00AFB8"
                      >
                        <path
                          d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
                        ></path>
                      </svg>
                    </button>
                    <button
                      class="p-2 rounded-full hover:bg-#eee transition-colors w-10 h-10"
                      :class="{
                        'bg-#ffeaea': feedbacks.item4.disliked,
                      }"
                      @click="handleFeedback('item4', 'dislike')"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="text-#ff5252"
                      >
                        <path
                          d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="flex items-start mb-1">
                    <div class="w-full">
                      <div>
                        <p class="text-20px leading-24px text-#555 mt-0">
                          使用「深耕逾十年」「奠定堅實基礎」等過於正式且通用的詞彙，缺乏個人口吻和真實經歷描述。
                        </p>
                      </div>
                      <p class="text-14px text-#292929 mt-3">履歷內文</p>
                      <div
                        class="border-1 border-solid border-#ddd rounded-4px p-3 mb-3"
                      >
                        <div
                          class="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity duration-200"
                          @click="
                            scrollToSection(
                              'autobiography-section',
                              '本人在資訊科技領域深耕逾十年'
                            )
                          "
                        >
                          <span
                            class="text-18px text-#292929 font-bold line-clamp-2"
                          >
                            本人在資訊科技領域深耕逾十年，畢業於國立中興大學資訊管理學系，並於國立清華大學取得資訊工程碩士學位，奠定堅實的技術基礎。
                          </span>
                          <span
                            class="flex items-center justify-center ml-2 flex-shrink-0"
                          >
                            <img
                              src="@/assets/images/ai/arrow_circle_right_green.svg"
                              alt=""
                              class="text-#00afb8"
                            />
                          </span>
                        </div>
                      </div>

                      <div class="text-20px leading-24px text-#555 mt-0">
                        建議提問：
                        <div
                          class="p-4 bg-#f4eff9 rounded-8px mt-2 border-l-4 border-l-#00afb8 relative group cursor-pointer hover:bg-#e6daf2 transition-colors shadow-sm"
                          @click="
                            copyToClipboard(
                              '面試提問建議：\n\n您可以邀請求職者分享具體經歷，例如詢問在資訊科技領域十年中最印象深刻的專案或挑戰，以及哪些具體經歷讓他的技術基礎變得堅實。\n\n同時，您也可以探詢求職者的專業成長歷程，例如詢問職業生涯中遇到的挑戰與學習，以及碩士研究方向對職業發展的影響。這樣的對話能幫助您了解求職者真實的職業經歷與專業成長。'
                            )
                          "
                        >
                          <div
                            class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#00AFB8"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              <rect
                                x="9"
                                y="9"
                                width="13"
                                height="13"
                                rx="2"
                                ry="2"
                              ></rect>
                              <path
                                d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                              ></path>
                            </svg>
                          </div>
                          <div class="font-normal">
                            <p class="m-0">
                              您可以友善地邀請求職者分享在資訊科技領域十年中最難忘的專案或挑戰，以及哪些經歷幫助他建立了堅實的技術基礎。同時，探詢他的碩士研究方向如何影響職業發展，藉此了解求職者的真實經歷與成長歷程。
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="border-solid border-b-2 border-#eee my-5"></div>

              <!-- 卡片5：語句與結構過度一致 -->
              <div class="bg-#fff8e1 p-4 rounded-4px mb-4">
                <div class="flex justify-between items-center">
                  <h3 class="text-24px font-bold">語句與結構過度一致</h3>
                  <div class="flex justify-end">
                    <button
                      class="p-2 mr-2 rounded-full hover:bg-#eee transition-colors w-10 h-10"
                      :class="{ 'bg-#e6f7f6': feedbacks.item5.liked }"
                      @click="handleFeedback('item5', 'like')"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="text-#00AFB8"
                      >
                        <path
                          d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
                        ></path>
                      </svg>
                    </button>
                    <button
                      class="p-2 rounded-full hover:bg-#eee transition-colors w-10 h-10"
                      :class="{
                        'bg-#ffeaea': feedbacks.item5.disliked,
                      }"
                      @click="handleFeedback('item5', 'dislike')"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="text-#ff5252"
                      >
                        <path
                          d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="flex items-start mb-1">
                    <div class="w-full">
                      <div>
                        <p class="text-20px leading-24px text-#555 mt-0">
                          充滿套話與形容詞如「堅信」「積極」，工作描述格式高度一致，每段皆用數字列表開頭並含「重要專案」段落。
                        </p>
                      </div>
                      <p class="text-14px text-#292929 mt-3">履歷內文</p>
                      <div
                        class="border-1 border-solid border-#ddd rounded-4px p-3 mb-3"
                      >
                        <div
                          class="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity duration-200"
                          @click="
                            scrollToSection(
                              'autobiography-section',
                              '我堅信技術創新與團隊協作是驅動成功的核心'
                            )
                          "
                        >
                          <span
                            class="text-18px text-#292929 font-bold line-clamp-2"
                          >
                            我堅信技術創新與團隊協作是驅動成功的核心，始終以積極的學習態度與卓越的執行力迎接挑戰。
                          </span>
                          <span
                            class="flex items-center justify-center ml-2 flex-shrink-0"
                          >
                            <img
                              src="@/assets/images/ai/arrow_circle_right_green.svg"
                              alt=""
                              class="text-#00afb8"
                            />
                          </span>
                        </div>
                      </div>

                      <div class="text-20px leading-24px text-#555 mt-0">
                        建議提問：
                        <div
                          class="p-4 bg-#f4eff9 rounded-8px mt-2 border-l-4 border-l-#00afb8 relative group cursor-pointer hover:bg-#e6daf2 transition-colors shadow-sm"
                          @click="
                            copyToClipboard(
                              '面試提問建議：\n\n您可以挑戰履歷中的套話模式，例如請求職者分享一個具體案例，說明如何通過創新和協作解決技術挑戰，以及「積極的學習態度」在實際工作中的體現。\n\n同時，您也可以嘗試打破制式模板，邀請求職者談談職業生涯中的挫折經歷，或者請他分享如果重新設計數位轉型平台，會採取哪些不同的技術路線。這樣的對話能幫助您了解求職者真實的思維模式與經驗。'
                            )
                          "
                        >
                          <div
                            class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#00AFB8"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              <rect
                                x="9"
                                y="9"
                                width="13"
                                height="13"
                                rx="2"
                                ry="2"
                              ></rect>
                              <path
                                d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                              ></path>
                            </svg>
                          </div>
                          <div class="font-normal">
                            <p class="m-0">
                              您可以請求職者用具體案例說明如何透過創新與協作解決技術挑戰，以及「積極學習態度」在工作中的實際體現。也可以請他分享職業生涯中的挫折經歷，藉此了解求職者的真實思維方式與解決問題的能力。
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 事實查核內容區域 -->
            <div v-show="activeTab === 'fact-check'">
              <!-- 履歷上傳區域 -->
              <div v-if="factCheckProgress === 0" class="mb-8">
                <div class="mb-6 p-4 bg-#e8f5e8 rounded-6px">
                  <h3 class="text-20px font-bold text-#2e7d32 mb-2">智能履歷事實查核</h3>
                  <p class="text-16px text-#555 m-0">
                    上傳履歷內容，我們將透過 AI 技術自動解析並查證履歷中的教育背景、工作經歷、技能和成就，提供詳細的事實查核報告。
                  </p>
                </div>

                <div class="bg-white p-6 rounded-8px border border-#ddd">
                  <label class="block text-16px font-medium text-#333 mb-3">
                    履歷內容
                  </label>
                  <textarea
                    v-model="resumeInput"
                    rows="12"
                    class="w-full px-4 py-3 border border-#ddd rounded-6px focus:outline-none focus:ring-2 focus:ring-#2e7d32 text-14px leading-relaxed"
                    placeholder="請貼上候選人的履歷內容，包含姓名、教育背景、工作經歷、技能和成就等資訊..."
                  ></textarea>
                  
                  <!-- 錯誤訊息 -->
                  <div v-if="factCheckError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-6px">
                    <p class="text-red-600 text-14px m-0">{{ factCheckError }}</p>
                  </div>

                  <div class="mt-6 flex gap-4">
                    <button
                      :disabled="isFactChecking || !resumeInput.trim()"
                      class="px-6 py-3 bg-#2e7d32 text-white rounded-6px hover:bg-#1b5e20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      @click="startFactCheck"
                    >
                      {{ isFactChecking ? "處理中..." : "開始事實查核" }}
                    </button>
                    <button
                      v-if="factCheckResult"
                      class="px-6 py-3 bg-#666 text-white rounded-6px hover:bg-#555 transition-colors"
                      @click="resetFactCheck"
                    >
                      重新查核
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- 處理進度指示器 -->
              <div v-if="isFactChecking || factCheckProgress > 0 && factCheckProgress < 4" class="mb-8">
                <div class="bg-white p-6 rounded-8px border border-#ddd">
                  <h3 class="text-18px font-bold text-#333 mb-4">事實查核進度</h3>
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-4">
                      <div class="flex items-center">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-12px font-bold"
                             :class="factCheckProgress >= 1 ? 'bg-#2e7d32' : 'bg-#ddd'">
                          1
                        </div>
                        <span class="ml-2 text-14px" :class="factCheckProgress >= 1 ? 'text-#2e7d32 font-medium' : 'text-#666'">
                          履歷解析
                        </span>
                      </div>
                      <div class="flex-1 h-1 bg-#ddd rounded" :class="factCheckProgress >= 2 ? 'bg-#2e7d32' : ''"></div>
                      <div class="flex items-center">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-12px font-bold"
                             :class="factCheckProgress >= 2 ? 'bg-#2e7d32' : 'bg-#ddd'">
                          2
                        </div>
                        <span class="ml-2 text-14px" :class="factCheckProgress >= 2 ? 'text-#2e7d32 font-medium' : 'text-#666'">
                          資料搜尋
                        </span>
                      </div>
                      <div class="flex-1 h-1 bg-#ddd rounded" :class="factCheckProgress >= 3 ? 'bg-#2e7d32' : ''"></div>
                      <div class="flex items-center">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-12px font-bold"
                             :class="factCheckProgress >= 3 ? 'bg-#2e7d32' : 'bg-#ddd'">
                          3
                        </div>
                        <span class="ml-2 text-14px" :class="factCheckProgress >= 3 ? 'text-#2e7d32 font-medium' : 'text-#666'">
                          結果分析
                        </span>
                      </div>
                      <div class="flex-1 h-1 bg-#ddd rounded" :class="factCheckProgress >= 4 ? 'bg-#2e7d32' : ''"></div>
                      <div class="flex items-center">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-12px font-bold"
                             :class="factCheckProgress >= 4 ? 'bg-#2e7d32' : 'bg-#ddd'">
                          4
                        </div>
                        <span class="ml-2 text-14px" :class="factCheckProgress >= 4 ? 'text-#2e7d32 font-medium' : 'text-#666'">
                          完成
                        </span>
                      </div>
                    </div>
                  </div>
                  <div v-if="isFactChecking" class="flex items-center justify-center py-4">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-#2e7d32"></div>
                    <span class="ml-3 text-#666">正在處理中，請稍候...</span>
                  </div>
                </div>
              </div>
              
              <!-- 事實查核結果展示 -->
              <div v-if="factCheckResult && factCheckProgress === 4" class="mb-8">
                <!-- 總體摘要 -->
                <div class="bg-white p-6 rounded-8px border border-#ddd mb-6">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-20px font-bold text-#333">事實查核報告</h3>
                    <div class="flex items-center">
                      <span class="text-14px text-#666 mr-2">總體匹配度:</span>
                      <div class="w-16 h-16 rounded-full flex items-center justify-center text-white text-14px font-bold"
                           :style="{ backgroundColor: getConfidenceColor(factCheckResult.fact_check_results.overall_score) }">
                        {{ Math.round(factCheckResult.fact_check_results.overall_score * 100) }}%
                      </div>
                    </div>
                  </div>
                  <div class="text-16px text-#666 mb-4">
                    <strong>候選人:</strong> {{ factCheckResult.candidate.name }}
                  </div>
                  <div class="text-16px text-#666 mb-4">
                    {{ factCheckResult.fact_check_results.summary }}
                  </div>
                  
                  <!-- 關鍵指標 -->
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div class="text-center p-3 bg-#f8f9fa rounded-6px">
                      <div class="text-18px font-bold text-#2e7d32">{{ factCheckResult.extraction.queries_generated }}</div>
                      <div class="text-12px text-#666">查詢項目</div>
                    </div>
                    <div class="text-center p-3 bg-#f8f9fa rounded-6px">
                      <div class="text-18px font-bold text-#2e7d32">{{ factCheckResult.process_metadata.step2_searches.successful_queries }}</div>
                      <div class="text-12px text-#666">成功搜尋</div>
                    </div>
                    <div class="text-center p-3 bg-#f8f9fa rounded-6px">
                      <div class="text-18px font-bold text-#2e7d32">{{ factCheckResult.fact_check_results.verified_items.length }}</div>
                      <div class="text-12px text-#666">已驗證項目</div>
                    </div>
                    <div class="text-center p-3 bg-#f8f9fa rounded-6px">
                      <div class="text-18px font-bold text-#d32f2f">{{ factCheckResult.fact_check_results.red_flags.length }}</div>
                      <div class="text-12px text-#666">可疑項目</div>
                    </div>
                  </div>
                </div>

                <!-- 分類結果詳情 -->
                <div class="space-y-6">
                  <div v-for="match in factCheckResult.fact_check_results.matches" :key="match.category" 
                       class="bg-white p-6 rounded-8px border border-#ddd">
                    <div class="flex items-center justify-between mb-4">
                      <h4 class="text-18px font-bold text-#333 capitalize">
                        {{ match.category === 'education' ? '教育背景' : 
                            match.category === 'experience' ? '工作經歷' : 
                            match.category === 'skills' ? '技能' : '成就' }}
                      </h4>
                      <div class="flex items-center space-x-3">
                        <div class="flex items-center">
                          <span class="text-12px text-#666 mr-2">匹配:</span>
                          <div class="w-6 h-6 rounded-full flex items-center justify-center"
                               :class="match.match ? 'bg-#2e7d32' : 'bg-#d32f2f'">
                            <svg v-if="match.match" class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                            </svg>
                            <svg v-else class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                            </svg>
                          </div>
                        </div>
                        <div class="flex items-center">
                          <span class="text-12px text-#666 mr-2">置信度:</span>
                          <span class="text-14px font-bold" :style="{ color: getConfidenceColor(match.confidence) }">
                            {{ Math.round(match.confidence * 100) }}% 
                            ({{ getConfidenceText(match.confidence) }})
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div class="text-14px text-#666 mb-3">
                      {{ match.notes }}
                    </div>
                    
                    <div v-if="match.url" class="text-12px">
                      <span class="text-#666">來源: </span>
                      <a :href="match.url" target="_blank" class="text-#1976d2 hover:underline">
                        {{ match.source }}
                      </a>
                    </div>
                  </div>
                </div>

                <!-- 可疑項目警告 -->
                <div v-if="factCheckResult.fact_check_results.red_flags.length > 0" 
                     class="bg-#fff3e0 border-l-4 border-l-#f57c00 p-4 rounded-6px mt-6">
                  <h4 class="text-16px font-bold text-#f57c00 mb-2">需要注意的項目</h4>
                  <ul class="text-14px text-#666 ml-4">
                    <li v-for="flag in factCheckResult.fact_check_results.red_flags" :key="flag">
                      {{ flag }}
                    </li>
                  </ul>
                </div>

                <!-- 處理資訊 -->
                <details class="bg-#f8f9fa p-4 rounded-6px mt-6">
                  <summary class="cursor-pointer text-14px text-#666 hover:text-#333">
                    處理詳情
                  </summary>
                  <div class="mt-3 text-12px text-#666 space-y-2">
                    <div>OpenAI Tokens 用量: {{ factCheckResult.process_metadata.total_cost_estimate.openai_tokens }}</div>
                    <div>Perplexity Tokens 用量: {{ factCheckResult.process_metadata.total_cost_estimate.perplexity_tokens }}</div>
                    <div>處理時間: {{ new Date(factCheckResult.process_metadata.processing_time).toLocaleString() }}</div>
                  </div>
                </details>

                <!-- 重新查核按鈕 -->
                <div class="flex justify-center mt-6">
                  <button
                    class="px-6 py-3 bg-#666 text-white rounded-6px hover:bg-#555 transition-colors"
                    @click="resetFactCheck"
                  >
                    重新查核
                  </button>
                </div>
              </div>
            </div>
            
            <!-- 結束 v-show="activeTab === 'ai'" 區塊 -->
            <!-- Tab 導航 -->
          </div>

          <!-- 問題引導區域 -->
          <div
            v-if="showQuestionPrompt"
            class="bg-#f9f4ff p-8 rounded-8px mb-10 border-1 border-solid border-#eee shadow-md"
          >
            <div v-if="!isQuestionsLoading">
              <p class="text-22px leading-28px mb-5 text-center">
                我可以幫您總結提問求職者的方向，是否為您提供相關問題？
              </p>
              <div class="flex gap-5 justify-center">
                <button
                  class="py-3 px-8 bg-#6a3ea1 text-white border-none rounded-6px cursor-pointer hover:bg- transition-colors text-20px"
                  @click="handleQuestionsRequest(true)"
                >
                  需要
                </button>
                <button
                  class="py-3 px-8 bg-transparent border-1 border-solid border-#6a3ea1 text-#6a3ea1 rounded-6px cursor-pointer hover:bg-#6a3ea1 hover:text-white transition-colors text-20px"
                  @click="handleQuestionsRequest(false)"
                >
                  不需要
                </button>
              </div>
            </div>
            <!-- 不需要時的溫馨提示 -->
            <div
              v-if="showDenyTip"
              id="question-section"
              class="mt-5 p-4 bg-#FFF8E1 text-#856404 rounded-6px text-18px"
            >
              <p class="m-0 text-center">
                以上為我們提供的分析報告，建議與候選人更深入交流，更完整認識對方的專業歷程
              </p>
            </div>
            <!-- 需要時的載入動畫 -->
            <div v-if="isQuestionsLoading" class="mt-5 text-center">
              <div
                class="inline-block w-8 h-8 border-3 border-t-#6a3ea1 border-r-#6a3ea1 border-b-transparent border-l-transparent rounded-full animate-spin"
              ></div>
              <p
                class="text-18px text-#555 flex items-center justify-center mt-3"
              >
                <span class="mr-3">正在生成問題建議</span>
                <span class="inline-flex">
                  <span class="animate-pulse">.</span>
                  <span class="animate-pulse" style="animation-delay: 0.2s"
                    >.</span
                  >
                  <span class="animate-pulse" style="animation-delay: 0.4s"
                    >.</span
                  >
                </span>
              </p>
            </div>
          </div>

          <!-- 面試建議問題 -->
          <div
            v-if="showQuestionGuide"
            class="my-10 border-t-2 border-t-dashed border-#ddd"
          ></div>

          <div
            v-if="showQuestionGuide"
            ref="questionsRef"
            class="bg-#f9f4ff p-6 rounded-8px mb-10 border-1 border-solid border-#e0e0e0 shadow-md"
          >
            <div
              class="flex justify-between items-center cursor-pointer"
              @click="toggleInterviewQuestions"
            >
              <div class="flex items-center">
                <h3 class="text-24px font-bold my-0 text-#6a3ea1">
                  建議問題範本
                </h3>
                <!-- 新增重置按鈕 -->
                <button
                  class="py-2 px-4 mr-5 text-#555 border-none rounded-6px cursor-pointer transition-colors text-18px flex items-center"
                  @click.stop="resetQuestionSection"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="mr-2"
                  >
                    <path
                      d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
                    ></path>
                    <path d="M3 3v5h5"></path>
                  </svg>
                </button>
              </div>
              <div class="flex items-center">
                <div
                  class="transform transition-transform duration-300"
                  :class="isInterviewQuestionsExpanded ? 'rotate-180' : ''"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
            </div>

            <div
              class="interview-questions-container"
              :class="{ expanded: isInterviewQuestionsExpanded }"
              style="background-color: #f9f4ff"
            >
              <div class="interview-questions-content">
                <template v-if="isInterviewQuestionsExpanded">
                  <p class="text-20px leading-28px mb-5 text-#333 pb-3">
                    這是我的建議問題，需要我幫忙用訊息詢問求職者，或是幫您下載問題在面試中詢問嗎？
                  </p>

                  <div
                    class="p-6 bg-#f4eff9 rounded-8px mb-5 border-l-4 border-l-#6a3ea1 relative group cursor-pointer hover:bg-#e6daf2 transition-colors shadow-sm"
                    @click="
                      copyToClipboard(
                        '李先生您好，感謝您應徵我們的職位！\n\n我們對您的履歷很有興趣，希望您能先協助回覆以下幾個問題，幫助我們更了解您的專業背景：\n\n1. 您在履歷中提到在ABC科技時提升系統可擴展性30%，能非簡要說明當時的系統架構以及您採取了哪些具體措施來實現這個改善？\n\n2. 您列出精通多種技術如Python、JavaScript和Java等，能否分享一個您最熟悉的技術棧，以及一個您使用這些技術解決的最具挑戰性問題？\n\n3. 關於數位轉型平台專案，您提到降低了40%的運營成本，這個數據是如何計算的？過程中遇到了哪些主要困難，您是如何解決的？\n\n感謝您的配合！您的回覆將幫助我們更好地準備面試內容。期待您的回音，也期待不久後與您見面交流。'
                      )
                    "
                  >
                    <div
                      class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#00AFB8"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        ></rect>
                        <path
                          d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                        ></path>
                      </svg>
                    </div>
                    <p
                      class="text-19px leading-28px pl-5 pr-5 border-l-2 border-transparent font-normal"
                    >
                      李先生您好，感謝您應徵我們的職位！
                      <br /><br />
                      我們對您的履歷很有興趣，希望您能先協助回覆以下幾個問題，幫助我們更了解您的專業背景：
                      <br /><br />
                      1.
                      您在履歷中提到在ABC科技時提升系統可擴展性30%，能否簡要說明當時的系統架構以及您採取了哪些具體措施來實現這個改善？
                      <br /><br />
                      2.
                      您列出精通多種技術如Python、JavaScript和Java等，能否分享一個您最熟悉的技術棧，以及一個您使用這些技術解決的最具挑戰性問題？
                      <br /><br />
                      3.
                      關於數位轉型平台專案，您提到降低了40%的運營成本，這個數據是如何計算的？過程中遇到了哪些主要困難，您是如何解決的？
                      <br /><br />
                      感謝您的配合！您的回覆將幫助我們更好地準備面試內容。期待您的回音，也期待不久後與您見面交流。
                    </p>
                  </div>
                  <!-- 添加按鈕區域 -->
                  <div
                    class="flex gap-6 justify-center mt-8 pt-5 border-t-1 border-#eee"
                  >
                    <router-link
                      to="/bc"
                      class="py-4 px-10 text-20px bg-#6a3ea1 text-white border-none rounded-8px cursor-pointer hover:bg-#522e80 transition-colors flex items-center font-bold shadow-md"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="mr-3"
                      >
                        <path
                          d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                        ></path>
                      </svg>
                      問問求職者
                    </router-link>
                    <button
                      class="py-4 px-10 text-20px bg-transparent border-solid border-2 border-#6a3ea1 text-#6a3ea1 rounded-8px cursor-pointer hover:bg-#6a3ea1 hover:text-white transition-colors flex items-center font-bold"
                      @click="downloadQuestions"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="mr-3"
                      >
                        <path
                          d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                        ></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      下載問題範本
                    </button>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 複製狀態提示 -->
    <div v-if="isCopied" class="copy-success text-#fff">已複製到剪貼簿！</div>
  </div>
</template>

<style lang="scss">
.drawer-overlay {
  backdrop-filter: blur(1px);
}

.side-drawer {
  overscroll-behavior: contain;
  border-left: 1px solid #eee;
}

/* 點擊提示樣式 */
.click-area {
  position: relative;
  border-radius: 4px;
  transition: all 0.3s ease;

  .click-hint {
    opacity: 0.6;
    transition: opacity 0.3s ease;
  }

  &:hover {
    background-color: #f0f0f0;

    .click-hint {
      opacity: 1;
    }
  }
}

/* 內容高亮樣式 */
.highlight-content {
  background-color: rgb(255 235 59 / 50%);
  border-radius: 2px;
  box-shadow: 0 0 8px rgb(255 235 59 / 50%);
}

/* Skeleton Loading 樣式 */
.skeleton-container {
  padding: 12px 0;
}

.skeleton-line {
  height: 16px;
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: animate-shimmer 1.5s infinite;
}

.skeleton-block {
  height: 80px;
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
  background-size: 200% 100%;
  border-radius: 8px;
  animation: animate-shimmer 1.5s infinite;
}

.skeleton-circle {
  width: 48px;
  height: 48px;
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
  background-size: 200% 100%;
  border-radius: 50%;
  animation: animate-shimmer 1.5s infinite;
}

.skeleton-progress {
  width: 70%;
  height: 8px;
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: animate-shimmer 1.5s infinite;
}

.skeleton-percentage {
  width: 40px;
  height: 24px;
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: animate-shimmer 1.5s infinite;
}

.skeleton-button {
  width: 80px;
  height: 32px;
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
  background-size: 200% 100%;
  border-radius: 16px;
  animation: animate-shimmer 1.5s infinite;
}

.skeleton-pulse {
  animation: pulse 1.5s infinite;
}

.animate-pulse {
  font-size: 18px;
  font-weight: bold;
  animation: animate-pulse 1s infinite;
}

@keyframes animate-shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

@keyframes animate-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.3;
  }
}

/* 複製狀態提示 */
.copy-success {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 1000;
  padding: 10px 20px;
  color: #fff;
  background-color: rgb(0 0 0 / 70%);
  border-radius: 4px;
  transform: translate(-50%, -50%);
}

/* 面試問題滑動效果 */
.interview-questions-container {
  display: grid;
  grid-template-rows: 0fr;
  overflow: hidden;
  transition: grid-template-rows 0.3s ease-in-out;
}

.interview-questions-container.expanded {
  grid-template-rows: 1fr;
}

.interview-questions-content {
  min-height: 0;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 時間線與圓圈指示器樣式 */
.timeline-container {
  position: relative;
}

.fixed-timeline-line {
  position: absolute;
  top: 20px; /* 從第一個圓的底部開始 */
  bottom: 180px; /* 到最後一個圓的頂部結束 */
  left: 8.5px; /* 調整到圓的中心位置 */
  z-index: 1;
  width: 2px;
  background-color: #00afb8;
}

.timeline-indicator {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.circle-indicator {
  z-index: 2; /* 確保圓圈在線條上方 */
  flex-shrink: 0;
  width: 15px;
  height: 15px;
  background-color: #fff; /* 使用白色背景覆蓋直線 */
  border: 2px solid #00afb8;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #fff; /* 添加白色陰影以完全覆蓋直線 */
  transition: background-color 0.3s ease;

  &.filled {
    background-color: #00afb8;
  }
}

/* 確保 hover 效果不影響已點擊的狀態 */
.click-area:hover + div .circle-indicator:not(.filled) {
  background-color: rgb(0 175 184 / 50%); /* 半透明的懸停效果 */
}

/* 添加動畫 */
@keyframes animate-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: animate-spin 1s linear infinite;
}
</style>

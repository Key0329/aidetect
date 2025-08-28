<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const showAIDetectDrawer = ref(false);
const sidebarWidth = ref(400); // 側邊欄寬度，將在 onMounted 中設定為螢幕三分之一
const isResizing = ref(false);
const router = useRouter();

// 響應式側邊欄寬度計算
const getResponsiveSidebarWidth = () => {
  if (typeof window === "undefined") return 400;

  const width = window.innerWidth;
  if (width < 640) return Math.min(width * 0.95, 380); // 手機：95% 或最大 380px
  if (width < 1024) return Math.min(width * 0.6, 500); // 平板：60% 或最大 500px
  return Math.min(width * 0.33, 600); // 桌面：33% 或最大 600px
};

// 初始化和響應式視窗大小處理
const initSidebarWidth = () => {
  sidebarWidth.value = getResponsiveSidebarWidth();
};

const handleWindowResize = () => {
  if (!isResizing.value) {
    sidebarWidth.value = getResponsiveSidebarWidth();
  }
};
const isLoading = ref(false);
const isInterviewQuestionsExpanded = ref(false);
const highlightedElement = ref(null);
const isCopied = ref(false);

// 新增 tab 切換控制變數
const activeTab = ref("description"); // 可選值: 'description', 'ai', 'fact-check', 'questions', 'chat'

// 新增卡片總結區狀態變數
const currentCard = ref(0); // 0: 總結卡片, 1: 建議問題卡片
const cardSummary = ref({
  recommendation: "高度推薦", // 高度推薦 | 需關注問題
  jobMatch: {
    position: "前端工程師",
    strengths: ["React 開發經驗", "UI/UX 設計能力"],
    resumeHighlights: ["5年前端開發經驗", "曾主導大型電商專案開發"],
  },
  concerns: {
    areas: ["後端技術經驗相對較少", "團隊管理經驗仍在累積"],
    source: "學經歷分析",
  },
});

// 新增功能選單狀態變數
const activeFunction = ref("job-match"); // 可選值: 'job-match', 'context-analysis', 'timeline', 'fact-check', 'ai-chat'

// 複製功能狀態管理
const copiedQuestions = ref(new Set());
const showCopyToast = ref(false);

// 新增狀態管理變數
const showQuestionPrompt = ref(true); // 新增控制問題提示區域顯示的變數
const needQuestions = ref(false);
const showDenyTip = ref(false);

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

// 新的事實查核系統狀態
const resumeInput = ref("");
const isFactChecking = ref(false);
const factCheckProgress = ref(0); // 0: 未開始, 1: 解析中, 2: 搜尋中, 3: 分析中, 4: 完成
const factCheckResult = ref(null);
const factCheckError = ref("");

// AI 聊天室狀態管理
const chatMessages = ref([]);
const chatInput = ref("");
const isChatLoading = ref(false);

// 柴犬反饋系統狀態管理
const dogFeedback = ref({
  liked: false,
  disliked: false,
  showToast: false,
  toastMessage: "",
});

// 柴犬反饋訊息
const feedbackMessages = {
  like: ["謝謝你的支持！", "感謝你的讚美！", "你的鼓勵讓我們更有動力！"],
  dislike: [
    "收到你的回饋，謝謝！",
    "感謝意見，我們會改進！",
    "你的反饋很重要，謝謝！",
  ],
};

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

const showQuestionCard = () => {
  currentCard.value = 1;
};

const backToSummary = () => {
  currentCard.value = 0;
};

const scheduleInterview = () => {
  // 邀約面試功能 - 可以導向 HR 信箱或其他邀約流程
  alert("正在導向面試邀約流程...");
};

// 柴犬反饋處理函數
const handleDogFeedback = (type) => {
  if (type === "like") {
    dogFeedback.value.liked = !dogFeedback.value.liked;
    dogFeedback.value.disliked = false;
  } else {
    dogFeedback.value.disliked = !dogFeedback.value.disliked;
    dogFeedback.value.liked = false;
  }

  // 顯示隨機回饋訊息
  const messages = feedbackMessages[type];
  dogFeedback.value.toastMessage =
    messages[Math.floor(Math.random() * messages.length)];
  dogFeedback.value.showToast = true;

  // 3秒後隱藏提示
  setTimeout(() => {
    dogFeedback.value.showToast = false;
  }, 3000);
};

// 生成個性化分析文案
const generateAnalysisText = () => {
  const { concerns } = cardSummary.value;

  let text = `這位求職者很符合您所開的【行銷企劃職缺】職務需求！
特別是您在找尋的「實際行銷活動經驗」，這位求職者曾有【大型檔期與巡迴執行、跨場地協調與結案】經驗`;

  if (concerns.areas.length > 0) {
    text += `\n\n但同時我們也發現「數位投放/成效工具經驗」有需要關注的地方，建議在面試時可以多加了解。`;
  }

  return text;
};

// 複製功能
const copyQuestion = async (questionText, questionIndex) => {
  try {
    await navigator.clipboard.writeText(questionText);
    copiedQuestions.value.add(questionIndex);
    showCopySuccess();

    // 3秒後移除複製狀態
    setTimeout(() => {
      copiedQuestions.value.delete(questionIndex);
    }, 3000);
  } catch (err) {
    console.error("複製失敗:", err);
    // 降級到手動選取複製
    fallbackCopy(questionText);
  }
};

// 取得問題範本內容
const getQuestionTemplate = () => {
  return `李先生您好，感謝您應徵我們的職位！

我們對您的履歷很有興趣，希望您能先協助回覆以下幾個問題，幫助我們更了解您的專業背景：

1. 您在履歷中提到在ABC科技時提升系統可擴展性30%，能否簡要說明當時的系統架構以及您採取了哪些具體措施來實現這個改善？

2. 您列出精通多種技術如Python、JavaScript和Java等，能否分享一個您最熟悉的技術棧，以及一個您使用這些技術解決的最具挑戰性問題？

感謝您的配合！您的回覆將幫助我們更好地準備面試內容。期待您的回音，也期待不久後與您見面交流。`;
};

const copyAllQuestions = async () => {
  const templateText = getQuestionTemplate();

  try {
    await navigator.clipboard.writeText(templateText);
    showCopySuccess("已複製完整問題範本");
  } catch (err) {
    console.error("複製失敗:", err);
    fallbackCopy(templateText);
  }
};

const fallbackCopy = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand("copy");
    showCopySuccess();
  } catch (err) {
    console.error("降級複製也失敗:", err);
  }
  document.body.removeChild(textArea);
};

const showCopySuccess = () => {
  showCopyToast.value = true;
  setTimeout(() => {
    showCopyToast.value = false;
  }, 2000);
};

// 問問全職者功能
const askFullTimer = () => {
  // 這裡可以實作導向聊天功能或開啟對話
  console.log("問問全職者功能");
  // 可以切換到聊天功能
  activeTab.value = "chat";
  router.push("/bc");
};

// 下載問題範本功能
const downloadQuestionTemplate = () => {
  const templateText = getQuestionTemplate();
  const blob = new Blob([templateText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "面試問題範本.txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // 清理 URL 物件
  URL.revokeObjectURL(url);

  // 顯示下載成功提示
  console.log("問題範本已下載");
};

// 功能選單切換
const switchFunction = (funcName) => {
  activeFunction.value = funcName;
  // 根據功能同步切換對應的 tab
  const functionTabMap = {
    "job-match": "description", // 職缺符合度改為顯示基本描述頁面
    "context-analysis": "ai", // 履歷上下文分析使用原本的 ai tab
    timeline: "description",
    "fact-check": "fact-check",
    "ai-chat": "chat",
  };
  activeTab.value = functionTabMap[funcName];

  // 滿動到功能選單區域頂部
  setTimeout(() => {
    const functionsElement = document.getElementById("advanced-functions");
    if (functionsElement) {
      functionsElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  }, 100); // 稍微延遲以確保 DOM 更新完成
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
    factCheckError.value =
      err?.data?.message || err?.message || "事實查核時發生錯誤";
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

// 拖曳調整側邊欄寬度功能
const startResize = (event) => {
  isResizing.value = true;
  document.addEventListener("mousemove", handleResize);
  document.addEventListener("mouseup", stopResize);
  event.preventDefault();
};

const handleResize = (event) => {
  if (!isResizing.value) return;

  const windowWidth = window.innerWidth;
  const mouseX = event.clientX;
  const newWidth = windowWidth - mouseX;

  // 限制寬度範圍：最小 300px，最大螢幕寬度的一半
  const minWidth = 300;
  const maxWidth = Math.min(800, Math.round(windowWidth / 2));

  if (newWidth >= minWidth && newWidth <= maxWidth) {
    sidebarWidth.value = newWidth;
  }
};

const stopResize = () => {
  isResizing.value = false;
  document.removeEventListener("mousemove", handleResize);
  document.removeEventListener("mouseup", stopResize);
};

// 計算側邊欄樣式
const sidebarStyle = computed(() => {
  const isOpen = showAIDetectDrawer.value;
  const currentWidth = isOpen ? Math.max(sidebarWidth.value, 300) : 0; // 直接在這裡處理最小寬度

  return {
    width: `${currentWidth}px`,
    minWidth: isOpen ? "300px" : "0px",
    transition: isResizing.value
      ? "none"
      : "width 0.3s ease-out, min-width 0.3s ease-out",
  };
});

// 計算主內容區域樣式
const mainContentStyle = computed(() => {
  const isOpen = showAIDetectDrawer.value;
  const currentWidth = isOpen ? Math.max(sidebarWidth.value, 300) : 0;

  return {
    marginRight: `${currentWidth}px`,
    transition: isResizing.value ? "none" : "margin-right 0.3s ease-out",
  };
});

// 獲取置信度顏色
const getConfidenceColor = (confidence) => {
  if (confidence >= 0.9) return "#2e7d32"; // 綠色 - 非常確信
  if (confidence >= 0.7) return "#388e3c"; // 淺綠 - 較為確信
  if (confidence >= 0.5) return "#f57f17"; // 黃色 - 不確定
  return "#d32f2f"; // 紅色 - 可能不匹配
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
  showQuestionPrompt.value = true;
  isInterviewQuestionsExpanded.value = false;
  showDenyTip.value = false;
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
  // 使用統一的問題範本
  const content = getQuestionTemplate();

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

// 預設回應內容
const getPresetResponse = (message) => {
  const lowerMessage = message.toLowerCase();

  // 快捷選項的預設回應
  if (message.includes("分析這份履歷的優缺點")) {
    return `根據這份履歷，我看到以下分析：

✅ 優點：
• 擁有豐富的技術經驗，從實習到資深工程師的完整職涯發展
• 學歷背景扎實，從學士到碩士都是相關科系
• 具備全端開發能力和雲端架構經驗
• 有具體的成果數據（如降低40%運營成本）

⚠️ 需要注意：
• 可以進一步了解團隊領導經驗的具體細節
• 建議詢問對新技術的學習能力和適應性
• 可以確認離職原因和職涯規劃

整體來說，這是一份相當優質的履歷，建議安排面試深入了解。`;
  }

  if (message.includes("建議適合的面試問題")) {
    return `根據履歷內容，我建議以下面試問題：

🔸 技術深度：
• 請詳細說明您在ABC科技如何實現40%運營成本降低？
• 在全端開發中，您如何處理前後端的技術選型？

🔸 團隊協作：
• 請分享一個您領導團隊解決技術難題的經驗
• 如何與非技術團隊成員溝通複雜的技術問題？

🔸 職涯發展：
• 您期待在我們公司獲得什麼樣的成長機會？
• 對於這個職位，您認為最大的挑戰是什麼？

這些問題可以幫您更全面地評估候選人。`;
  }

  if (message.includes("評估候選人的適合度")) {
    return `綜合評估這位候選人的適合度：

🎯 技術匹配度：90%
• 技術棧與職位需求高度吻合
• 有實際的專案經驗和成果

🎯 經驗匹配度：85%
• 10年+經驗符合資深職位要求
• 有從基層到管理的完整歷練

🎯 文化契合度：75%
• 需要面試確認價值觀和工作風格
• 學習態度和團隊協作需進一步了解

🎯 整體評分：83%
建議優先安排面試，這位候選人值得深入交流。`;
  }

  if (message.includes("薪資談判建議")) {
    return `薪資談判建議：

💡 市場行情參考：
• 10年+ 資深工程師：年薪 120-180萬
• 有管理經驗加成：+15-25%
• 特殊技術領域：+10-20%

💡 談判策略：
• 先了解對方期待薪資範圍
• 強調公司發展前景和學習機會
• 可提供績效獎金或股票選擇權
• 考慮其他福利（彈性工時、教育訓練等）

💡 注意事項：
• 避免一開始就談薪資上限
• 預留談判空間，通常可協商10-15%
• 關注候選人真正在意的價值點

建議先確認雙方期望，再進行具體談判。`;
  }

  // 關鍵字回應
  if (lowerMessage.includes("履歷") || lowerMessage.includes("resume")) {
    return "我可以協助您分析履歷內容、評估候選人適合度，或是建議改進方向。請告訴我您想了解哪個方面？";
  }

  if (lowerMessage.includes("面試") || lowerMessage.includes("interview")) {
    return "關於面試，我可以幫您：\n• 設計針對性的面試問題\n• 提供面試技巧建議\n• 分析候選人回答\n• 評估面試表現\n\n您需要哪方面的協助呢？";
  }

  if (lowerMessage.includes("薪資") || lowerMessage.includes("salary")) {
    return "薪資相關問題我很樂意協助！我可以提供市場行情分析、談判策略建議、薪資結構設計等。請告訴我您的具體需求。";
  }

  if (lowerMessage.includes("招募") || lowerMessage.includes("recruit")) {
    return "在招募方面，我可以協助您：\n• 撰寫職缺描述\n• 制定招募策略\n• 篩選候選人\n• 優化招募流程\n\n請告訴我您目前的招募挑戰？";
  }

  // 預設友善回應
  const defaultResponses = [
    "感謝您的提問！作為人資助手，我可以協助您分析履歷、設計面試問題、提供薪資建議等。請告訴我您需要什麼協助？",
    "我是專門為人資設計的 AI 助手，擅長履歷分析、面試規劃和招募建議。有什麼我可以幫您的嗎？",
    "很高興為您服務！我在人資領域有豐富的知識，可以協助您處理各種招募和人才管理問題。請詳細描述您的需求。",
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

// AI 聊天室功能
const sendMessage = async () => {
  if (!chatInput.value.trim() || isChatLoading.value) return;

  const userMessage = chatInput.value.trim();
  chatInput.value = "";

  // 添加用戶訊息
  chatMessages.value.push({
    type: "user",
    content: userMessage,
    timestamp: new Date(),
  });

  // 設置載入狀態
  isChatLoading.value = true;

  // 模擬 AI 回應延遲
  setTimeout(() => {
    const response = getPresetResponse(userMessage);

    // 添加 AI 回覆
    chatMessages.value.push({
      type: "assistant",
      content: response,
      timestamp: new Date(),
    });

    // 滾動到底部
    setTimeout(() => {
      const chatContainer = document.getElementById("chat-messages");
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);

    isChatLoading.value = false;
  }, 1500); // 1.5 秒延遲模擬 AI 思考時間
};

const sendQuickMessage = (message) => {
  chatInput.value = message;
  sendMessage();
};

const clearChat = () => {
  chatMessages.value = [];
};

const handleKeydown = (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};

// 滾動條顯示邏輯
const setupScrollbarVisibility = () => {
  const scrollableElements = document.querySelectorAll(".scrollbar-auto");

  scrollableElements.forEach((element) => {
    let scrollTimeout;

    const handleScroll = () => {
      element.classList.add("scrolling");

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        element.classList.remove("scrolling");
      }, 1000); // 1秒後隱藏滾動條
    };

    element.addEventListener("scroll", handleScroll);

    // 清理函數
    element._cleanupScrollListener = () => {
      element.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  });
};

// 生命週期 hooks
onMounted(() => {
  initSidebarWidth();
  window.addEventListener("resize", handleWindowResize);

  // 初始化滾動條可見性
  setTimeout(() => {
    setupScrollbarVisibility();
  }, 100);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleWindowResize);

  // 清理滾動事件監聽器
  const scrollableElements = document.querySelectorAll(".scrollbar-auto");
  scrollableElements.forEach((element) => {
    if (element._cleanupScrollListener) {
      element._cleanupScrollListener();
    }
  });
});
</script>

<template>
  <div class="resume bg-#f3f3f3 flex flex-col min-h-screen relative">
    <!-- header -->
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
    <!-- nav -->
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
    <main class="bg-#f3f3f3 py-10 px-6 mx-auto" :style="mainContentStyle">
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
                  class="flex justify-center items-center z-10 w-32 h-32 rounded-full bg-white absolute -top-8 -translate-y-8"
                >
                  <img
                    src="@/assets/images/ai/sword.png"
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

    <!-- AI檢測 Push Sidebar -->
    <div
      class="push-sidebar fixed top-0 right-0 h-full bg-gradient-to-br from-slate-50 to-blue-50 z-50 shadow-2xl text-start overflow-hidden border-l border-slate-200/50"
      :style="sidebarStyle"
    >
      <!-- 拖曳調整手柄 -->
      <div
        class="resize-handle absolute left-0 top-0 h-full w-1 bg-slate-300 hover:bg-slate-400 cursor-col-resize transition-all duration-200 rounded-r-lg"
        @mousedown="startResize"
        :style="{ opacity: showAIDetectDrawer ? 1 : 0 }"
      ></div>
      <div
        class="drawer-header bg-white/50 backdrop-blur border-b border-slate-200 px-6 py-2 flex justify-between items-center ml-1"
      >
        <h2
          class="text-2xl font-bold m-0 text-slate-800 truncate flex items-center"
        >
          <svg
            class="w-6 h-6 mr-2 text-primary-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            ></path>
          </svg>
          AI 履歷助手
        </h2>
        <button
          class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg w-10 h-10 flex items-center justify-center flex-shrink-0 transition-all duration-200"
          @click="closeAIDetectDrawer"
        >
          &times;
        </button>
      </div>
      <div
        class="drawer-body p-6 overflow-y-auto h-[calc(100%-88px)] ml-1 scrollbar-auto"
      >
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

          <!-- 「以上內容有幫助嗎？」區塊 skeleton -->
          <div class="mt-6">
            <div
              class="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 px-3 py-2 rounded-lg shadow-sm"
            >
              <div class="skeleton-line w-3/4 h-4"></div>
            </div>
          </div>
          <!-- 進階功能區塊 skeleton -->
          <div class="mt-6">
            <div
              class="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 max-w-4xl mx-auto"
            >
              <div class="skeleton-block aspect-square rounded-xl"></div>
              <div class="skeleton-block aspect-square rounded-xl"></div>
              <div class="skeleton-block aspect-square rounded-xl"></div>
              <div class="skeleton-block aspect-square rounded-xl"></div>
              <div class="skeleton-block aspect-square rounded-xl"></div>
            </div>
          </div>
          <div class="skeleton-pulse text-center mt-6 text-slate-800 text-18px">
            正在分析履歷內容...
          </div>
        </div>

        <!-- 實際內容 -->
        <div v-else>
          <!-- 分析僅供參考提示 -->
          <!-- <div class="mb-4">
            <div
              class="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 p-2 rounded-xl shadow-sm"
            >
              <p
                class="m-0 leading-6 text-amber-700 font-medium flex items-center text-sm"
              >
                <svg
                  class="w-4 h-4 mr-2 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  ></path>
                </svg>
                分析僅供參考，建議結合面試表現進行綜合評估。
              </p>
            </div>
          </div> -->

          <!-- 卡片總結區 -->
          <div class="mb-6">
            <!-- 卡片容器 -->
            <div class="rounded-xl h-[470px] overflow-y-auto scrollbar-auto">
              <!-- 總結卡片 -->
              <div v-show="currentCard === 0" class="w-full h-full">
                <div class="relative h-full summary-card rounded-xl">
                  <!-- 柴犬角色 -->
                  <div class="absolute top-4 left-6 z-20">
                    <div class="relative">
                      <!-- 反饋提示訊息 - 在高度推薦下方 -->
                      <div
                        v-if="dogFeedback.showToast"
                        class="absolute -right-4 top-3 transform translate-x-full z-30"
                      >
                        <!-- 對話泡泡 -->
                        <div
                          class="relative bg-orange-500 text-white px-3 py-2 rounded-xl shadow-lg"
                        >
                          <div class="text-xs font-medium whitespace-nowrap">
                            {{ dogFeedback.toastMessage }}
                          </div>
                          <!-- 對話泡泡尾巴指向柴犬 -->
                          <div
                            class="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1"
                          >
                            <div
                              class="w-0 h-0 border-t-4 border-b-4 border-r-8 border-transparent border-r-orange-500"
                            ></div>
                          </div>
                        </div>
                      </div>
                      <img src="@/assets/images/ai/talent.png" class="w-10" />
                    </div>
                  </div>

                  <!-- 對話框 -->
                  <div
                    class="bg-gradient-to-br from-orange-50 via-white to-orange-50 border-2 border-orange-200 rounded-xl p-6 h-full relative shadow-xl"
                  >
                    <!-- 對話框尾巴 -->
                    <div
                      class="absolute top-3 left-12 w-6 h-6 bg-white border-l-2 border-t-2 border-orange-200 transform rotate-45 z-10"
                    ></div>

                    <!-- 標題區域 -->
                    <div class="pt-8 mb-6"></div>

                    <!-- 分析內容 -->
                    <div
                      class="bg-white/70 rounded-2xl p-4 mb-6 border border-orange-100 shadow-inner"
                    >
                      <div
                        class="text-slate-700 text-base leading-relaxed whitespace-pre-line"
                      >
                        {{ generateAnalysisText() }}
                      </div>
                    </div>

                    <!-- 讚/倒讚按鈕 - 移到對話框內右下方 -->
                    <div
                      class="absolute bottom-3 right-3 flex space-x-1.5 z-20"
                    >
                      <button
                        @click="handleDogFeedback('like')"
                        class="w-8 h-8 rounded-full transition-all duration-200 transform hover:scale-110 shadow-md flex items-center justify-center"
                        :class="
                          dogFeedback.liked
                            ? 'bg-green-500 text-white'
                            : 'bg-white text-gray-400 hover:bg-green-50 hover:text-green-500'
                        "
                      >
                        <svg
                          class="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558-.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.230l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z"
                          />
                        </svg>
                      </button>
                      <button
                        @click="handleDogFeedback('dislike')"
                        class="w-8 h-8 rounded-full transition-all duration-200 transform hover:scale-110 shadow-md flex items-center justify-center"
                        :class="
                          dogFeedback.disliked
                            ? 'bg-red-500 text-white'
                            : 'bg-white text-gray-400 hover:bg-red-50 hover:text-red-500'
                        "
                      >
                        <svg
                          class="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          style="transform: rotate(180deg)"
                        >
                          <path
                            d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558-.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.230l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z"
                          />
                        </svg>
                      </button>
                    </div>

                    <!-- 操作按鈕 - 移至右下方並排 -->
                    <div class="absolute bottom-4 right-4 flex space-x-2 mr-20">
                      <!-- 建議問題按鈕 -->
                      <button
                        @click="showQuestionCard"
                        class="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 min-w-[90px]"
                      >
                        建議問題
                      </button>

                      <!-- 邀約面試按鈕 -->
                      <button
                        @click="scheduleInterview"
                        class="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 min-w-[90px]"
                      >
                        邀約面試
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 建議問題卡片 -->
              <div v-show="currentCard === 1" class="w-full">
                <div
                  class="bg-gradient-to-b from-purple-50/40 to-indigo-50/60 border border-purple-200 rounded-xl summary-card flex flex-col relative"
                >
                  <div class="flex items-start mb-6">
                    <div class="flex-1">
                      <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-2">
                          <h3 class="text-xl font-bold text-slate-800 my-0">
                            建議面試問題
                          </h3>
                          <div
                            class="w-8 h-8 mb-2 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mr-2"
                          >
                            <svg
                              class="w-4 h-4 text-purple-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              ></path>
                            </svg>
                          </div>
                        </div>
                        <!-- 返回總結按鈕 -->
                        <button
                          @click="backToSummary"
                          class="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          返回總結
                        </button>
                      </div>
                      <!-- 文案區域 -->
                      <p class="text-slate-600 mb-3">
                        這是我的建議問題，需要我幫忙用訊息詢問求職者，或是幫您下載問題在面試中詢問嗎？
                      </p>

                      <!-- 統一問題內容區域 -->
                      <div class="flex-1 text-base text-slate-600">
                        <div
                          class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative cursor-pointer hover:shadow-md transition-shadow duration-200"
                          @click="copyAllQuestions"
                        >
                          <!-- 複製圖標 - 右上角 -->
                          <div
                            class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                          >
                            <svg
                              class="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              ></path>
                            </svg>
                          </div>
                          <div
                            class="whitespace-pre-line text-slate-700 leading-relaxed pr-8"
                          >
                            {{ getQuestionTemplate() }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 底部按鈕區域 -->
                  <div class="flex justify-center gap-3 mt-6 pb-4">
                    <!-- 問問全職者按鈕 -->
                    <button
                      @click="askFullTimer"
                      class="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        ></path>
                      </svg>
                      問問全職者
                    </button>

                    <!-- 下載問題範本按鈕 -->
                    <button
                      @click="downloadQuestionTemplate"
                      class="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        ></path>
                      </svg>
                      下載問題範本
                    </button>
                  </div>

                  <!-- 複製成功提示 -->
                  <div
                    v-if="showCopyToast"
                    class="fixed top-20 right-6 bg-green-500 text-white px-3 py-1.5 rounded-lg shadow-lg z-50 flex items-center space-x-2 whitespace-nowrap"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    <span>已複製到剪貼板</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 內容導引提示 -->
        <div class="mb-4">
          <div
            class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-3 py-2 rounded-lg shadow-sm"
          >
            <div class="flex flex-col justify-center">
              <div class="flex items-center justify-center">
                <svg
                  class="w-4 h-4 mr-2 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span class="text-sm font-medium text-slate-700"
                  >以上內容有幫助嗎？</span
                >
              </div>
              <span class="text-sm text-slate-500 mt-1 text-center"
                >需要我幫你再呈現更詳細的資料嗎，或許你想看：</span
              >
            </div>
          </div>
        </div>

        <!-- 功能選單區 -->
        <div
          id="advanced-functions"
          class="sticky -top-6 z-40 bg-white/95 backdrop-blur-sm border-b p-1 rounded-xl border-slate-200/50 mb-6 shadow-sm"
        >
          <div
            class="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 max-w-4xl mx-auto"
          >
            <button
              @click="switchFunction('job-match')"
              :class="
                activeFunction === 'job-match'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              "
              class="p-2 sm:p-3 rounded-xl aspect-square text-center function-button flex flex-col items-center justify-center h-full"
            >
              <div class="flex flex-col items-center">
                <svg
                  class="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  ></path>
                </svg>
                <div class="font-medium text-xs sm:text-sm leading-tight">
                  職缺符合度
                </div>
              </div>
            </button>
            <button
              @click="switchFunction('context-analysis')"
              :class="
                activeFunction === 'context-analysis'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              "
              class="p-2 sm:p-3 rounded-xl aspect-square text-center function-button flex flex-col items-center justify-center h-full"
            >
              <div class="flex flex-col items-center">
                <svg
                  class="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  ></path>
                </svg>
                <div class="font-medium text-xs sm:text-sm leading-tight">
                  上下文分析
                </div>
              </div>
            </button>
            <button
              @click="switchFunction('timeline')"
              :class="
                activeFunction === 'timeline'
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              "
              class="p-2 sm:p-3 rounded-xl aspect-square text-center function-button flex flex-col items-center justify-center h-full"
            >
              <div class="flex flex-col items-center">
                <svg
                  class="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <div class="font-medium text-xs sm:text-sm leading-tight">
                  學經歷地圖
                </div>
              </div>
            </button>
            <button
              @click="switchFunction('fact-check')"
              :class="
                activeFunction === 'fact-check'
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              "
              class="p-2 sm:p-3 rounded-xl aspect-square text-center function-button flex flex-col items-center justify-center h-full"
            >
              <div class="flex flex-col items-center">
                <svg
                  class="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <div class="font-medium text-xs sm:text-sm leading-tight">
                  事實查核
                </div>
              </div>
            </button>
            <button
              @click="switchFunction('ai-chat')"
              :class="
                activeFunction === 'ai-chat'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              "
              class="p-2 sm:p-3 rounded-xl aspect-square text-center function-button flex flex-col items-center justify-center h-full"
            >
              <div class="flex flex-col items-center">
                <svg
                  class="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  ></path>
                </svg>
                <div class="font-medium text-xs sm:text-sm leading-tight">
                  AI 聊天室
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- 內容展示區 -->
        <div
          class="bg-white/90 backdrop-blur-sm p-4 md:p-6 rounded-xl shadow-lg border border-slate-200/50"
        >
          <div v-show="activeTab === 'description'" class="tab-content">
            <!-- 學經歷時間軸視覺化 - 只在非職缺符合度功能時顯示 -->
            <div v-show="activeFunction !== 'job-match'" class="space-y-8">
              <!-- 教育背景區塊 -->
              <div class="relative">
                <h3
                  class="text-lg font-semibold text-slate-800 mb-4 flex items-center"
                >
                  <svg
                    class="w-5 h-5 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    ></path>
                  </svg>
                  教育背景
                </h3>

                <!-- 教育時間軸 -->
                <div class="relative pl-6">
                  <!-- 時間軸線 -->
                  <div
                    class="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-blue-400"
                  ></div>

                  <!-- 碩士學位 -->
                  <div class="relative mb-6">
                    <div
                      class="absolute left-[-0.5rem] w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"
                    ></div>
                    <div
                      class="bg-white rounded-lg p-4 border border-blue-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div class="flex justify-between items-start mb-2">
                        <h4 class="font-semibold text-slate-800">
                          國立清華大學
                        </h4>
                        <span class="text-sm text-slate-500">2012-2014</span>
                      </div>
                      <p class="text-sm text-slate-600 mb-1">
                        資訊工程學系 碩士
                      </p>
                      <div class="flex items-center text-xs text-blue-600">
                        <svg
                          class="w-3 h-3 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"
                            clip-rule="evenodd"
                          ></path>
                        </svg>
                        研究所畢業
                      </div>
                    </div>
                  </div>

                  <!-- 學士學位 -->
                  <div class="relative">
                    <div
                      class="absolute left-[-0.5rem] w-4 h-4 bg-blue-400 rounded-full border-2 border-white shadow-lg"
                    ></div>
                    <div
                      class="bg-white rounded-lg p-4 border border-blue-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div class="flex justify-between items-start mb-2">
                        <h4 class="font-semibold text-slate-800">
                          國立中興大學
                        </h4>
                        <span class="text-sm text-slate-500">2008-2012</span>
                      </div>
                      <p class="text-sm text-slate-600 mb-1">
                        資訊管理學系 學士
                      </p>
                      <div class="flex items-center text-xs text-blue-600">
                        <svg
                          class="w-3 h-3 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"
                            clip-rule="evenodd"
                          ></path>
                        </svg>
                        大學畢業
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 工作經歷區塊 -->
              <div class="relative">
                <h3
                  class="text-lg font-semibold text-slate-800 mb-4 flex items-center"
                >
                  <svg
                    class="w-5 h-5 mr-2 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"
                    ></path>
                  </svg>
                  工作經歷
                </h3>

                <!-- 工作時間軸 -->
                <div class="relative pl-6">
                  <!-- 時間軸線 -->
                  <div
                    class="absolute left-2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-200 to-green-400"
                  ></div>

                  <!-- 資深軟體工程師 -->
                  <div class="relative mb-6">
                    <div
                      class="absolute left-[-0.5rem] w-4 h-4 bg-green-600 rounded-full border-2 border-white shadow-lg"
                    ></div>
                    <div
                      class="bg-white rounded-lg p-4 border border-green-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div class="flex justify-between items-start mb-2">
                        <h4 class="font-semibold text-slate-800">
                          ABC科技股份有限公司
                        </h4>
                        <span class="text-sm text-slate-500">2018-2024</span>
                      </div>
                      <p class="text-sm text-slate-600 mb-2">資深軟體工程師</p>
                      <p class="text-xs text-slate-500 mb-2">
                        成功將傳統系統遷移至雲端，降低 40% 運營成本
                      </p>
                      <div class="flex items-center text-xs text-green-600">
                        <span class="bg-green-100 px-2 py-1 rounded-full"
                          >6年經驗</span
                        >
                      </div>
                    </div>
                  </div>

                  <!-- 軟體工程師 -->
                  <div class="relative mb-6">
                    <div
                      class="absolute left-[-0.5rem] w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"
                    ></div>
                    <div
                      class="bg-white rounded-lg p-4 border border-green-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div class="flex justify-between items-start mb-2">
                        <h4 class="font-semibold text-slate-800">
                          XYZ科技有限公司
                        </h4>
                        <span class="text-sm text-slate-500">2015-2018</span>
                      </div>
                      <p class="text-sm text-slate-600 mb-2">軟體工程師</p>
                      <p class="text-xs text-slate-500 mb-2">
                        開發多個企業級應用系統
                      </p>
                      <div class="flex items-center text-xs text-green-600">
                        <span class="bg-green-100 px-2 py-1 rounded-full"
                          >3年經驗</span
                        >
                      </div>
                    </div>
                  </div>

                  <!-- 初級工程師 -->
                  <div class="relative">
                    <div
                      class="absolute left-[-0.5rem] w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg"
                    ></div>
                    <div
                      class="bg-white rounded-lg p-4 border border-green-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div class="flex justify-between items-start mb-2">
                        <h4 class="font-semibold text-slate-800">
                          DEF軟體企業
                        </h4>
                        <span class="text-sm text-slate-500">2014-2015</span>
                      </div>
                      <p class="text-sm text-slate-600 mb-2">初級軟體工程師</p>
                      <p class="text-xs text-slate-500 mb-2">
                        學習企業軟體開發流程
                      </p>
                      <div class="flex items-center text-xs text-green-600">
                        <span class="bg-green-100 px-2 py-1 rounded-full"
                          >1年經驗</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 技能標籤雲 -->
              <div class="relative">
                <h3
                  class="text-lg font-semibold text-slate-800 mb-4 flex items-center"
                >
                  <svg
                    class="w-5 h-5 mr-2 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.894-1.789L5.712 18.3z"
                    ></path>
                  </svg>
                  核心技能
                </h3>

                <div class="flex flex-wrap gap-2">
                  <!-- 程式語言 -->
                  <span
                    class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >Python</span
                  >
                  <span
                    class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium"
                    >JavaScript</span
                  >
                  <span
                    class="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium"
                    >Java</span
                  >

                  <!-- 框架技術 -->
                  <span
                    class="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm font-medium"
                    >React</span
                  >
                  <span
                    class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                    >Node.js</span
                  >
                  <span
                    class="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
                    >Django</span
                  >

                  <!-- 雲端技術 -->
                  <span
                    class="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium"
                    >AWS</span
                  >
                  <span
                    class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium"
                    >Docker</span
                  >
                  <span
                    class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
                    >Kubernetes</span
                  >

                  <!-- 資料庫 -->
                  <span
                    class="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium"
                    >MySQL</span
                  >
                  <span
                    class="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium"
                    >MongoDB</span
                  >
                </div>
              </div>
            </div>

            <!-- 職缺符合度分析區域 - 只在職缺符合度功能時顯示 -->
            <div v-show="activeFunction === 'job-match'" class="space-y-6 mt-8">
              <!-- 符合分析概覽 -->
              <div
                class="mb-6 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 shadow-sm"
              >
                <div class="flex items-center mb-3">
                  <div
                    class="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3"
                  >
                    <svg
                      class="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      ></path>
                    </svg>
                  </div>
                  <h3 class="text-xl font-bold text-gray-800 mb-0">符合分析</h3>
                  <span
                    class="ml-4 inline-flex items-center bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm font-semibold"
                  >
                    20項條件符合
                  </span>
                </div>
                <p class="text-gray-600 leading-relaxed mb-0">
                  根據此份履歷的學歷、經歷、技能等指標，與您的職務所需條件進行比對分析結果。
                </p>
              </div>

              <!-- 四大分析類別 -->
              <div class="space-y-6">
                <!-- 學歷分析 -->
                <div>
                  <h3 class="text-lg font-bold text-gray-800 mb-3">
                    學歷 <span class="text-green-600">符合</span>
                  </h3>
                  <div class="space-y-3">
                    <div>
                      <h4 class="text-sm font-semibold text-gray-700 mb-2">
                        符合項目
                      </h4>
                      <div class="flex flex-wrap gap-2">
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          大學
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 class="text-sm font-semibold text-gray-700 mb-2">
                        不符合
                      </h4>
                      <div class="flex flex-wrap gap-2">
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-600"
                        >
                          資訊工程科系
                        </span>
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-600"
                        >
                          碩士
                        </span>
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-600"
                        >
                          AWS
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 經歷分析 -->
                <div>
                  <h3 class="text-lg font-bold text-gray-800 mb-3">
                    經歷 <span class="text-green-600">符合</span>
                  </h3>
                  <div>
                    <h4 class="text-sm font-semibold text-gray-700 mb-2">
                      符合項目
                    </h4>
                    <div class="flex flex-wrap gap-2">
                      <span
                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                      >
                        1年以上
                      </span>
                    </div>
                  </div>
                </div>

                <!-- 技能分析 -->
                <div>
                  <h3 class="text-lg font-bold text-gray-800 mb-3">
                    技能 <span class="text-green-600">符合</span>
                  </h3>
                  <div class="space-y-3">
                    <div>
                      <h4 class="text-sm font-semibold text-gray-700 mb-2">
                        符合項目
                      </h4>
                      <div class="flex flex-wrap gap-2">
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          Vue
                        </span>
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          JavaScript
                        </span>
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          HTML
                        </span>
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          CSS
                        </span>
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          網站開發經驗
                        </span>
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          API 串接
                        </span>
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          Github
                        </span>
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          JWT
                        </span>
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          Docker
                        </span>
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          Vitest
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 class="text-sm font-semibold text-gray-700 mb-2">
                        不符合
                      </h4>
                      <div class="flex flex-wrap gap-2">
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-600"
                        >
                          Node
                        </span>
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-600"
                        >
                          MySQL
                        </span>
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-600"
                        >
                          AWS
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 期望條件分析 -->
                <div>
                  <h3 class="text-lg font-bold text-gray-800 mb-3">
                    期望 <span class="text-green-600">非常符合</span>
                  </h3>
                  <div class="space-y-3">
                    <div>
                      <h4 class="text-sm font-semibold text-gray-700 mb-2">
                        符合項目
                      </h4>
                      <div class="flex flex-wrap gap-2">
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          全職
                        </span>
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          軟體工程師
                        </span>
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          週休二日
                        </span>
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          新北市
                        </span>
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          日班
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 class="text-sm font-semibold text-gray-700 mb-2">
                        不符合
                      </h4>
                      <div class="flex flex-wrap gap-2">
                        <span
                          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-600"
                        >
                          全端工程師
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 面試聚焦建議區域 -->
              <div
                class="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 shadow-sm"
              >
                <div class="flex items-center mb-3">
                  <div
                    class="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3"
                  >
                    <svg
                      class="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                  <h3 class="text-xl font-bold text-gray-800 mb-0">
                    面試聚焦建議
                  </h3>
                </div>
                <div class="space-y-2">
                  <p class="text-gray-700">
                    • 請說明「巡迴專案 KPI、你負責的里程碑與成效證據」
                  </p>
                  <p class="text-gray-700">
                    • 分享跨場地風險控管實例（如場地／車輛／人流協調）
                  </p>
                  <p class="text-gray-700">
                    • 若職缺強調數位／會員經營，請評估以加分或補件後再評估處理
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- 履歷上下文分析區域 - 只在履歷上下文分析功能時顯示 -->
          <div
            v-show="activeTab === 'ai' && activeFunction === 'context-analysis'"
            class="tab-content space-y-8"
          >
            <!-- 履歷上下文分析標題 -->
            <div
              class="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 p-6 rounded-xl shadow-sm"
            >
              <h3
                class="text-xl font-bold text-slate-800 mb-3 flex items-center"
              >
                <svg
                  class="w-6 h-6 mr-3 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  ></path>
                </svg>
                履歷上下文分析
              </h3>
              <p class="text-slate-600 leading-relaxed">
                分析履歷內容的一致性、邏輯性和真實性，檢查是否有矛盾、誇大或不合理的敘述。
              </p>
            </div>

            <!-- 卡片1：經歷跳躍或邏輯不通 -->
            <div
              class="group bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <!-- 卡片頭部 -->
              <div
                class="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200 p-6"
              >
                <div class="flex justify-between items-center">
                  <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                      <div
                        class="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center shadow-sm"
                      >
                        <svg
                          class="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 class="text-xl font-bold text-slate-900 mb-1">
                        經歷跳躍或邏輯不通
                      </h3>
                      <div class="flex items-center space-x-2">
                        <span
                          class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800"
                          >高風險</span
                        >
                        <span class="text-sm text-slate-500"
                          >邏輯一致性分析</span
                        >
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button
                      class="p-2 rounded-lg hover:bg-emerald-100 transition-all duration-200 group/btn"
                      :class="{
                        'bg-emerald-100 text-emerald-700 shadow-sm':
                          feedbacks.item1.liked,
                      }"
                      @click="handleFeedback('item1', 'like')"
                    >
                      <svg
                        class="w-5 h-5 text-emerald-600 group-hover/btn:scale-110 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                        ></path>
                      </svg>
                    </button>
                    <button
                      class="p-2 rounded-lg hover:bg-red-100 transition-all duration-200 group/btn"
                      :class="{
                        'bg-red-100 text-red-700 shadow-sm':
                          feedbacks.item1.disliked,
                      }"
                      @click="handleFeedback('item1', 'dislike')"
                    >
                      <svg
                        class="w-5 h-5 text-red-600 group-hover/btn:scale-110 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- 卡片內容 -->
              <div class="p-6">
                <!-- 分析描述 -->
                <div class="mb-6">
                  <p class="text-slate-700 leading-relaxed mb-4">
                    使用過於精確的數字（30%、40%、90%）但缺乏計算方法說明，顯示AI傾向於產生整齊的百分比數據。時間線存在重疊矛盾，工作經驗總和與學歷期間不符，無法自圓其說，這是AI合成履歷常見的邏輯問題。
                  </p>
                </div>

                <!-- 履歷內文區塊 -->
                <div class="mb-6">
                  <h4
                    class="text-sm font-semibold text-slate-900 mb-3 flex items-center"
                  >
                    <svg
                      class="w-4 h-4 mr-2 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                    履歷內文
                  </h4>
                  <div
                    class="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4 hover:border-cyan-300 hover:shadow-md transition-all duration-200 cursor-pointer group/content"
                  >
                    <div
                      class="flex items-start justify-between"
                      @click="
                        scrollToSection(
                          'experience-section',
                          '【數位轉型平台】成效'
                        )
                      "
                    >
                      <div class="flex-1">
                        <p
                          class="text-slate-800 font-medium leading-relaxed group-hover/content:text-slate-900"
                        >
                          【數位轉型平台】成效：成功將傳統系統遷移至雲端，降低
                          40% 運營成本，業績增長 15%。
                        </p>
                      </div>
                      <div class="ml-4 flex-shrink-0">
                        <div
                          class="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center group-hover/content:bg-cyan-200 transition-colors"
                        >
                          <svg
                            class="w-4 h-4 text-cyan-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M9 5l7 7-7 7"
                            ></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 卡片2：堆砌熱門關鍵字但缺乏上下文 -->
            <div
              class="group bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <!-- 卡片頭部 -->
              <div
                class="bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-200 p-6"
              >
                <div class="flex justify-between items-center">
                  <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                      <div
                        class="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center shadow-sm"
                      >
                        <svg
                          class="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a1.994 1.994 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 class="text-xl font-bold text-slate-900 mb-1">
                        堆砌熱門關鍵字但缺乏上下文
                      </h3>
                      <div class="flex items-center space-x-2">
                        <span
                          class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800"
                          >中風險</span
                        >
                        <span class="text-sm text-slate-500">技術深度分析</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button
                      class="p-2 rounded-lg hover:bg-emerald-100 transition-all duration-200 group/btn"
                      :class="{
                        'bg-emerald-100 text-emerald-700 shadow-sm':
                          feedbacks.item2.liked,
                      }"
                      @click="handleFeedback('item2', 'like')"
                    >
                      <svg
                        class="w-5 h-5 text-emerald-600 group-hover/btn:scale-110 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                        ></path>
                      </svg>
                    </button>
                    <button
                      class="p-2 rounded-lg hover:bg-red-100 transition-all duration-200 group/btn"
                      :class="{
                        'bg-red-100 text-red-700 shadow-sm':
                          feedbacks.item2.disliked,
                      }"
                      @click="handleFeedback('item2', 'dislike')"
                    >
                      <svg
                        class="w-5 h-5 text-red-600 group-hover/btn:scale-110 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- 卡片內容 -->
              <div class="p-6">
                <!-- 分析描述 -->
                <div class="mb-6">
                  <p class="text-slate-700 leading-relaxed mb-4">
                    羅列多種技術但缺乏實際應用案例，未提供技術掌握程度的具體證明，無法判斷技術深度真實性。
                  </p>
                </div>

                <!-- 履歷內文區塊 -->
                <div class="mb-6">
                  <h4
                    class="text-sm font-semibold text-slate-900 mb-3 flex items-center"
                  >
                    <svg
                      class="w-4 h-4 mr-2 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                    履歷內文
                  </h4>
                  <div class="space-y-3">
                    <!-- 項目1 -->
                    <div
                      class="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4 hover:border-cyan-300 hover:shadow-md transition-all duration-200 cursor-pointer group/content"
                    >
                      <div
                        class="flex items-start justify-between"
                        @click="
                          scrollToSection('skills-section', '高級程式設計')
                        "
                      >
                        <div class="flex-1">
                          <p
                            class="text-slate-800 font-medium leading-relaxed group-hover/content:text-slate-900"
                          >
                            高級程式設計：精通
                            Python、JavaScript、Java，具備跨平台全端開發能力，驅動高效能系統建構。
                          </p>
                        </div>
                        <div class="ml-4 flex-shrink-0">
                          <div
                            class="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center group-hover/content:bg-cyan-200 transition-colors"
                          >
                            <svg
                              class="w-4 h-4 text-cyan-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M9 5l7 7-7 7"
                              ></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 項目2 -->
                    <div
                      class="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4 hover:border-cyan-300 hover:shadow-md transition-all duration-200 cursor-pointer group/content"
                    >
                      <div
                        class="flex items-start justify-between"
                        @click="
                          scrollToSection(
                            'experience-section',
                            '系統架構設計：主導企業級應用程式架構'
                          )
                        "
                      >
                        <div class="flex-1">
                          <p
                            class="text-slate-800 font-medium leading-relaxed group-hover/content:text-slate-900"
                          >
                            系統架構設計：主導企業級應用程式架構，運用微服務與
                            AWS 雲端技術，提升系統可擴展性 30%。
                          </p>
                        </div>
                        <div class="ml-4 flex-shrink-0">
                          <div
                            class="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center group-hover/content:bg-cyan-200 transition-colors"
                          >
                            <svg
                              class="w-4 h-4 text-cyan-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M9 5l7 7-7 7"
                              ></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 項目3 -->
                    <div
                      class="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4 hover:border-cyan-300 hover:shadow-md transition-all duration-200 cursor-pointer group/content"
                    >
                      <div
                        class="flex items-start justify-between"
                        @click="
                          scrollToSection(
                            'experience-section',
                            '專案領導：帶領 10'
                          )
                        "
                      >
                        <div class="flex-1">
                          <p
                            class="text-slate-800 font-medium leading-relaxed group-hover/content:text-slate-900"
                          >
                            專案領導：帶領 10
                            人開發團隊，負責需求分析、功能規劃與敏捷開發，確保專案如期交付。
                          </p>
                        </div>
                        <div class="ml-4 flex-shrink-0">
                          <div
                            class="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center group-hover/content:bg-cyan-200 transition-colors"
                          >
                            <svg
                              class="w-4 h-4 text-cyan-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M9 5l7 7-7 7"
                              ></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 卡片3：敘述抽象、缺乏細節 -->
            <div
              class="group bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <!-- 卡片頭部 -->
              <div
                class="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-6"
              >
                <div class="flex justify-between items-center">
                  <div class="flex items-center space-x-4">
                    <div class="flex-shrink-0">
                      <div
                        class="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-sm"
                      >
                        <svg
                          class="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 class="text-xl font-bold text-slate-900 mb-1">
                        敘述抽象、缺乏細節
                      </h3>
                      <div class="flex items-center space-x-2">
                        <span
                          class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                          >中風險</span
                        >
                        <span class="text-sm text-slate-500">內容品質分析</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button
                      class="p-2 rounded-lg hover:bg-emerald-100 transition-all duration-200 group/btn"
                      :class="{
                        'bg-emerald-100 text-emerald-700 shadow-sm':
                          feedbacks.item3.liked,
                      }"
                      @click="handleFeedback('item3', 'like')"
                    >
                      <svg
                        class="w-5 h-5 text-emerald-600 group-hover/btn:scale-110 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                        ></path>
                      </svg>
                    </button>
                    <button
                      class="p-2 rounded-lg hover:bg-red-100 transition-all duration-200 group/btn"
                      :class="{
                        'bg-red-100 text-red-700 shadow-sm':
                          feedbacks.item3.disliked,
                      }"
                      @click="handleFeedback('item3', 'dislike')"
                    >
                      <svg
                        class="w-5 h-5 text-red-600 group-hover/btn:scale-110 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- 卡片內容 -->
              <div class="p-6">
                <!-- 分析描述 -->
                <div class="mb-6">
                  <p class="text-slate-700 leading-relaxed mb-4">
                    使用抽象通用詞彙描述工作內容，缺少具體何種後端重構方法、如何優化雲端部署、實際解決了什麼技術挑戰等細節。AI傾向於提供籠統描述而非工作中可能遇到的實際問題與具體解決方案。
                  </p>
                </div>

                <!-- 履歷內文區塊 -->
                <div class="mb-6">
                  <h4
                    class="text-sm font-semibold text-slate-900 mb-3 flex items-center"
                  >
                    <svg
                      class="w-4 h-4 mr-2 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                    履歷內文
                  </h4>
                  <div class="space-y-3">
                    <!-- 項目1 -->
                    <div
                      class="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4 hover:border-cyan-300 hover:shadow-md transition-all duration-200 cursor-pointer group/content"
                    >
                      <div
                        class="flex items-start justify-between"
                        @click="
                          scrollToSection('skills-section', '雲端與 DevOps')
                        "
                      >
                        <div class="flex-1">
                          <p
                            class="text-slate-800 font-medium leading-relaxed group-hover/content:text-slate-900"
                          >
                            雲端與 DevOps：掌握
                            AWS、Docker、Kubernetes，實現自動化部署與雲端優化。
                          </p>
                        </div>
                        <div class="ml-4 flex-shrink-0">
                          <div
                            class="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center group-hover/content:bg-cyan-200 transition-colors"
                          >
                            <svg
                              class="w-4 h-4 text-cyan-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M9 5l7 7-7 7"
                              ></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 項目2 -->
                    <div
                      class="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4 hover:border-cyan-300 hover:shadow-md transition-all duration-200 cursor-pointer group/content"
                    >
                      <div
                        class="flex items-start justify-between"
                        @click="
                          scrollToSection(
                            'experience-section',
                            '效能優化：重構後端程式碼'
                          )
                        "
                      >
                        <div class="flex-1">
                          <p
                            class="text-slate-800 font-medium leading-relaxed group-hover/content:text-slate-900"
                          >
                            效能優化：重構後端程式碼，縮短 API 響應時間
                            25%，顯著提升用戶滿意度。
                          </p>
                        </div>
                        <div class="ml-4 flex-shrink-0">
                          <div
                            class="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center group-hover/content:bg-cyan-200 transition-colors"
                          >
                            <svg
                              class="w-4 h-4 text-cyan-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M9 5l7 7-7 7"
                              ></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 事實查核內容區域 -->
        <div v-show="activeTab === 'fact-check'" class="tab-content space-y-8">
          <!-- 履歷上傳區域 -->
          <div v-if="factCheckProgress === 0" class="space-y-6">
            <!-- 特色介紹區塊 -->
            <div
              class="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6 shadow-sm"
            >
              <div class="flex items-start space-x-4">
                <div class="flex-shrink-0">
                  <div
                    class="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-sm"
                  >
                    <svg
                      class="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      ></path>
                    </svg>
                  </div>
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-emerald-900 mb-2">
                    智能履歷事實查核
                  </h3>
                  <p class="text-slate-700 leading-relaxed mb-0">
                    上傳履歷內容，我們將透過 AI
                    技術自動解析並查證履歷中的教育背景、工作經歷、技能和成就，提供詳細的事實查核報告。
                  </p>
                </div>
              </div>
            </div>

            <!-- 輸入區塊 -->
            <div
              class="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
            >
              <div
                class="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200 p-6"
              >
                <div class="flex items-center space-x-3">
                  <svg
                    class="w-5 h-5 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                  <h4 class="text-lg font-semibold text-slate-900">履歷內容</h4>
                </div>
              </div>

              <div class="p-6">
                <textarea
                  v-model="resumeInput"
                  rows="12"
                  class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm leading-relaxed resize-none transition-all duration-200"
                  placeholder="請貼上候選人的履歷內容，包含姓名、教育背景、工作經歷、技能和成就等資訊..."
                ></textarea>

                <!-- 錯誤訊息 -->
                <div
                  v-if="factCheckError"
                  class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4"
                >
                  <div class="flex items-start space-x-3">
                    <svg
                      class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <p class="text-red-700 text-sm font-medium">
                      {{ factCheckError }}
                    </p>
                  </div>
                </div>

                <div class="mt-6 flex gap-3">
                  <button
                    :disabled="isFactChecking || !resumeInput.trim()"
                    class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                    @click="startFactCheck"
                  >
                    <svg
                      v-if="isFactChecking"
                      class="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <svg
                      v-else
                      class="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      ></path>
                    </svg>
                    {{ isFactChecking ? "處理中..." : "開始事實查核" }}
                  </button>
                  <button
                    v-if="factCheckResult"
                    class="inline-flex items-center px-6 py-3 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                    @click="resetFactCheck"
                  >
                    <svg
                      class="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      ></path>
                    </svg>
                    重新查核
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 處理進度指示器 -->
          <div
            v-if="
              isFactChecking || (factCheckProgress > 0 && factCheckProgress < 4)
            "
            class="space-y-6"
          >
            <div
              class="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
            >
              <!-- 進度標題 -->
              <div
                class="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-6"
              >
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-sm"
                  >
                    <svg
                      class="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 class="text-xl font-bold text-slate-900">事實查核進度</h3>
                </div>
              </div>

              <!-- 進度步驟 -->
              <div class="p-6">
                <div class="flex items-center justify-between mb-8">
                  <!-- 步驟 1 -->
                  <div class="flex flex-col items-center">
                    <div
                      class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md transition-all duration-300"
                      :class="
                        factCheckProgress >= 1
                          ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                          : 'bg-slate-300'
                      "
                    >
                      <svg
                        v-if="factCheckProgress >= 1"
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span v-else>1</span>
                    </div>
                    <span
                      class="mt-2 text-sm font-medium text-center"
                      :class="
                        factCheckProgress >= 1
                          ? 'text-emerald-600'
                          : 'text-slate-500'
                      "
                    >
                      履歷解析
                    </span>
                  </div>

                  <!-- 連接線 1-2 -->
                  <div
                    class="flex-1 h-1 mx-4 bg-slate-200 rounded-full overflow-hidden"
                  >
                    <div
                      class="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
                      :class="factCheckProgress >= 2 ? 'w-full' : 'w-0'"
                    />
                  </div>

                  <!-- 步驟 2 -->
                  <div class="flex flex-col items-center">
                    <div
                      class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md transition-all duration-300"
                      :class="
                        factCheckProgress >= 2
                          ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                          : 'bg-slate-300'
                      "
                    >
                      <svg
                        v-if="factCheckProgress >= 2"
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span v-else>2</span>
                    </div>
                    <span
                      class="mt-2 text-sm font-medium text-center"
                      :class="
                        factCheckProgress >= 2
                          ? 'text-emerald-600'
                          : 'text-slate-500'
                      "
                    >
                      資料搜尋
                    </span>
                  </div>

                  <!-- 連接線 2-3 -->
                  <div
                    class="flex-1 h-1 mx-4 bg-slate-200 rounded-full overflow-hidden"
                  >
                    <div
                      class="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
                      :class="factCheckProgress >= 3 ? 'w-full' : 'w-0'"
                    />
                  </div>

                  <!-- 步驟 3 -->
                  <div class="flex flex-col items-center">
                    <div
                      class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md transition-all duration-300"
                      :class="
                        factCheckProgress >= 3
                          ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                          : 'bg-slate-300'
                      "
                    >
                      <svg
                        v-if="factCheckProgress >= 3"
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span v-else>3</span>
                    </div>
                    <span
                      class="mt-2 text-sm font-medium text-center"
                      :class="
                        factCheckProgress >= 3
                          ? 'text-emerald-600'
                          : 'text-slate-500'
                      "
                    >
                      結果分析
                    </span>
                  </div>

                  <!-- 連接線 3-4 -->
                  <div
                    class="flex-1 h-1 mx-4 bg-slate-200 rounded-full overflow-hidden"
                  >
                    <div
                      class="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
                      :class="factCheckProgress >= 4 ? 'w-full' : 'w-0'"
                    />
                  </div>

                  <!-- 步驟 4 -->
                  <div class="flex flex-col items-center">
                    <div
                      class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md transition-all duration-300"
                      :class="
                        factCheckProgress >= 4
                          ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                          : 'bg-slate-300'
                      "
                    >
                      <svg
                        v-if="factCheckProgress >= 4"
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span v-else>4</span>
                    </div>
                    <span
                      class="mt-2 text-sm font-medium text-center"
                      :class="
                        factCheckProgress >= 4
                          ? 'text-emerald-600'
                          : 'text-slate-500'
                      "
                    >
                      完成
                    </span>
                  </div>
                </div>

                <!-- 處理狀態 -->
                <div
                  v-if="isFactChecking"
                  class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6"
                >
                  <div class="flex items-center justify-center">
                    <div
                      class="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-500"
                    />
                    <div class="ml-4">
                      <p class="text-slate-700 font-medium">
                        正在處理中，請稍候...
                      </p>
                      <p class="text-slate-500 text-sm">
                        我們正在分析您的履歷內容
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 事實查核結果展示 -->
          <div
            v-if="factCheckResult && factCheckProgress === 4"
            class="space-y-6"
          >
            <!-- 總體摘要 -->
            <div
              class="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
            >
              <!-- 報告標題 -->
              <div
                class="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 p-6"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div
                      class="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-sm"
                    >
                      <svg
                        class="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900">
                      事實查核報告
                    </h3>
                  </div>
                  <!-- 總體匹配度圓餅 -->
                  <div class="flex items-center space-x-3">
                    <span class="text-sm font-medium text-slate-600"
                      >總體匹配度</span
                    >
                    <div
                      class="w-16 h-16 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
                      :style="{
                        backgroundColor: getConfidenceColor(
                          factCheckResult.fact_check_results.overall_score
                        ),
                      }"
                    >
                      {{
                        Math.round(
                          factCheckResult.fact_check_results.overall_score * 100
                        )
                      }}%
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-6">
                <!-- 候選人資訊 -->
                <div class="mb-6">
                  <div class="flex items-center space-x-2 mb-2">
                    <svg
                      class="w-5 h-5 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span class="font-semibold text-slate-700">候選人：</span>
                    <span class="text-slate-600">{{
                      factCheckResult.candidate.name
                    }}</span>
                  </div>
                  <p class="text-slate-600 leading-relaxed">
                    {{ factCheckResult.fact_check_results.summary }}
                  </p>
                </div>

                <!-- 關鍵指標卡片 -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div
                    class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center border border-blue-200"
                  >
                    <div class="text-2xl font-bold text-blue-600 mb-1">
                      {{ factCheckResult.extraction.queries_generated }}
                    </div>
                    <div class="text-xs font-medium text-blue-800">
                      查詢項目
                    </div>
                  </div>
                  <div
                    class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center border border-green-200"
                  >
                    <div class="text-2xl font-bold text-green-600 mb-1">
                      {{
                        factCheckResult.process_metadata.step2_searches
                          .successful_queries
                      }}
                    </div>
                    <div class="text-xs font-medium text-green-800">
                      成功搜尋
                    </div>
                  </div>
                  <div
                    class="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 text-center border border-emerald-200"
                  >
                    <div class="text-2xl font-bold text-emerald-600 mb-1">
                      {{
                        factCheckResult.fact_check_results.verified_items.length
                      }}
                    </div>
                    <div class="text-xs font-medium text-emerald-800">
                      已驗證項目
                    </div>
                  </div>
                  <div
                    class="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 text-center border border-red-200"
                  >
                    <div class="text-2xl font-bold text-red-600 mb-1">
                      {{ factCheckResult.fact_check_results.red_flags.length }}
                    </div>
                    <div class="text-xs font-medium text-red-800">可疑項目</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分類結果詳情 -->
            <div class="space-y-4">
              <div
                v-for="match in factCheckResult.fact_check_results.matches"
                :key="match.category"
                class="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <!-- 卡片頭部 -->
                <div
                  class="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200 p-4"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <!-- 類別圖標 -->
                      <div
                        class="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-500 rounded-lg flex items-center justify-center"
                      >
                        <svg
                          v-if="match.category === 'education'"
                          class="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 14l9-5-9-5-9 5 9 5z"
                          />
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                          />
                        </svg>
                        <svg
                          v-else-if="match.category === 'experience'"
                          class="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"
                          />
                        </svg>
                        <svg
                          v-else-if="match.category === 'skills'"
                          class="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.894-1.789L5.712 18.3z"
                          />
                        </svg>
                        <svg
                          v-else
                          class="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                          />
                        </svg>
                      </div>
                      <h4 class="text-lg font-bold text-slate-800">
                        {{
                          match.category === "education"
                            ? "教育背景"
                            : match.category === "experience"
                            ? "工作經歷"
                            : match.category === "skills"
                            ? "技能"
                            : "成就"
                        }}
                      </h4>
                    </div>

                    <!-- 狀態指標 -->
                    <div class="flex items-center space-x-4">
                      <!-- 匹配狀態 -->
                      <div class="flex items-center space-x-2">
                        <span class="text-xs font-medium text-slate-500"
                          >匹配</span
                        >
                        <div
                          class="w-7 h-7 rounded-full flex items-center justify-center shadow-sm"
                          :class="match.match ? 'bg-green-500' : 'bg-red-500'"
                        >
                          <svg
                            v-if="match.match"
                            class="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <svg
                            v-else
                            class="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </div>
                      </div>

                      <!-- 置信度 -->
                      <div class="flex items-center space-x-2">
                        <span class="text-xs font-medium text-slate-500"
                          >置信度</span
                        >
                        <div
                          class="px-3 py-1 rounded-full text-xs font-bold text-white"
                          :style="{
                            backgroundColor: getConfidenceColor(
                              match.confidence
                            ),
                          }"
                        >
                          {{ Math.round(match.confidence * 100) }}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 卡片內容 -->
                <div class="p-4">
                  <div class="text-slate-600 leading-relaxed mb-4">
                    {{ match.notes }}
                  </div>

                  <!-- 來源連結 -->
                  <div
                    v-if="match.url"
                    class="flex items-center space-x-2 text-sm"
                  >
                    <svg
                      class="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    <span class="text-slate-500">來源：</span>
                    <a
                      :href="match.url"
                      target="_blank"
                      class="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                    >
                      {{ match.source }}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- 可疑項目警告 -->
            <div
              v-if="factCheckResult.fact_check_results.red_flags.length > 0"
              class="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 shadow-sm"
            >
              <div class="flex items-start space-x-3">
                <div
                  class="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div class="flex-1">
                  <h4 class="text-lg font-bold text-amber-800 mb-3">
                    需要注意的項目
                  </h4>
                  <ul class="space-y-2">
                    <li
                      v-for="flag in factCheckResult.fact_check_results
                        .red_flags"
                      :key="flag"
                      class="flex items-start space-x-2"
                    >
                      <div
                        class="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"
                      />
                      <span class="text-amber-700 leading-relaxed">{{
                        flag
                      }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- 處理資訊 -->
            <details
              class="bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-xl overflow-hidden"
            >
              <summary
                class="cursor-pointer p-4 hover:bg-slate-100 transition-colors flex items-center space-x-2"
              >
                <svg
                  class="w-4 h-4 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span class="text-sm font-medium text-slate-700">處理詳情</span>
              </summary>
              <div class="p-4 border-t border-slate-200 bg-white">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div class="flex items-center space-x-2">
                    <span class="font-medium text-slate-600"
                      >OpenAI Tokens:</span
                    >
                    <span class="text-slate-500">
                      {{
                        factCheckResult.process_metadata.total_cost_estimate
                          .openai_tokens
                      }}
                    </span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="font-medium text-slate-600"
                      >Perplexity Tokens:</span
                    >
                    <span class="text-slate-500">
                      {{
                        factCheckResult.process_metadata.total_cost_estimate
                          .perplexity_tokens
                      }}
                    </span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="font-medium text-slate-600">處理時間:</span>
                    <span class="text-slate-500">
                      {{
                        new Date(
                          factCheckResult.process_metadata.processing_time
                        ).toLocaleString()
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </details>

            <!-- 操作按鈕 -->
            <div class="flex justify-center">
              <button
                class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-slate-500 to-gray-600 text-white rounded-lg hover:from-slate-600 hover:to-gray-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                @click="resetFactCheck"
              >
                <svg
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                重新查核
              </button>
            </div>
          </div>
        </div>

        <!-- 結束 v-show="activeTab === 'ai'" 區塊 -->
        <!-- Tab 導航 -->
      </div>

      <!-- 建議提問內容區域 -->
      <div v-show="activeTab === 'questions'" class="tab-content">
        <!-- 現代化標題卡片 -->
        <div
          class="mb-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100 shadow-sm"
        >
          <div class="flex items-center mb-3">
            <div
              class="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3"
            >
              <svg
                class="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-0">建議面試問題</h3>
          </div>
          <p class="text-gray-600 leading-relaxed mb-0">
            根據履歷內容生成專業的面試問題，幫助您深入了解候選人的能力和經驗。
          </p>
        </div>

        <!-- 現代化問題範本卡片 -->
        <div
          class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div
            class="flex justify-between items-center cursor-pointer p-6 hover:bg-gray-50 transition-colors"
            @click="toggleInterviewQuestions"
          >
            <div class="flex items-center">
              <div
                class="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3"
              >
                <svg
                  class="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-800 mb-0">建議問題範本</h3>
              <!-- 現代化重置按鈕 -->
              <button
                class="ml-4 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 flex items-center"
                @click.stop="resetQuestionSection"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="mr-1.5"
                >
                  <polyline points="1 4 1 10 7 10"></polyline>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
                重置
              </button>
            </div>
            <div class="flex items-center">
              <div
                class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="transform transition-all duration-300"
                  :class="{ 'rotate-180': isInterviewQuestionsExpanded }"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </div>

          <!-- 現代化問題內容展開區域 -->
          <template v-if="isInterviewQuestionsExpanded">
            <div class="border-t border-gray-100">
              <div class="p-6 space-y-8">
                <!-- 技術深度問題 -->
                <div
                  class="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border-l-4 border-blue-400"
                >
                  <div class="flex items-center mb-4">
                    <div
                      class="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3"
                    >
                      <svg
                        class="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                      </svg>
                    </div>
                    <h4 class="text-lg font-bold text-gray-800">
                      技術深度問題
                    </h4>
                  </div>
                  <div class="space-y-4">
                    <div
                      class="bg-white rounded-lg p-4 shadow-sm border border-blue-100"
                    >
                      <div class="flex items-start">
                        <div
                          class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0"
                        >
                          1
                        </div>
                        <div>
                          <h5 class="font-semibold text-gray-800 mb-2">
                            具體實作經驗
                          </h5>
                          <p class="text-gray-600 text-sm leading-relaxed">
                            請詳細說明您在ABC科技時如何實現40%運營成本降低？能否分享具體的技術方案和實施過程？
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      class="bg-white rounded-lg p-4 shadow-sm border border-blue-100"
                    >
                      <div class="flex items-start">
                        <div
                          class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0"
                        >
                          2
                        </div>
                        <div>
                          <h5 class="font-semibold text-gray-800 mb-2">
                            技術選型能力
                          </h5>
                          <p class="text-gray-600 text-sm leading-relaxed">
                            在全端開發中，您如何處理前後端的技術選型？請舉例說明您的決策過程和考量因素。
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      class="bg-white rounded-lg p-4 shadow-sm border border-blue-100"
                    >
                      <div class="flex items-start">
                        <div
                          class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0"
                        >
                          3
                        </div>
                        <div>
                          <h5 class="font-semibold text-gray-800 mb-2">
                            系統架構設計
                          </h5>
                          <p class="text-gray-600 text-sm leading-relaxed">
                            請描述您設計過最複雜的系統架構，包括技術棧選擇、擴展性考慮和性能優化策略。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 團隊協作問題 -->
                <div
                  class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-l-4 border-green-400"
                >
                  <div class="flex items-center mb-4">
                    <div
                      class="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3"
                    >
                      <svg
                        class="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <h4 class="text-lg font-bold text-gray-800">
                      團隊協作問題
                    </h4>
                  </div>
                  <div class="space-y-4">
                    <div
                      class="bg-white rounded-lg p-4 shadow-sm border border-green-100"
                    >
                      <div class="flex items-start">
                        <div
                          class="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0"
                        >
                          4
                        </div>
                        <div>
                          <h5 class="font-semibold text-gray-800 mb-2">
                            領導經驗
                          </h5>
                          <p class="text-gray-600 text-sm leading-relaxed">
                            請分享一個您領導團隊解決技術難題的經驗，包括遇到的挑戰和解決方案。
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      class="bg-white rounded-lg p-4 shadow-sm border border-green-100"
                    >
                      <div class="flex items-start">
                        <div
                          class="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0"
                        >
                          5
                        </div>
                        <div>
                          <h5 class="font-semibold text-gray-800 mb-2">
                            溝通協調
                          </h5>
                          <p class="text-gray-600 text-sm leading-relaxed">
                            如何與非技術團隊成員（如產品經理、設計師）溝通複雜的技術問題？
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      class="bg-white rounded-lg p-4 shadow-sm border border-green-100"
                    >
                      <div class="flex items-start">
                        <div
                          class="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0"
                        >
                          6
                        </div>
                        <div>
                          <h5 class="font-semibold text-gray-800 mb-2">
                            知識分享
                          </h5>
                          <p class="text-gray-600 text-sm leading-relaxed">
                            您如何幫助團隊成員提升技術能力？有沒有建立過技術分享或培訓機制？
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 職涯發展問題 -->
                <div
                  class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-l-4 border-purple-400"
                >
                  <div class="flex items-center mb-4">
                    <div
                      class="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3"
                    >
                      <svg
                        class="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <h4 class="text-lg font-bold text-gray-800">
                      職涯發展問題
                    </h4>
                  </div>
                  <div class="space-y-4">
                    <div
                      class="bg-white rounded-lg p-4 shadow-sm border border-purple-100"
                    >
                      <div class="flex items-start">
                        <div
                          class="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0"
                        >
                          7
                        </div>
                        <div>
                          <h5 class="font-semibold text-gray-800 mb-2">
                            職業規劃
                          </h5>
                          <p class="text-gray-600 text-sm leading-relaxed">
                            您期待在我們公司獲得什麼樣的成長機會？未來3-5年的職業目標是什麼？
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      class="bg-white rounded-lg p-4 shadow-sm border border-purple-100"
                    >
                      <div class="flex items-start">
                        <div
                          class="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0"
                        >
                          8
                        </div>
                        <div>
                          <h5 class="font-semibold text-gray-800 mb-2">
                            挑戰認知
                          </h5>
                          <p class="text-gray-600 text-sm leading-relaxed">
                            對於這個職位，您認為最大的挑戰是什麼？您會如何應對？
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      class="bg-white rounded-lg p-4 shadow-sm border border-purple-100"
                    >
                      <div class="flex items-start">
                        <div
                          class="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0"
                        >
                          9
                        </div>
                        <div>
                          <h5 class="font-semibold text-gray-800 mb-2">
                            學習能力
                          </h5>
                          <p class="text-gray-600 text-sm leading-relaxed">
                            面對新技術或不熟悉的領域，您的學習方法是什麼？能否舉例說明？
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 現代化按鈕區域 -->
            <div class="border-t border-gray-100 pt-6 mt-8">
              <div
                class="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <nuxt-link
                  to="/bc"
                  class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
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
                    class="mr-2"
                  >
                    <path
                      d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                    ></path>
                  </svg>
                  問問求職者
                </nuxt-link>
                <button
                  class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-base font-medium text-purple-600 bg-white hover:bg-purple-50 border-2 border-purple-200 hover:border-purple-300 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
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
                    class="mr-2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  下載問題範本
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- AI 聊天室內容區域 -->
      <div v-show="activeTab === 'chat'" class="tab-content">
        <!-- 現代化 AI 助手標題卡片 -->
        <div
          class="mb-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 shadow-sm"
        >
          <div class="flex items-center mb-3">
            <div
              class="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3"
            >
              <svg
                class="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-0">AI 人資助手</h3>
          </div>
          <p class="text-gray-600 leading-relaxed mb-0">
            專為人資設計的 AI
            助手，可以幫您分析履歷、生成面試問題、提供招募建議等。
          </p>
        </div>

        <!-- 現代化聊天訊息區域 -->
        <div
          class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div
            class="h-96 overflow-y-auto bg-gradient-to-b from-gray-50 to-white scrollbar-auto"
            id="chat-messages"
          >
            <!-- 現代化歡迎訊息 -->
            <div
              v-if="chatMessages.length === 0"
              class="h-full flex flex-col items-center justify-center p-8"
            >
              <div
                class="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-6 shadow-lg"
              >
                <svg
                  class="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h4 class="text-xl font-bold text-gray-800 mb-2">
                您好！我是您的 AI 人資助手
              </h4>
              <p class="text-gray-600 mb-6 text-center">我可以協助您：</p>
              <div
                class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md"
              >
                <button
                  @click="sendQuickMessage('分析這份履歷的優缺點')"
                  class="flex items-center justify-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border border-blue-200 rounded-xl text-sm font-medium text-gray-700 hover:text-gray-800 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <svg
                    class="w-4 h-4 mr-2 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  分析履歷優缺點
                </button>
                <button
                  @click="sendQuickMessage('建議適合的面試問題')"
                  class="flex items-center justify-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 rounded-xl text-sm font-medium text-gray-700 hover:text-gray-800 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <svg
                    class="w-4 h-4 mr-2 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  建議面試問題
                </button>
                <button
                  @click="sendQuickMessage('評估候選人的適合度')"
                  class="flex items-center justify-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 rounded-xl text-sm font-medium text-gray-700 hover:text-gray-800 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <svg
                    class="w-4 h-4 mr-2 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  評估適合度
                </button>
                <button
                  @click="sendQuickMessage('薪資談判建議')"
                  class="flex items-center justify-center p-4 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200 rounded-xl text-sm font-medium text-gray-700 hover:text-gray-800 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  <svg
                    class="w-4 h-4 mr-2 text-amber-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                  薪資談判建議
                </button>
              </div>
            </div>

            <!-- 現代化聊天訊息列表 -->
            <div class="p-4 space-y-4">
              <div
                v-for="(message, index) in chatMessages"
                :key="index"
                class="flex"
                :class="
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                "
              >
                <!-- 用戶訊息 -->
                <div v-if="message.type === 'user'" class="max-w-[75%]">
                  <div
                    class="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-2xl rounded-br-md shadow-md"
                  >
                    <p class="m-0 text-sm leading-relaxed">
                      {{ message.content }}
                    </p>
                  </div>
                </div>
                <!-- AI 回覆 -->
                <div v-else class="max-w-[75%]">
                  <div
                    class="bg-white border border-gray-200 p-4 rounded-2xl rounded-bl-md shadow-sm"
                  >
                    <div class="flex items-start">
                      <div
                        class="w-7 h-7 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                      >
                        <svg
                          class="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                      </div>
                      <div class="flex-1">
                        <p
                          class="m-0 text-sm text-gray-700 leading-relaxed whitespace-pre-line"
                        >
                          {{ message.content }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 現代化 AI 載入動畫 -->
              <div v-if="isChatLoading" class="flex justify-start">
                <div class="max-w-[75%]">
                  <div
                    class="bg-white border border-gray-200 p-4 rounded-2xl rounded-bl-md shadow-sm"
                  >
                    <div class="flex items-center">
                      <div
                        class="w-7 h-7 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                      >
                        <svg
                          class="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                      </div>
                      <div class="flex items-center space-x-1">
                        <div
                          class="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        ></div>
                        <div
                          class="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                          style="animation-delay: 0.1s"
                        ></div>
                        <div
                          class="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                          style="animation-delay: 0.2s"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 現代化輸入區域 -->
          <div class="border-t border-gray-200 bg-gray-50 p-4">
            <div class="flex gap-3">
              <div class="flex-1 relative">
                <textarea
                  v-model="chatInput"
                  @keydown="handleKeydown"
                  placeholder="輸入您的問題..."
                  rows="2"
                  class="w-full p-3 pr-12 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white shadow-sm transition-all duration-200"
                ></textarea>
              </div>
              <button
                @click="sendMessage"
                :disabled="!chatInput.trim() || isChatLoading"
                class="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center min-w-[80px] font-medium"
              >
                <svg
                  v-if="!isChatLoading"
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                <svg
                  v-else
                  class="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </button>
            </div>
            <div class="flex justify-between items-center mt-3">
              <span class="text-xs text-gray-500">
                按 Enter 發送，Shift+Enter 換行
              </span>
              <button
                @click="clearChat"
                v-if="chatMessages.length > 0"
                class="text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 rounded-md hover:bg-gray-200"
              >
                清除對話
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.drawer-overlay {
  backdrop-filter: blur(1px);
}

/* 推動式側邊欄樣式 */
.push-sidebar {
  overscroll-behavior: contain;
  border-left: 1px solid #eee;
}

.resize-handle {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.resize-handle:hover {
  background-color: #555 !important;
}

/* 確保主內容在側邊欄動畫期間不會跳動 */
main {
  box-sizing: border-box;
  min-width: 0;
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
  height: 60px;
  background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
  background-size: 200% 100%;
  border-radius: 8px;
  animation: animate-shimmer 1.5s infinite;
}

.skeleton-circle {
  width: 36px;
  height: 36px;
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

/* 現代化 Tab 樣式 */
.modern-tabs {
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.tab-item {
  border-radius: 6px 6px 0 0;
  position: relative;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

/* Tab 內容區域樣式 */
.tab-content {
  animation: fadeIn 0.3s ease-in-out;
  min-height: 200px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 半透明滾動條 - 只在滾動時顯示 */
.scrollbar-auto {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
  transition: scrollbar-color 0.3s ease;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 3px;
    transition: background 0.3s ease;
  }

  &:hover {
    scrollbar-color: rgba(148, 163, 184, 0.5) transparent;

    &::-webkit-scrollbar-thumb {
      background: rgba(148, 163, 184, 0.5);
    }

    &::-webkit-scrollbar-thumb:hover {
      background: rgba(148, 163, 184, 0.7);
    }
  }

  /* 滾動時顯示滾動條 */
  &.scrolling {
    scrollbar-color: rgba(148, 163, 184, 0.6) transparent;

    &::-webkit-scrollbar-thumb {
      background: rgba(148, 163, 184, 0.6);
    }
  }
}

/* 卡片滑動動畫優化 */
.card-slider {
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform;
}

/* 功能按鈕樣式優化 */
.function-button {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform: translateZ(0);

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }
}

/* 卡片指示器動畫 */
.card-indicator {
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.2);
  }
}

/* 卡片總結區域優化 */
.summary-card {
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);

  &:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
}

/* 按鈕懸浮效果 */
.action-button {
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
}
</style>

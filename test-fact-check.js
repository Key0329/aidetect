// 測試事實查核流程
const testResume = `
姓名：鄭翔駿
教育背景：
- 國立台北大學 學士學位 (2007-2011)

工作經歷：
- 104 資訊科技 前端工程師 (2023-至今)
- 自由教練 (2021-2023)

技能：
- 精通 Vue.js, JavaScript, CSS
- 單元測試經驗

成就：
- 鐵人幫競賽
- 考取 NSCA-CPT 美國肌力與體能協會註冊私人教練
`;

async function testFactCheck() {
  try {
    console.log("開始測試履歷事實查核流程...");

    const response = await fetch(
      "http://localhost:3000/api/resume/fact-check",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText: testResume,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log("事實查核結果:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("測試失敗:", error.message);
  }
}

testFactCheck();

// 測試履歷解析 API
const testResume = `
姓名：張明華
教育背景：
- 國立臺灣大學資訊工程學系 學士學位 (2018-2022)

工作經歷：
- ABC科技公司 軟體工程師 (2024-至今)

技能：
- 精通 Python, JavaScript

成就：
- 開發的系統提升效能30%
`;

async function testExtract() {
  try {
    console.log('開始測試履歷解析...');
    
    const response = await fetch('http://localhost:3000/api/resume/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText: testResume
      })
    });
    
    const result = await response.json();
    console.log('解析結果:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('測試失敗:', error.message);
  }
}

testExtract();
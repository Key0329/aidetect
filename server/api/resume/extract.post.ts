export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { resumeText } = body

  if (!resumeText) {
    throw createError({
      statusCode: 400,
      statusMessage: '履歷內容為必填'
    })
  }

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: '未設定 OpenAI API Key'
    })
  }

  const systemPrompt = `你是一個專業的履歷分析專家。請仔細分析提供的履歷內容，提取出可進行事實查核的具體資訊，並生成適合搜尋的查詢語句。

請按以下要求進行分析：

1. 提取履歷中的關鍵資訊：
   - 候選人姓名
   - 教育背景（學校、學位、年份）
   - 工作經歷（公司、職位、年份）
   - 技能（具體技術或專業能力）
   - 成就（具體項目、獎項、認證）

2. 為每個分類生成清晰的查詢語句，包含候選人姓名。

3. 確保提取的內容具體且可驗證。

請以 JSON 格式回應，格式如下：
{
  "name": "候選人姓名",
  "education": [
    {
      "school": "學校名稱",
      "degree": "學位",
      "year_range": "年份範圍"
    }
  ],
  "experience": [
    {
      "company": "公司名稱",
      "title": "職位",
      "year_range": "年份範圍"
    }
  ],
  "skills": ["技能1", "技能2"],
  "achievements": ["成就1", "成就2"],
  "queries": [
    {
      "query": "具體查詢語句",
      "target": "分類（education/experience/skills/achievements）"
    }
  ]
}`

  try {
    const response = await $fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `請分析以下履歷內容：\n\n${resumeText}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.1,
        response_format: { type: "json_object" }
      }
    })

    const extractedData = JSON.parse((response as any).choices[0].message.content)
    
    return {
      success: true,
      data: extractedData,
      tokens_used: (response as any).usage.total_tokens
    }
  } catch (error: any) {
    console.error('OpenAI 履歷解析錯誤:', error)
    
    if (error.response?.status === 401) {
      throw createError({
        statusCode: 401,
        statusMessage: 'OpenAI API Key 無效'
      })
    } else if (error.response?.status === 429) {
      throw createError({
        statusCode: 429,
        statusMessage: 'OpenAI API 請求次數超出限制，請稍後再試'
      })
    } else {
      throw createError({
        statusCode: 500,
        statusMessage: '履歷解析服務暫時無法使用，請稍後再試'
      })
    }
  }
})
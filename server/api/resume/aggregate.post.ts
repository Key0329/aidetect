export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { resumeData, searchResults } = body

  if (!resumeData || !searchResults) {
    throw createError({
      statusCode: 400,
      statusMessage: '履歷資料和搜尋結果為必填'
    })
  }

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: '未設定 OpenAI API Key'
    })
  }

  const systemPrompt = `你是一個專業的事實查核分析師。請根據履歷資料和搜尋結果，進行詳細的比對分析，判斷履歷內容的真實性。

請按以下標準進行分析：

1. 比對每個分類的履歷內容與搜尋結果
2. 評估匹配程度和置信度 (0.0-1.0)
3. 識別不一致或可疑的地方
4. 提供具體的來源和證據
5. 若有多個同名候選人，選擇最匹配的一個

評估標準：
- match: true/false (是否匹配)
- confidence: 0.0-1.0 (置信度，1.0為完全確信)
- 0.9-1.0: 非常確信，有明確證據
- 0.7-0.8: 較為確信，有相關證據
- 0.5-0.6: 不確定，證據不足
- 0.0-0.4: 可能不匹配或無證據

請以 JSON 格式回應：
{
  "name": "候選人姓名",
  "overall_score": 0.85,
  "matches": [
    {
      "category": "education/experience/skills/achievements",
      "match": true/false,
      "confidence": 0.95,
      "source": "來源名稱",
      "url": "來源網址",
      "notes": "詳細說明和證據"
    }
  ],
  "summary": "整體分析摘要",
  "red_flags": ["可疑或不匹配的項目"],
  "verified_items": ["已驗證的項目"]
}`

  // 整理搜尋結果給 GPT 分析
  const searchSummary = searchResults.results
    .filter((result: any) => result.success)
    .map((result: any) => ({
      category: result.target,
      query: result.query,
      content: result.result.choices[0].message.content,
      citations: result.result.citations || []
    }))

  try {
    const response = await $fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `請分析以下履歷資料與搜尋結果的匹配程度：

履歷資料：
${JSON.stringify(resumeData, null, 2)}

搜尋結果：
${JSON.stringify(searchSummary, null, 2)}

請提供詳細的事實查核報告。`
          }
        ],
        max_tokens: 3000,
        temperature: 0.2,
        response_format: { type: "json_object" }
      }
    })

    const analysisData = JSON.parse((response as any).choices[0].message.content)
    
    return {
      success: true,
      analysis: analysisData,
      metadata: {
        total_searches: searchResults.summary.total_queries,
        successful_searches: searchResults.summary.successful_queries,
        perplexity_tokens: searchResults.summary.total_tokens_used,
        openai_tokens: (response as any).usage.total_tokens,
        timestamp: new Date().toISOString()
      }
    }
  } catch (error: any) {
    console.error('OpenAI 結果聚合錯誤:', error)
    
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
        statusMessage: '結果聚合服務暫時無法使用，請稍後再試'
      })
    }
  }
})
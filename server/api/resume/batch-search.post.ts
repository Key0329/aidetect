export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { queries } = body

  if (!queries || !Array.isArray(queries) || queries.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: '查詢清單為必填且不能為空'
    })
  }

  const apiKey = process.env.PERPLEXITY_API_KEY

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: '未設定 Perplexity API Key'
    })
  }

  // 並行執行所有搜尋查詢
  const searchPromises = queries.map(async (queryItem: any) => {
    try {
      const response = await $fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: {
          model: 'sonar-reasoning-pro',
          messages: [
            {
              role: 'system',
              content: '請提供準確且詳細的資訊來回答查詢。如果找到相關資訊，請提供具體的細節和可靠的來源。如果沒有找到確切的資訊，請明確說明。'
            },
            {
              role: 'user',
              content: queryItem.query
            }
          ],
          max_tokens: 1000,
          temperature: 0.1,
          return_citations: true,
          return_related_questions: false
        }
      })

      return {
        query: queryItem.query,
        target: queryItem.target,
        success: true,
        result: response,
        timestamp: new Date().toISOString()
      }
    } catch (error: any) {
      console.error(`Perplexity 搜尋錯誤 (${queryItem.target}):`, error)
      
      return {
        query: queryItem.query,
        target: queryItem.target,
        success: false,
        error: error.response?.statusText || error.message || '搜尋失敗',
        timestamp: new Date().toISOString()
      }
    }
  })

  try {
    // 等待所有搜尋完成
    const searchResults = await Promise.all(searchPromises)
    
    // 統計結果
    const successCount = searchResults.filter(result => result.success).length
    const failureCount = searchResults.length - successCount
    
    // 計算總用量
    const totalTokens = searchResults
      .filter(result => result.success)
      .reduce((total, result) => {
        return total + ((result.result as any)?.usage?.total_tokens || 0)
      }, 0)

    return {
      success: true,
      results: searchResults,
      summary: {
        total_queries: searchResults.length,
        successful_queries: successCount,
        failed_queries: failureCount,
        total_tokens_used: totalTokens
      },
      timestamp: new Date().toISOString()
    }
  } catch (error: any) {
    console.error('批量搜尋處理錯誤:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: '批量搜尋服務發生錯誤'
    })
  }
})
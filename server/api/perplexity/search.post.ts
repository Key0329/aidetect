export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { query, model = 'sonar', refineWithOpenAI = false, refinePrompt } = body

  if (!query) {
    throw createError({
      statusCode: 400,
      statusMessage: '查詢參數為必填'
    })
  }

  // 從環境變數獲取 API Key
  const apiKey = process.env.PERPLEXITY_API_KEY

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: '未設定 Perplexity API Key'
    })
  }

  try {
    const response = await $fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        model: model,
        messages: [
          {
            role: 'system',
            content: '請提供準確且有用的資訊，並在適當時引用可靠的來源。'
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 1000,
        temperature: 0.2,
        return_citations: true,
        return_related_questions: false
      }
    })

    // 如果啟用了 OpenAI 整理功能，進行二次處理
    if (refineWithOpenAI) {
      try {
        const refinedResponse = await $fetch('/api/openai/refine', {
          method: 'POST',
          body: {
            content: (response as any).choices[0].message.content,
            prompt: refinePrompt
          }
        })
        
        return {
          ...(response as any),
          refined_content: (refinedResponse as any).refined_content,
          openai_tokens_used: (refinedResponse as any).tokens_used,
          is_refined: true
        }
      } catch (refineError: any) {
        console.error('OpenAI 整理錯誤:', refineError)
        // 如果 OpenAI 整理失敗，仍然返回原始 Perplexity 結果
        return {
          ...(response as any),
          refine_error: '內容整理失敗，顯示原始結果'
        }
      }
    }

    return response
  } catch (error: any) {
    console.error('Perplexity API 錯誤:', error)
    
    // 處理不同類型的錯誤
    if (error.response?.status === 401) {
      throw createError({
        statusCode: 401,
        statusMessage: 'API Key 無效'
      })
    } else if (error.response?.status === 429) {
      throw createError({
        statusCode: 429,
        statusMessage: 'API 請求次數超出限制，請稍後再試'
      })
    } else if (error.response?.status === 400) {
      throw createError({
        statusCode: 400,
        statusMessage: '請求參數無效'
      })
    } else {
      throw createError({
        statusCode: 500,
        statusMessage: '搜尋服務暫時無法使用，請稍後再試'
      })
    }
  }
}) 
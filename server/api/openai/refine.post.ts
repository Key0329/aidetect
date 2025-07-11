export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { content, prompt = '請將以下內容進行整理和總結，讓它更加簡潔明了：' } = body

  if (!content) {
    throw createError({
      statusCode: 400,
      statusMessage: '內容參數為必填'
    })
  }

  // 從環境變數獲取 OpenAI API Key
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: '未設定 OpenAI API Key'
    })
  }

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
            content: '你是一個專業的內容整理助手。請根據用戶的要求，將提供的內容進行整理、總結和優化，保持原意的同時讓內容更加清晰易懂。'
          },
          {
            role: 'user',
            content: `${prompt}\n\n原始內容：\n${content}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      }
    })

    return {
      refined_content: response.choices[0].message.content,
      original_content: content,
      tokens_used: response.usage.total_tokens,
      model: 'gpt-4o-mini'
    }
  } catch (error: any) {
    console.error('OpenAI API 錯誤:', error)
    
    // 處理不同類型的錯誤
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
    } else if (error.response?.status === 400) {
      throw createError({
        statusCode: 400,
        statusMessage: 'OpenAI API 請求參數無效'
      })
    } else {
      throw createError({
        statusCode: 500,
        statusMessage: 'OpenAI 服務暫時無法使用，請稍後再試'
      })
    }
  }
})
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { resumeText } = body

  if (!resumeText) {
    throw createError({
      statusCode: 400,
      statusMessage: '履歷內容為必填'
    })
  }

  try {
    // Step 1: 履歷解析與查詢生成 (GPT #1)
    console.log('Step 1: 開始履歷解析...')
    const extractResponse = await $fetch('/api/resume/extract', {
      method: 'POST',
      body: { resumeText }
    })

    if (!extractResponse.success) {
      throw new Error('履歷解析失敗')
    }

    const resumeData = extractResponse.data
    const queries = resumeData.queries

    // Step 2: 批量搜尋執行
    console.log(`Step 2: 開始執行 ${queries.length} 個搜尋查詢...`)
    const searchResponse = await $fetch('/api/resume/batch-search', {
      method: 'POST',
      body: { queries }
    })

    if (!searchResponse.success) {
      throw new Error('批量搜尋失敗')
    }

    // Step 3: 結果聚合與分析 (GPT #2)
    console.log('Step 3: 開始結果聚合分析...')
    const aggregateResponse = await $fetch('/api/resume/aggregate', {
      method: 'POST',
      body: {
        resumeData,
        searchResults: searchResponse
      }
    })

    if (!aggregateResponse.success) {
      throw new Error('結果聚合失敗')
    }

    // Step 4: 整合最終報告
    const finalReport = {
      success: true,
      candidate: {
        name: resumeData.name,
        original_resume: resumeText
      },
      extraction: {
        education: resumeData.education,
        experience: resumeData.experience,
        skills: resumeData.skills,
        achievements: resumeData.achievements,
        queries_generated: queries.length
      },
      fact_check_results: aggregateResponse.analysis,
      process_metadata: {
        step1_tokens: extractResponse.tokens_used,
        step2_searches: searchResponse.summary,
        step3_tokens: aggregateResponse.metadata.openai_tokens,
        total_cost_estimate: {
          openai_tokens: extractResponse.tokens_used + aggregateResponse.metadata.openai_tokens,
          perplexity_tokens: searchResponse.summary.total_tokens_used
        },
        processing_time: new Date().toISOString(),
        workflow_version: '1.0'
      }
    }

    return finalReport

  } catch (error: any) {
    console.error('事實查核流程錯誤:', error)
    
    // 根據錯誤類型返回適當的錯誤訊息
    if (error.message === '履歷解析失敗') {
      throw createError({
        statusCode: 500,
        statusMessage: '履歷解析階段發生錯誤，請檢查履歷內容格式'
      })
    } else if (error.message === '批量搜尋失敗') {
      throw createError({
        statusCode: 500,
        statusMessage: '搜尋階段發生錯誤，請稍後重試'
      })
    } else if (error.message === '結果聚合失敗') {
      throw createError({
        statusCode: 500,
        statusMessage: '分析階段發生錯誤，請稍後重試'
      })
    } else {
      throw createError({
        statusCode: 500,
        statusMessage: error.message || '事實查核服務暫時無法使用，請稍後再試'
      })
    }
  }
})
import http from '@/http'

// 测试代理是否正常工作（直连真实端点，不走 mock 分支）
export async function testProxy() {
  try {
    console.log('开始测试代理配置...')

    // 测试 /api 代理
    const apiResponse = await http.get('/System/Index/get_menu.html', { pid: 0 })
    console.log('API 代理测试成功:', apiResponse)

    // 测试 api1 代理
    const api1Response = await http.post('api1/test.html')
    console.log('api1 代理测试成功:', api1Response)

    return { success: true, apiResponse, api1Response }
  } catch (error) {
    console.error('代理测试失败:', error)
    return { success: false, error }
  }
}

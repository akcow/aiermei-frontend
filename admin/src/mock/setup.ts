import instance from '../api/request'
import {
  mockAdminUser,
  mockAnalysisResult,
  mockArticles,
  mockBanners,
  mockComplaints,
  mockCoupons,
  mockCustomers,
  mockDashboardOverview,
  mockEvaluations,
  mockMagazines,
  mockOrders,
  mockSuites,
  mockUserJourney
} from './data'

type AnyObj = Record<string, any>

type ApiResp<T = any> = {
  code: number
  message: string
  data: T
  requestId: string
  timestamp: string
}

const state = {
  articles: [...mockArticles] as AnyObj[],
  banners: [...mockBanners] as AnyObj[],
  magazines: [...mockMagazines] as AnyObj[],
  suites: [...mockSuites] as AnyObj[],
  orders: [...mockOrders] as AnyObj[],
  coupons: [...mockCoupons] as AnyObj[],
  evaluations: [...mockEvaluations] as AnyObj[],
  complaints: [...mockComplaints] as AnyObj[],
  customers: [...mockCustomers] as AnyObj[],
  contentCategories: [
    { id: 'pregnancy', label: '孕期', sort: 1 },
    { id: 'postpartum', label: '产后', sort: 2 },
    { id: 'parenting', label: '育儿', sort: 3 },
    { id: 'nanny', label: '月嫂', sort: 4 }
  ] as AnyObj[],
  faqCategories: [
    { id: 'faq_cat_1', name: '入住须知', sort: 1, createdAt: new Date().toISOString() },
    { id: 'faq_cat_2', name: '产后护理', sort: 2, createdAt: new Date().toISOString() }
  ] as AnyObj[],
  faqItems: [
    {
      id: 'faq_item_1',
      categoryId: 'faq_cat_1',
      title: '可以提前看房吗？',
      content: '支持预约看房。',
      sort: 1,
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'faq_item_2',
      categoryId: 'faq_cat_2',
      title: '母乳指导包含哪些内容？',
      content: '包括姿势、频率、常见问题处理。',
      sort: 2,
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ] as AnyObj[],
  hotlineConfig: {
    serviceQrCodeUrl: 'https://picsum.photos/seed/service_qr/300/300',
    serviceQrTips: '添加客服微信了解详情',
    hotlines: [
      { id: 'hotline_1', label: '客服热线', number: '400-800-1234', sort: 1, status: 'active' },
      { id: 'hotline_2', label: '夜间值班', number: '400-800-5678', sort: 2, status: 'active' }
    ]
  } as AnyObj,
  centerHome: {
    heroImage: 'https://picsum.photos/seed/center_hero/1200/500',
    brandTitle: '爱儿美月子中心',
    brandSubtitle: '专业产后康复与新生儿照护',
    facilities: [
      { id: 'facility_1', title: '护理站', desc: '24小时护士值班', image: 'https://picsum.photos/seed/f1/400/240', sort: 1 },
      { id: 'facility_2', title: '月子餐', desc: '营养师定制', image: 'https://picsum.photos/seed/f2/400/240', sort: 2 }
    ]
  } as AnyObj,
  centerSections: [
    {
      id: 'section_1',
      title: '产后修复中心',
      desc: '个性化修复方案',
      coverImage: 'https://picsum.photos/seed/s1/600/320',
      detailImage: 'https://picsum.photos/seed/s1d/1200/800',
      sort: 1,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'section_2',
      title: '新生儿照护专区',
      desc: '科学护理与早教支持',
      coverImage: 'https://picsum.photos/seed/s2/600/320',
      detailImage: 'https://picsum.photos/seed/s2d/1200/800',
      sort: 2,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ] as AnyObj[],
  articleTags: new Map<string, AnyObj[]>()
}

function now() {
  return new Date().toISOString()
}

function createResponse<T>(config: AnyObj, data: T, code = 0, message = 'ok') {
  return Promise.resolve({
    data: {
      code,
      message,
      data,
      requestId: 'mock',
      timestamp: now()
    } as ApiResp<T>,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
    request: {}
  })
}

function parseUrl(url: string) {
  return new URL(url, 'http://mock.local')
}

function parseData(data: any): AnyObj {
  if (!data) return {}
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    } catch {
      return {}
    }
  }
  return data
}

function toNumber(v: any, d: number) {
  const n = Number(v)
  return Number.isFinite(n) ? n : d
}

function paginate<T>(list: T[], page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return {
    list: list.slice(start, end),
    page,
    pageSize,
    total: list.length,
    hasMore: end < list.length
  }
}

function nextId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
}

function findByPathId(path: string) {
  const seg = path.split('/').filter(Boolean)
  return seg[seg.length - 1] || ''
}

function upsertById<T extends AnyObj>(arr: T[], id: string, patch: AnyObj) {
  const idx = arr.findIndex((item) => item.id === id)
  if (idx < 0) return null
  arr[idx] = { ...arr[idx], ...patch, updatedAt: now() }
  return arr[idx]
}

function removeById<T extends AnyObj>(arr: T[], id: string) {
  const idx = arr.findIndex((item) => item.id === id)
  if (idx >= 0) arr.splice(idx, 1)
}

export function setupMock() {
  const originalAdapter = instance.defaults.adapter

  instance.defaults.adapter = async (config: AnyObj) => {
    const method = String(config.method || 'GET').toUpperCase()
    const rawUrl = String(config.url || '')
    const parsed = parseUrl(rawUrl)
    const path = parsed.pathname
    const query = Object.fromEntries(parsed.searchParams.entries())
    const body = parseData(config.data)

    await new Promise((resolve) => setTimeout(resolve, 120))

    // Auth
    if (path === '/admin/auth/login' && method === 'POST') {
      const username = body.username || 'admin'
      return createResponse(config, {
        token: `demo_token_${Date.now()}`,
        user: {
          ...mockAdminUser,
          username,
          name: username === 'admin' ? '管理员' : username,
          lastLoginAt: now()
        }
      })
    }

    if (path === '/admin/auth/me' && method === 'GET') {
      return createResponse(config, mockAdminUser)
    }

    if (path === '/admin/auth/logout' && method === 'POST') {
      return createResponse(config, null)
    }

    // Dashboard
    if (path === '/admin/dashboard/overview' && method === 'GET') {
      return createResponse(config, {
        ...mockDashboardOverview,
        orderCount: state.orders.length,
        hotContentTitle: state.articles[0]?.title || mockDashboardOverview.hotContentTitle
      })
    }

    // Customers + Analytics
    if (path === '/admin/customers' && method === 'GET') {
      const page = toNumber(query.page, 1)
      const pageSize = toNumber(query.pageSize, 10)
      const keyword = (query.keyword || '').trim()
      const list = keyword
        ? state.customers.filter((u) => String(u.name).includes(keyword) || String(u.phone || '').includes(keyword))
        : state.customers
      return createResponse(config, paginate(list, page, pageSize))
    }

    if (path.startsWith('/admin/customers/') && method === 'GET') {
      const uid = findByPathId(path)
      const item = state.customers.find((u) => u.uid === uid)
      return createResponse(config, item || state.customers[0])
    }

    if (path.startsWith('/analytics/users/') && path.endsWith('/journey') && method === 'GET') {
      const seg = path.split('/').filter(Boolean)
      const uid = seg[2] || state.customers[0]?.uid
      return createResponse(config, mockUserJourney(uid))
    }

    if (path.startsWith('/admin/users/') && path.endsWith('/analysis') && method === 'POST') {
      const result = mockAnalysisResult()
      return createResponse(config, {
        ...result,
        concerns: [{ code: 'sleep_quality', name: '睡眠质量', confidence: 0.81 }],
        anxieties: [{ code: 'milk_supply', name: '泌乳不足', confidence: 0.79 }],
        behaviors: [{ code: 'content_reader', name: '内容深读', confidence: 0.74 }]
      })
    }

    // Orders
    if (path === '/admin/orders' && method === 'GET') {
      const page = toNumber(query.page, 1)
      const pageSize = toNumber(query.pageSize, 10)
      const status = (query.status || '').trim()
      const keyword = (query.keyword || '').trim()
      let list = [...state.orders]
      if (status) list = list.filter((x) => x.status === status)
      if (keyword) {
        list = list.filter(
          (x) => String(x.orderNo).includes(keyword) || String(x.customerName).includes(keyword) || String(x.customerPhone || '').includes(keyword)
        )
      }
      return createResponse(config, paginate(list, page, pageSize))
    }

    if (path.startsWith('/admin/orders/') && method === 'GET' && !path.endsWith('/stats')) {
      const id = findByPathId(path)
      const item = state.orders.find((x) => x.id === id)
      return createResponse(config, item || state.orders[0])
    }

    if (path === '/admin/orders/stats' && method === 'GET') {
      const stats = state.orders.reduce(
        (acc, o) => {
          acc.total += 1
          if (acc[o.status] !== undefined) acc[o.status] += 1
          acc.totalRevenue += Number(o.payableAmount || 0)
          return acc
        },
        {
          total: 0,
          pending: 0,
          paid: 0,
          completed: 0,
          cancelled: 0,
          refunded: 0,
          confirmed: 0,
          totalRevenue: 0,
          totalRevenueLabel: ''
        } as AnyObj
      )
      stats.totalRevenueLabel = `¥${(stats.totalRevenue / 100).toLocaleString()}`
      return createResponse(config, stats)
    }

    if (path.match(/^\/admin\/orders\/[^/]+\/confirm$/) && method === 'POST') {
      const id = path.split('/')[3]
      const item = upsertById(state.orders, id, { status: 'confirmed' })
      return createResponse(config, item || true)
    }

    if (path.match(/^\/admin\/orders\/[^/]+\/cancel$/) && method === 'POST') {
      const id = path.split('/')[3]
      const item = upsertById(state.orders, id, { status: 'cancelled', cancelReason: body.reason || '' })
      return createResponse(config, item || true)
    }

    if (path.match(/^\/admin\/orders\/[^/]+\/refund$/) && method === 'POST') {
      const id = path.split('/')[3]
      const item = upsertById(state.orders, id, { status: 'refunded', refundReason: body.reason || '' })
      return createResponse(config, item || true)
    }

    if (path.match(/^\/admin\/orders\/[^/]+\/remark$/) && method === 'PUT') {
      const id = path.split('/')[3]
      const item = upsertById(state.orders, id, { remark: body.remark || '' })
      return createResponse(config, item || true)
    }

    // Articles + Categories
    if (path === '/admin/content/articles' && method === 'GET') {
      const page = toNumber(query.page, 1)
      const pageSize = toNumber(query.pageSize, 10)
      const category = (query.category || '').trim()
      const status = (query.status || '').trim()
      const keyword = (query.keyword || '').trim()
      let list = [...state.articles]
      if (category) list = list.filter((x) => x.category === category)
      if (status) list = list.filter((x) => x.status === status)
      if (keyword) list = list.filter((x) => String(x.title).includes(keyword))
      return createResponse(config, paginate(list, page, pageSize))
    }

    if (path === '/admin/content/articles' && method === 'POST') {
      const item = {
        id: nextId('article'),
        likes: 0,
        views: 0,
        createdAt: now(),
        updatedAt: now(),
        ...body
      }
      state.articles.unshift(item)
      return createResponse(config, item)
    }

    if (path.match(/^\/admin\/content\/articles\/[^/]+$/) && method === 'GET') {
      const id = findByPathId(path)
      const item = state.articles.find((x) => x.id === id)
      return createResponse(config, item || state.articles[0])
    }

    if (path.match(/^\/admin\/content\/articles\/[^/]+$/) && method === 'PUT') {
      const id = findByPathId(path)
      const item = upsertById(state.articles, id, body)
      return createResponse(config, item || true)
    }

    if (path.match(/^\/admin\/content\/articles\/[^/]+$/) && method === 'DELETE') {
      const id = findByPathId(path)
      removeById(state.articles, id)
      return createResponse(config, null)
    }

    if (path.match(/^\/admin\/content\/articles\/[^/]+\/publish$/) && method === 'POST') {
      const id = path.split('/')[4]
      const item = upsertById(state.articles, id, { status: 'published', publishedAt: now() })
      return createResponse(config, item || true)
    }

    if (path.match(/^\/admin\/content\/articles\/[^/]+\/archive$/) && method === 'POST') {
      const id = path.split('/')[4]
      const item = upsertById(state.articles, id, { status: 'archived' })
      return createResponse(config, item || true)
    }

    if (path === '/admin/content/categories' && method === 'GET') {
      return createResponse(config, state.contentCategories)
    }

    if (path === '/admin/content/categories' && method === 'POST') {
      const item = { id: nextId('category'), ...body }
      state.contentCategories.push(item)
      return createResponse(config, item)
    }

    if (path.match(/^\/admin\/content\/categories\/[^/]+$/) && method === 'PUT') {
      const id = findByPathId(path)
      const idx = state.contentCategories.findIndex((x) => x.id === id)
      if (idx >= 0) state.contentCategories[idx] = { ...state.contentCategories[idx], ...body }
      return createResponse(config, state.contentCategories[idx] || true)
    }

    if (path.match(/^\/admin\/content\/categories\/[^/]+$/) && method === 'DELETE') {
      const id = findByPathId(path)
      removeById(state.contentCategories, id)
      return createResponse(config, null)
    }

    // Article tags
    if (path.match(/^\/admin\/articles\/[^/]+\/extract-tags$/) && method === 'POST') {
      const articleId = path.split('/')[3]
      const generated = [
        { articleId, tagCode: 'postpartum_recovery', tagName: '产后恢复', source: 'AI' },
        { articleId, tagCode: 'nutrition', tagName: '营养膳食', source: 'AI' }
      ]
      state.articleTags.set(articleId, generated)
      return createResponse(config, generated)
    }

    if (path.match(/^\/admin\/articles\/[^/]+\/tags$/) && method === 'GET') {
      const articleId = path.split('/')[3]
      return createResponse(config, state.articleTags.get(articleId) || [])
    }

    if (path.match(/^\/admin\/articles\/[^/]+\/tags$/) && method === 'POST') {
      const articleId = path.split('/')[3]
      const list = state.articleTags.get(articleId) || []
      const item = {
        articleId,
        tagCode: body.tagCode || nextId('tag'),
        tagName: body.tagName || body.tagCode || '新标签',
        source: body.source || 'MANUAL'
      }
      list.push(item)
      state.articleTags.set(articleId, list)
      return createResponse(config, item)
    }

    if (path.match(/^\/admin\/articles\/[^/]+\/tags\/[^/]+$/) && method === 'DELETE') {
      const articleId = path.split('/')[3]
      const tagCode = path.split('/')[5]
      const list = (state.articleTags.get(articleId) || []).filter((x) => x.tagCode !== tagCode)
      state.articleTags.set(articleId, list)
      return createResponse(config, null)
    }

    // Banner/Magazine/Suite
    const contentCollections: Array<{ base: string; data: AnyObj[]; prefix: string }> = [
      { base: '/admin/content/banners', data: state.banners, prefix: 'banner' },
      { base: '/admin/content/magazines', data: state.magazines, prefix: 'magazine' },
      { base: '/admin/content/suites', data: state.suites, prefix: 'suite' }
    ]

    for (const col of contentCollections) {
      if (path === col.base && method === 'GET') return createResponse(config, col.data)
      if (path === col.base && method === 'POST') {
        const item = { id: nextId(col.prefix), createdAt: now(), updatedAt: now(), ...body }
        col.data.unshift(item)
        return createResponse(config, item)
      }
      if (path.match(new RegExp(`^${col.base}\\/[^/]+$`)) && method === 'GET') {
        const id = findByPathId(path)
        return createResponse(config, col.data.find((x) => x.id === id) || col.data[0])
      }
      if (path.match(new RegExp(`^${col.base}\\/[^/]+$`)) && method === 'PUT') {
        const id = findByPathId(path)
        const item = upsertById(col.data, id, body)
        return createResponse(config, item || true)
      }
      if (path.match(new RegExp(`^${col.base}\\/[^/]+$`)) && method === 'DELETE') {
        const id = findByPathId(path)
        removeById(col.data, id)
        return createResponse(config, null)
      }
    }

    // Coupons
    if (path === '/admin/coupons' && method === 'GET') {
      const page = toNumber(query.page, 1)
      const pageSize = toNumber(query.pageSize, 10)
      const status = (query.status || '').trim()
      const list = status ? state.coupons.filter((x) => x.status === status) : state.coupons
      return createResponse(config, paginate(list, page, pageSize))
    }

    if (path === '/admin/coupons' && method === 'POST') {
      const item = { id: nextId('coupon'), createdAt: now(), ...body }
      state.coupons.unshift(item)
      return createResponse(config, item)
    }

    if (path.match(/^\/admin\/coupons\/[^/]+$/) && method === 'GET') {
      const id = findByPathId(path)
      return createResponse(config, state.coupons.find((x) => x.id === id) || state.coupons[0])
    }

    if (path.match(/^\/admin\/coupons\/[^/]+$/) && method === 'PUT') {
      const id = findByPathId(path)
      const item = upsertById(state.coupons, id, body)
      return createResponse(config, item || true)
    }

    if (path.match(/^\/admin\/coupons\/[^/]+$/) && method === 'DELETE') {
      const id = findByPathId(path)
      removeById(state.coupons, id)
      return createResponse(config, null)
    }

    if (path.match(/^\/admin\/coupons\/[^/]+\/status$/) && method === 'PUT') {
      const id = path.split('/')[3]
      const item = upsertById(state.coupons, id, { status: body.status || 'inactive' })
      return createResponse(config, item || true)
    }

    // Feedback
    if (path === '/admin/feedback/evaluations' && method === 'GET') {
      const page = toNumber(query.page, 1)
      const pageSize = toNumber(query.pageSize, 10)
      const score = query.score ? toNumber(query.score, 0) : 0
      const list = score ? state.evaluations.filter((x) => Number(x.score) === score) : state.evaluations
      return createResponse(config, paginate(list, page, pageSize))
    }

    if (path.match(/^\/admin\/feedback\/evaluations\/[^/]+$/) && method === 'GET') {
      const id = findByPathId(path)
      return createResponse(config, state.evaluations.find((x) => x.id === id) || state.evaluations[0])
    }

    if (path === '/admin/feedback/complaints' && method === 'GET') {
      const page = toNumber(query.page, 1)
      const pageSize = toNumber(query.pageSize, 10)
      const status = (query.status || '').trim()
      const list = status ? state.complaints.filter((x) => x.status === status) : state.complaints
      return createResponse(config, paginate(list, page, pageSize))
    }

    if (path.match(/^\/admin\/feedback\/complaints\/[^/]+$/) && method === 'GET') {
      const id = findByPathId(path)
      return createResponse(config, state.complaints.find((x) => x.id === id) || state.complaints[0])
    }

    if (path.match(/^\/admin\/feedback\/complaints\/[^/]+\/status$/) && method === 'PUT') {
      const id = path.split('/')[4]
      const item = upsertById(state.complaints, id, { status: body.status || 'processing', note: body.note || '' })
      return createResponse(config, item || true)
    }

    // FAQ
    if (path === '/admin/faq/categories' && method === 'GET') {
      return createResponse(config, state.faqCategories)
    }

    if (path === '/admin/faq/categories' && method === 'POST') {
      const item = { id: nextId('faq_cat'), createdAt: now(), ...body }
      state.faqCategories.push(item)
      return createResponse(config, item)
    }

    if (path.match(/^\/admin\/faq\/categories\/[^/]+$/) && method === 'PUT') {
      const id = findByPathId(path)
      const idx = state.faqCategories.findIndex((x) => x.id === id)
      if (idx >= 0) state.faqCategories[idx] = { ...state.faqCategories[idx], ...body }
      return createResponse(config, state.faqCategories[idx] || true)
    }

    if (path.match(/^\/admin\/faq\/categories\/[^/]+$/) && method === 'DELETE') {
      const id = findByPathId(path)
      removeById(state.faqCategories, id)
      state.faqItems = state.faqItems.filter((x) => x.categoryId !== id)
      return createResponse(config, null)
    }

    if (path === '/admin/faq/items' && method === 'GET') {
      const page = toNumber(query.page, 1)
      const pageSize = toNumber(query.pageSize, 10)
      const categoryId = (query.categoryId || '').trim()
      const list = categoryId ? state.faqItems.filter((x) => x.categoryId === categoryId) : state.faqItems
      return createResponse(config, paginate(list, page, pageSize))
    }

    if (path === '/admin/faq/items' && method === 'POST') {
      const item = { id: nextId('faq_item'), createdAt: now(), ...body }
      state.faqItems.unshift(item)
      return createResponse(config, item)
    }

    if (path.match(/^\/admin\/faq\/items\/[^/]+$/) && method === 'GET') {
      const id = findByPathId(path)
      return createResponse(config, state.faqItems.find((x) => x.id === id) || state.faqItems[0])
    }

    if (path.match(/^\/admin\/faq\/items\/[^/]+$/) && method === 'PUT') {
      const id = findByPathId(path)
      const item = upsertById(state.faqItems, id, body)
      return createResponse(config, item || true)
    }

    if (path.match(/^\/admin\/faq\/items\/[^/]+$/) && method === 'DELETE') {
      const id = findByPathId(path)
      removeById(state.faqItems, id)
      return createResponse(config, null)
    }

    // Hotline
    if (path === '/admin/service/hotlines' && method === 'GET') {
      return createResponse(config, state.hotlineConfig)
    }

    if (path === '/admin/service/hotlines' && method === 'PUT') {
      state.hotlineConfig = { ...state.hotlineConfig, ...body }
      return createResponse(config, state.hotlineConfig)
    }

    if (path === '/admin/service/hotlines' && method === 'POST') {
      const item = { id: nextId('hotline'), sort: state.hotlineConfig.hotlines.length + 1, status: 'active', ...body }
      state.hotlineConfig.hotlines.push(item)
      return createResponse(config, item)
    }

    if (path.match(/^\/admin\/service\/hotlines\/[^/]+$/) && method === 'DELETE') {
      const id = findByPathId(path)
      state.hotlineConfig.hotlines = state.hotlineConfig.hotlines.filter((x: AnyObj) => x.id !== id)
      return createResponse(config, null)
    }

    // Center
    if (path === '/admin/centers/home' && method === 'GET') {
      return createResponse(config, state.centerHome)
    }

    if (path === '/admin/centers/home' && method === 'PUT') {
      state.centerHome = { ...state.centerHome, ...body }
      return createResponse(config, state.centerHome)
    }

    if (path === '/admin/centers/sections' && method === 'GET') {
      return createResponse(config, state.centerSections)
    }

    if (path === '/admin/centers/sections' && method === 'POST') {
      const item = { id: nextId('section'), createdAt: now(), updatedAt: now(), ...body }
      state.centerSections.unshift(item)
      return createResponse(config, item)
    }

    if (path.match(/^\/admin\/centers\/sections\/[^/]+$/) && method === 'GET') {
      const id = findByPathId(path)
      return createResponse(config, state.centerSections.find((x) => x.id === id) || state.centerSections[0])
    }

    if (path.match(/^\/admin\/centers\/sections\/[^/]+$/) && method === 'PUT') {
      const id = findByPathId(path)
      const item = upsertById(state.centerSections, id, body)
      return createResponse(config, item || true)
    }

    if (path.match(/^\/admin\/centers\/sections\/[^/]+$/) && method === 'DELETE') {
      const id = findByPathId(path)
      removeById(state.centerSections, id)
      return createResponse(config, null)
    }

    // Mock default for admin/analytics paths to avoid falling back to network in demo mode.
    if (path.startsWith('/admin') || path.startsWith('/analytics')) {
      console.warn(`[Mock Adapter] Default mock response for: ${method} ${path}`)
      return createResponse(config, null)
    }

    // Non-admin APIs: keep original behavior.
    if (originalAdapter) {
      if (typeof originalAdapter === 'function') return (originalAdapter as any)(config)
      if (Array.isArray(originalAdapter) && typeof originalAdapter[0] === 'function') return (originalAdapter[0] as any)(config)
    }

    return Promise.reject(new Error(`No mock adapter for ${rawUrl}`))
  }
}

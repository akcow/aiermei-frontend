import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import { tracker } from '@/utils/tracker'

const PAGE_VIEW_MIN_SECONDS = 3
const PAGE_VIEW_MAX_SECONDS = 3600

function getRoutePath(page) {
  if (!page || !page.route) return ''
  return `/${page.route}`
}

function getPageQuery(page) {
  if (!page) return {}
  return page.options || page.$page?.options || {}
}

function pickUtmFromQuery(query) {
  const result = {}
  const keys = ['utm_source', 'utm_medium', 'utm_campaign']
  for (const key of keys) {
    if (query[key]) {
      result[key] = String(query[key])
    }
  }
  return result
}

function buildPageSpecificMetadata(path, page, fromPath) {
  const query = getPageQuery(page)
  const utmFromQuery = pickUtmFromQuery(query)
  const utmFromStorage = tracker.getUtmParams()
  const metadata = {}

  if (fromPath) {
    metadata.fromPath = fromPath
  }

  if (path === '/pages/suite-details/index') {
    if (query.id) metadata.suiteId = String(query.id)
    metadata.viewType = 'page'
  } else if (path === '/pages/poster/detail') {
    if (query.id) metadata.posterId = String(query.id)
    Object.assign(metadata, utmFromStorage, utmFromQuery)
  } else if (path === '/pages/content/index') {
    metadata.viewType = 'content'
  } else if (path === '/pages/center/detail') {
    if (query.id) metadata.sectionId = String(query.id)
    if (query.title) metadata.sectionTitle = String(query.title)
  } else if (path === '/pages/center/index') {
    Object.assign(metadata, utmFromStorage, utmFromQuery)
  } else if (path === '/pages/member/magazine') {
    if (query.id) metadata.magazineId = String(query.id)
    if (query.topic) metadata.topic = String(query.topic)
  }

  return metadata
}

function reportPageView(vm) {
  const path = vm.__analyticsPath
  const enterAt = vm.__analyticsEnterAt
  if (!path || !enterAt) return

  vm.__analyticsEnterAt = 0

  const elapsed = Math.floor((Date.now() - enterAt) / 1000)
  if (elapsed < PAGE_VIEW_MIN_SECONDS) return

  const durationSeconds = Math.min(elapsed, PAGE_VIEW_MAX_SECONDS)
  tracker.track('PAGE_VIEW', {
    path,
    pathName: vm.__analyticsPathName || tracker.getPathName(path),
    durationSeconds,
    metadata: vm.__analyticsPageMetadata || {}
  })
}

export function createApp() {
  const app = createSSRApp(App)

  app.mixin({
    onShow() {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const previousPage = pages.length > 1 ? pages[pages.length - 2] : null
      if (currentPage && currentPage.route) {
        const path = getRoutePath(currentPage)
        this.__analyticsPath = path
        this.__analyticsPathName = tracker.getPathName(path)
        this.__analyticsPageMetadata = buildPageSpecificMetadata(path, currentPage, getRoutePath(previousPage))
        this.__analyticsEnterAt = Date.now()
      }
    },
    onHide() {
      reportPageView(this)
    },
    onUnload() {
      reportPageView(this)
    }
  })

  return {
    app
  }
}
// #endif

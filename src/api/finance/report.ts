import request from '@/utils/request'

export function listPeriodOptions() {
  return request({ url: '/finance/period/list', method: 'get', params: { pageNum: 1, pageSize: 100 } })
}

export function subjectBalance(periodCode: string) {
  return request({ url: '/finance/report/subjectBalance', method: 'get', params: { periodCode } })
}
export function incomeStatement(periodCode: string) {
  return request({ url: '/finance/report/incomeStatement', method: 'get', params: { periodCode } })
}
export function balanceSheet(periodCode: string) {
  return request({ url: '/finance/report/balanceSheet', method: 'get', params: { periodCode } })
}
export function ledgerPerformance(startDate?: string, endDate?: string) {
  return request({ url: '/finance/report/ledgerPerformance', method: 'get', params: { startDate, endDate } })
}
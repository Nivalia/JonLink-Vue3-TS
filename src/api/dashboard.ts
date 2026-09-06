import request from '@/utils/request'
import type { AjaxResult } from '@/types'

// ============================================================
// 统一首页看板 · 聚合 ledger / wx / finance 多个业务域
// ============================================================

// ─── 指挥中心 (CommandCenter) ────────────────────────────────

/** 公众号总览统计 (今日/本月维度) */
export interface MpStat {
  fans: number; fans_active: number; fans_today: number; fans_month: number
  verify_today: number; verify_amount_today: number; verify_amount_month: number
  points_today: number; points_total: number
  msg_today: number; msg_failed_today: number; msg_pending_today: number
  msg_sent_total: number; msg_failed_total: number
  scan_today: number; scan_total: number
  profit_month: number
}
export function getMpStat(): Promise<AjaxResult<MpStat>> {
  return request({ url: '/wx/dashboard/mpStat', method: 'get' })
}

/** 区县粉丝 TOP */
export interface TopDistrict { name: string; cnt: number }
export function getTopDistrict(limit = 5): Promise<AjaxResult<TopDistrict[]>> {
  return request({ url: '/wx/dashboard/topDistrict', method: 'get', params: { limit } })
}

/** 台账保费/利润趋势 (按日期聚合, 近 N 天) */
export interface LedgerTrend { d: string; premium: number; profit: number; cnt: number }
export function getLedgerTrend(days = 14): Promise<AjaxResult<LedgerTrend[]>> {
  return request({ url: '/wx/dashboard/ledgerTrend', method: 'get', params: { days } })
}

/** 险种/类型分布 */
export interface TypeDist { type: string; cnt: number; amt: number }
export function getTypeDist(): Promise<AjaxResult<TypeDist[]>> {
  return request({ url: '/wx/dashboard/typeDist', method: 'get' })
}

/** 待办提醒 */
export interface DashboardTodos {
  push_failed_today: number; push_pending: number; push_expired: number
  settle_up_pending: number; settle_down_pending: number
  order_unverified: number; scan_24h: number
}
export function getDashboardTodos(): Promise<AjaxResult<DashboardTodos>> {
  return request({ url: '/wx/dashboard/todos', method: 'get' })
}

/** 最近流水 */
export interface RecentFlow {
  ledger_no: string; type: string; phone: string; openid: string
  amount: number; points: number; direction: string
  status: string; occurred_time: string; biz_user: string; remark: string
}
export function getRecentFlows(limit = 6): Promise<AjaxResult<RecentFlow[]>> {
  return request({ url: '/wx/dashboard/recentFlows', method: 'get', params: { limit } })
}

/** 扫码动态 */
export interface ScanLog {
  id: number; scene_id: number; biz_type: string; scene_str: string
  openid: string; is_new_follow: string; scan_time: string
  nickname: string; city: string
}
export function getScanLogs(limit = 6): Promise<AjaxResult<ScanLog[]>> {
  return request({ url: '/wx/dashboard/scanLogs', method: 'get', params: { limit } })
}

/** 系统公告 */
export interface SysNotice { id: number; title: string; type: string; create_time: string }
export function getDashboardNotice(limit = 3): Promise<AjaxResult<SysNotice[]>> {
  return request({ url: '/wx/dashboard/notice', method: 'get', params: { limit } })
}

// ─── 业务数据 (BizData) ──────────────────────────────────────

/** 业务 KPI 汇总 */
export interface DashboardKpi {
  productCount: number; productActive: number
  channelCount: number; channelActive: number
  salesmanCount: number; salesmanActive: number
  totalPremium: number; totalProfit: number; totalPolicy: number
  unsettledPremium: number; unsettledUpPremium: number; unsettledDownPremium: number
}
export function getDashboardKpi(): Promise<AjaxResult<DashboardKpi>> {
  return request({ url: '/ledger/dashboard/kpi', method: 'get' })
}

/** 保费/利润趋势 (按天聚合) */
export interface TrendPoint { d: string; premium: number; profit: number; cnt: number }
export function getPremiumTrend(days = 30): Promise<AjaxResult<TrendPoint[]>> {
  return request({ url: '/ledger/dashboard/premiumTrend', method: 'get', params: { days } })
}

/** 保险公司占比 */
export interface CompanyShare { name: string; value: number }
export function getCompanyShare(): Promise<AjaxResult<CompanyShare[]>> {
  return request({ url: '/ledger/dashboard/companyShare', method: 'get' })
}

/** 渠道贡献 TOP N */
export interface ChannelTop { name: string; premium: number; cnt: number; profit: number }
export function getChannelTop(limit = 10): Promise<AjaxResult<ChannelTop[]>> {
  return request({ url: '/ledger/dashboard/channelTop', method: 'get', params: { limit } })
}

/** 产品矩阵 (4 维) */
export interface ProductDistribution {
  shelf: { name: string; value: number }[]
  policy: { name: string; value: number }[]
  tax: { name: string; value: number }[]
  company: { name: string; value: number }[]
}
export function getProductDistribution(): Promise<AjaxResult<ProductDistribution>> {
  return request({ url: '/ledger/dashboard/productDistribution', method: 'get' })
}

/** 业务员 TOP N (按保费) */
export interface SalesmanTop { name: string; premium: number; profit: number }
export function getSalesmanTop(limit = 10): Promise<AjaxResult<SalesmanTop[]>> {
  return request({ url: '/ledger/dashboard/salesmanTop', method: 'get', params: { limit } })
}

/** 最近 N 条台账 */
export interface RecentLedger {
  id: number; policy_no: string; product_name: string; insurance_company: string
  up_channel: string; applicant: string; insured: string
  premium: number; profit: number; ledger_date: string
  up_status: string; down_status: string
}
export function getRecentLedger(limit = 6): Promise<AjaxResult<RecentLedger[]>> {
  return request({ url: '/ledger/dashboard/recentLedger', method: 'get', params: { limit } })
}

// ─── 财务总览 (FinanceOverview) ──────────────────────────────

/** 佣金汇总 (本月) */
export interface CommissionSummary {
  total_commission: number; total_premium: number; avg_rate: number
}
export function getCommissionSummary(): Promise<AjaxResult<CommissionSummary>> {
  return request({ url: '/ledger/dashboard/commissionSummary', method: 'get' })
}

/** 佣金月度趋势 (近12个月) */
export interface CommissionTrend { m: string; commission: number; premium: number; rate: number }
export function getCommissionTrend(): Promise<AjaxResult<CommissionTrend[]>> {
  return request({ url: '/ledger/dashboard/commissionTrend', method: 'get' })
}

/** 税费分布 */
export interface TaxBreakdown { name: string; value: number }
export function getTaxBreakdown(): Promise<AjaxResult<TaxBreakdown[]>> {
  return request({ url: '/ledger/dashboard/taxBreakdown', method: 'get' })
}

/** 发票统计 */
export interface InvoiceStats {
  total_count: number; total_amount: number
  issued_count: number; issued_amount: number
}
export function getInvoiceStats(): Promise<AjaxResult<InvoiceStats>> {
  return request({ url: '/ledger/dashboard/invoiceStats', method: 'get' })
}

/** 科目余额 TOP10 */
export interface SubjectBalance { name: string; debit: number; credit: number; value: number }
export function getSubjectBalanceTop10(limit = 10): Promise<AjaxResult<SubjectBalance[]>> {
  return request({ url: '/ledger/dashboard/subjectBalanceTop10', method: 'get', params: { limit } })
}

/** 退保率统计 */
export interface SurrenderRate {
  total_policy: number; surrender_count: number
  total_premium: number; surrender_premium: number
  surrender_rate_count: number; surrender_rate_premium: number
}
export function getSurrenderRate(): Promise<AjaxResult<SurrenderRate>> {
  return request({ url: '/ledger/dashboard/surrenderRate', method: 'get' })
}

/** 公众号运营指标 */
export interface MpOperationStats {
  fans: number; fans_month: number; scan_today: number
  msg_sent: number; msg_total: number
  scan_new_follow: number; scan_total: number
}
export function getMpOperationStats(): Promise<AjaxResult<MpOperationStats>> {
  return request({ url: '/ledger/dashboard/mpOperationStats', method: 'get' })
}

/** 险种分布（按台账保费） */
export function getInsuranceTypeDist(): Promise<AjaxResult<{ name: string; value: number }[]>> {
  return request({ url: '/ledger/dashboard/insuranceTypeDist', method: 'get' })
}

/** 续保率统计 */
export interface RenewalRate {
  total_unique_policies: number; renewal_policies: number; renewal_rate: number
}
export function getRenewalRate(): Promise<AjaxResult<RenewalRate>> {
  return request({ url: '/ledger/dashboard/renewalRate', method: 'get' })
}

/** 活跃度统计 */
export interface ActivityRate {
  total_products: number; active_products: number; activity_rate: number
}
export function getActivityRate(): Promise<AjaxResult<ActivityRate>> {
  return request({ url: '/ledger/dashboard/activityRate', method: 'get' })
}

/** 按险别分布（产品） */
export function getProductByType(): Promise<AjaxResult<{ name: string; value: number }[]>> {
  return request({ url: '/ledger/dashboard/productByType', method: 'get' })
}

// ─── 公众号大屏 (MpScreen) ───────────────────────────────────

/** 流水趋势 (近 N 天) */
export interface FlowTrend { d: string; cnt: number; amt_in: number; amt_out: number; pts: number }
export function getFlowTrend(days = 30): Promise<AjaxResult<FlowTrend[]>> {
  return request({ url: '/wx/dashboard/flowTrend', method: 'get', params: { days } })
}

/** 粉丝来源统计 */
export interface FanSource { name: string; cnt: number }
export function getFanSource(): Promise<AjaxResult<FanSource[]>> {
  return request({ url: '/wx/dashboard/fanSource', method: 'get' })
}

/** 用户画像 (性别) */
export interface UserPortrait { male: number; female: number; unknown: number }
export function getUserPortrait(): Promise<AjaxResult<UserPortrait>> {
  return request({ url: '/wx/dashboard/userPortrait', method: 'get' })
}

/** 公众号矩阵 */
export interface MpMatrix {
  id: number; app_name: string; app_id: string
  status_name: string; status: string; create_date: string
}
export function getMpMatrix(): Promise<AjaxResult<MpMatrix[]>> {
  return request({ url: '/wx/dashboard/mpMatrix', method: 'get' })
}

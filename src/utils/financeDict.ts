/**
 * 财务系统字典映射（前端硬编码）
 *
 * 使用: import { finDict, finDictItem } from '@/utils/financeDict'
 *       finDict(row.status, 'fin_voucher_status')
 *       finDictItem(row.status, 'fin_voucher_status').type
 */

export type DictMap = Record<string, { label: string; tag?: 'success'|'info'|'warning'|'danger'|'primary' }>

export const FIN_DICTS: Record<string, DictMap> = {
  // ========== 凭证 ==========
  voucher_status: {
    '0': { label: '草稿', tag: 'info' },
    '1': { label: '已审核', tag: 'warning' },
    '2': { label: '已过账', tag: 'success' },
    '3': { label: '已作废', tag: 'danger' }
  },
  fin_voucher_status: {
    '0': { label: '草稿', tag: 'info' },
    '1': { label: '已审核', tag: 'warning' },
    '2': { label: '已过账', tag: 'success' },
    '3': { label: '已作废', tag: 'danger' }
  },
  voucher_source: {
    manual: { label: '手工录入', tag: 'info' },
    ledger_book: { label: '台账记账', tag: 'primary' },
    settle_up: { label: '上游结算记账', tag: 'primary' },
    settle_down: { label: '下游结算记账', tag: 'primary' },
    receipt: { label: '收款记账', tag: 'success' },
    payment: { label: '付款记账', tag: 'warning' },
    expense: { label: '报销记账', tag: 'warning' },
    period_close: { label: '期末结转', tag: 'info' }
  },

  // ========== 通用 ==========
  common_status: {
    '0': { label: '停用', tag: 'danger' },
    '1': { label: '启用', tag: 'success' }
  },
  yes_no: {
    '0': { label: '否', tag: 'info' },
    '1': { label: '是', tag: 'success' }
  },

  // ========== 科目 ==========
  balance_direction: {
    '0': { label: '借', tag: 'info' },
    '1': { label: '贷', tag: 'info' }
  },
  fin_balance_direction: {
    '0': { label: '借方', tag: 'info' },
    '1': { label: '贷方', tag: 'info' }
  },
  subject_type: {
    '1': { label: '资产', tag: 'primary' },
    '2': { label: '负债', tag: 'warning' },
    '3': { label: '权益', tag: 'success' },
    '4': { label: '成本', tag: 'info' },
    '5': { label: '损益', tag: 'danger' }
  },

  // ========== 期间 ==========
  period_status: {
    '0': { label: '未结账', tag: 'info' },
    '1': { label: '已结账', tag: 'success' }
  },

  // ========== 收支方向 ==========
  fin_direction: {
    '0': { label: '收入', tag: 'success' },
    '1': { label: '支出', tag: 'warning' }
  },

  // ========== 往来单位 ==========
  fin_partner_type: {
    '0': { label: '客户', tag: 'primary' },
    '1': { label: '上游', tag: 'warning' },
    '2': { label: '下游', tag: 'success' }
  },
  partner_type: {
    '0': { label: '客户', tag: 'primary' },
    '1': { label: '上游', tag: 'warning' },
    '2': { label: '下游', tag: 'success' }
  },

  // ========== 应收/应付 ==========
  receivable_payable_status: {
    '0': { label: '未结清', tag: 'warning' },
    '1': { label: '部分结清', tag: 'primary' },
    '2': { label: '已结清', tag: 'success' }
  },
  fin_receivable_status: {
    '0': { label: '未收/付', tag: 'warning' },
    '1': { label: '部分收/付', tag: 'primary' },
    '2': { label: '已收/付', tag: 'success' },
    '3': { label: '作废', tag: 'info' }
  },

  // ========== 收款/付款 ==========
  receipt_payment_status: {
    '0': { label: '草稿', tag: 'info' },
    '1': { label: '已确认', tag: 'success' }
  },
  receipt_biz_type: {
    CUSTOMER_PREMIUM: { label: '客户保费', tag: 'primary' },
    CUSTOMER_RECEIPT: { label: '客户收款', tag: 'success' },
    DOWN_COMMISSION_PAY: { label: '下游佣金支付', tag: 'warning' },
    UP_COMMISSION_PAY: { label: '上游佣金支付', tag: 'warning' },
    RECEIPT: { label: '收款', tag: 'success' },
    PAYMENT: { label: '付款', tag: 'warning' }
  },

  // ========== 资金流水 ==========
  cash_flow_biz_type: {
    CUSTOMER_RECEIPT: { label: '客户收款', tag: 'success' },
    UPSTREAM_RECEIPT: { label: '上游结算收款', tag: 'success' },
    DOWN_COMMISSION_PAY: { label: '下游佣金支付', tag: 'warning' },
    UP_COMMISSION_PAY: { label: '上游佣金支付', tag: 'warning' },
    DOWN_COMMISSION_RECEIPT: { label: '下游佣金收款', tag: 'success' },
    SETTLE_UP: { label: '上游结算', tag: 'primary' },
    SETTLE_DOWN: { label: '下游结算', tag: 'primary' },
    EXPENSE_REIMBURSE: { label: '费用报销', tag: 'info' },
    INVOICE_PAY: { label: '发票付款', tag: 'warning' },
    TRANSFER_IN: { label: '转入', tag: 'success' },
    TRANSFER_OUT: { label: '转出', tag: 'warning' },
    ADJUST_IN: { label: '调增', tag: 'success' },
    ADJUST_OUT: { label: '调减', tag: 'warning' }
  },
  cash_flow_direction: {
    '0': { label: '流出', tag: 'warning' },
    '1': { label: '流入', tag: 'success' }
  },

  // ========== 结算 ==========
  fin_settle_status: {
    '0': { label: '待结算', tag: 'info' },
    '1': { label: '已确认', tag: 'warning' },
    '2': { label: '已支付', tag: 'success' },
    '3': { label: '已对账', tag: 'primary' }
  },
  settle_status: {
    '0': { label: '未结', tag: 'warning' },
    '1': { label: '已结', tag: 'success' }
  },

  // ========== 台账 ==========
  fin_book_status: {
    '0': { label: '草稿', tag: 'info' },
    '1': { label: '已审核', tag: 'warning' },
    '2': { label: '已过账', tag: 'success' },
    '3': { label: '已作废', tag: 'danger' }
  },
  ledger_log_status: {
    '1': { label: '有效', tag: 'success' },
    '0': { label: '已反记账', tag: 'danger' }
  },
  fin_book_type: {
    '0': { label: '台账记账', tag: 'primary' },
    '1': { label: '上游结算', tag: 'warning' },
    '2': { label: '下游结算', tag: 'success' },
    '3': { label: '客户收款', tag: 'info' },
    '4': { label: '费用报销', tag: 'danger' }
  },
  ledger_book_type: {
    '0': { label: '台账记账', tag: 'primary' },
    '1': { label: '上游结算记账', tag: 'primary' },
    '2': { label: '下游结算记账', tag: 'primary' },
    '3': { label: '收款记账', tag: 'success' },
    '4': { label: '报销记账', tag: 'warning' }
  },

  // ========== 银行对账 ==========
  fin_bank_status: {
    '0': { label: '未对账', tag: 'info' },
    '1': { label: '已对账', tag: 'success' },
    '2': { label: '已调节', tag: 'warning' }
  },

  // ========== 发票 ==========
  invoice_type: {
    '0': { label: '增值税专票', tag: 'primary' },
    '1': { label: '普通发票', tag: 'info' }
  },
  invoice_direction: {
    '0': { label: '进项', tag: 'success' },
    '1': { label: '销项', tag: 'warning' }
  },
  invoice_settle: {
    '0': { label: '未核销', tag: 'warning' },
    '1': { label: '已核销', tag: 'success' }
  },

  // ========== 分配 ==========
  allocation_type: {
    '0': { label: '应收', tag: 'success' },
    '1': { label: '应付', tag: 'warning' }
  },

  // ========== 报销 ==========
  expense_type: {
    '0': { label: '日常报销', tag: 'info' },
    '1': { label: '差旅报销', tag: 'warning' }
  },
  expense_status: {
    '0': { label: '草稿', tag: 'info' },
    '1': { label: '待审', tag: 'warning' },
    '2': { label: '已审', tag: 'success' },
    '3': { label: '已付款', tag: 'primary' },
    '4': { label: '驳回', tag: 'danger' }
  },

  // ========== 含税 ==========
  fin_tax_flag: {
    '0': { label: '否', tag: 'info' },
    '1': { label: '是', tag: 'success' }
  },

  // ========== 收入确认 ==========
  fin_revenue_status: {
    '0': { label: '未确认', tag: 'info' },
    '1': { label: '已确认', tag: 'success' },
    '2': { label: '已反确认', tag: 'warning' }
  },

  // ========== 电子台账方向 ==========
  wx_ledger_direction: {
    '0': { label: '流出', tag: 'warning' },
    '1': { label: '流入', tag: 'success' },
    '2': { label: '中性', tag: 'info' }
  },

  // ========== H5支付 ==========
  wx_pay_status: {
    '0': { label: '待支付', tag: 'warning' },
    '1': { label: '已支付', tag: 'success' },
    '2': { label: '已核销', tag: 'primary' },
    '3': { label: '已退款', tag: 'danger' }
  }
}

/**
 * 把数据库值翻译成中文 label
 */
export function finDict(value: any, dictKey: string): string {
  if (value === null || value === undefined || value === '') return ''
  const map = FIN_DICTS[dictKey]
  if (!map) return String(value)
  const item = map[String(value)]
  return item ? item.label : String(value)
}

/**
 * 返回 el-tag 渲染所需的信息
 */
export function finDictItem(value: any, dictKey: string): { label: string; type?: string } {
  if (value === null || value === undefined || value === '') return { label: '' }
  const map = FIN_DICTS[dictKey]
  if (!map) return { label: String(value) }
  const item = map[String(value)]
  return item ? { label: item.label, type: item.tag } : { label: String(value) }
}

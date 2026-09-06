import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, VoucherQuejlParams, FinVoucher, FinVoucherEntry } from '@/types'

// ===== 列表 / 头查询 =====
export function listVoucher(query: VoucherQuejlParams): Promise<TableDataInfo<FinVoucher[]>> {
  return request({
    url: '/finance/voucher/list',
    method: 'get',
    params: query
  })
}

export function getVoucher(id: number): Promise<AjaxResult<FinVoucher>> {
  return request({ url: '/finance/voucher/' + id, method: 'get' })
}

/** 完整查询(含分录),用于详情/打印 */
export function getFullVoucher(id: number): Promise<AjaxResult<{ voucher: FinVoucher, entries: FinVoucherEntry[] }>> {
  return request({ url: '/finance/voucher/full/' + id, method: 'get' })
}

/** 生成下一凭证号(供前端展示) */
export function nextVoucherNo(periodCode: string): Promise<AjaxResult<string>> {
  return request({ url: '/finance/voucher/nextNo/' + periodCode, method: 'get' })
}

// ===== 录入 / 修改 / 删除 =====
export function addVoucher(data: FinVoucher): Promise<AjaxResult<number>> {
  return request({ url: '/finance/voucher', method: 'post', data })
}

export function updateVoucher(data: FinVoucher): Promise<AjaxResult<number>> {
  return request({ url: '/finance/voucher', method: 'put', data })
}

export function delVoucher(id: number | number[]): Promise<AjaxResult> {
  return request({ url: '/finance/voucher/' + id, method: 'delete' })
}

// ===== M1 状态机 =====
export function auditVoucher(id: number): Promise<AjaxResult> {
  return request({ url: '/finance/voucher/' + id + '/audit', method: 'post' })
}

export function cancelAuditVoucher(id: number): Promise<AjaxResult> {
  return request({ url: '/finance/voucher/' + id + '/cancelAudit', method: 'post' })
}

export function postVoucher(id: number): Promise<AjaxResult> {
  return request({ url: '/finance/voucher/' + id + '/post', method: 'post' })
}

export function unpostVoucher(id: number): Promise<AjaxResult> {
  return request({ url: '/finance/voucher/' + id + '/unpost', method: 'post' })
}

export function voidVoucher(id: number, reason?: string): Promise<AjaxResult> {
  return request({ url: '/finance/voucher/' + id + '/void', method: 'post', data: { reason } })
}
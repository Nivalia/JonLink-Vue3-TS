import request from '@/utils/request'
import type { AjaxResult, TableDataInfo } from '@/types'

export function listBankAccount(): Promise<AjaxResult<any[]>> {
  return request({ url: '/finance/account/list', method: 'get' })
}

export function listBankTransaction(query: any): Promise<TableDataInfo<any[]>> {
  return request({ url: '/finance/bank-reconcile/list', method: 'get', params: query })
}

export function importBankStatement(bankAccountId: number, data: any[]): Promise<AjaxResult<number>> {
  return request({ url: '/finance/bank-reconcile/import/' + bankAccountId, method: 'post', data })
}

export function matchBankTransaction(reconcileId: number, cashFlowId: number): Promise<AjaxResult> {
  return request({ url: '/finance/bank-reconcile/reconcile/' + reconcileId + '/' + cashFlowId, method: 'post' })
}

export function listSystemTransaction(bankAccountId: number): Promise<AjaxResult<any>> {
  return request({ url: '/finance/bank-reconcile/unmatched/' + bankAccountId, method: 'get' })
}

export function getReconcileSummary(bankAccountId: number): Promise<AjaxResult<any>> {
  return request({ url: '/finance/bank-reconcile/unmatched/' + bankAccountId, method: 'get' })
}

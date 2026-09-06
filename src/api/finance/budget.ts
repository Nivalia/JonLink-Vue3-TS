import request from '@/utils/request'
import type { AjaxResult, TableDataInfo } from '@/types'

export function listBudget(query: any): Promise<TableDataInfo<any[]>> {
  return request({ url: '/finance/budget/list', method: 'get', params: query })
}

export function addBudget(data: any): Promise<AjaxResult<number>> {
  return request({ url: '/finance/budget', method: 'post', data })
}

export function updateBudget(data: any): Promise<AjaxResult> {
  return request({ url: '/finance/budget', method: 'put', data })
}

export function delBudget(id: number): Promise<AjaxResult> {
  return request({ url: '/finance/budget/' + id, method: 'delete' })
}

export function approveBudget(id: number): Promise<AjaxResult> {
  return request({ url: '/finance/budget/approve/' + id, method: 'post' })
}

export function getBudgetExecution(periodCode: string): Promise<AjaxResult<any>> {
  return request({ url: '/finance/budget/execution/' + periodCode, method: 'get' })
}

export function adjustBudget(data: any): Promise<AjaxResult> {
  return request({ url: '/finance/budget/adjust', method: 'post', data })
}

export function checkBudget(data: any): Promise<AjaxResult> {
  return request({ url: '/finance/budget/check', method: 'post', data })
}
import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, ExpenseQuejlParams, FinExpense } from '@/types'

// 查询费用报销单列表
export function listExpense(query: ExpenseQuejlParams): Promise<TableDataInfo<FinExpense[]>> {
  return request({
    url: '/finance/expense/list',
    method: 'get',
    params: query
  })
}

// 查询费用报销单详细
export function getExpense(id: number): Promise<AjaxResult<FinExpense>> {
  return request({
    url: '/finance/expense/' + id,
    method: 'get'
  })
}

// 新增费用报销单
export function addExpense(data: FinExpense): Promise<AjaxResult> {
  return request({
    url: '/finance/expense',
    method: 'post',
    data: data
  })
}

// 修改费用报销单
export function updateExpense(data: FinExpense): Promise<AjaxResult> {
  return request({
    url: '/finance/expense',
    method: 'put',
    data: data
  })
}

// 删除费用报销单
export function delExpense(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/finance/expense/' + id,
    method: 'delete'
  })
}

// 新增报销单 (带明细, M6)
export function addExpenseWithItems(data: any): Promise<AjaxResult> {
  return request({
    url: '/finance/expense/withItems',
    method: 'post',
    data: data
  })
}



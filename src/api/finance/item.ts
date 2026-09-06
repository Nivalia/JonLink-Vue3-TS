import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, ItemQuejlParams, FinExpenseItem } from '@/types'

// 查询报销明细列表
export function listItem(query: ItemQuejlParams): Promise<TableDataInfo<FinExpenseItem[]>> {
  return request({
    url: '/finance/item/list',
    method: 'get',
    params: query
  })
}

// 查询报销明细详细
export function getItem(id: number): Promise<AjaxResult<FinExpenseItem>> {
  return request({
    url: '/finance/item/' + id,
    method: 'get'
  })
}

// 新增报销明细
export function addItem(data: FinExpenseItem): Promise<AjaxResult> {
  return request({
    url: '/finance/item',
    method: 'post',
    data: data
  })
}

// 修改报销明细
export function updateItem(data: FinExpenseItem): Promise<AjaxResult> {
  return request({
    url: '/finance/item',
    method: 'put',
    data: data
  })
}

// 删除报销明细
export function delItem(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/finance/item/' + id,
    method: 'delete'
  })
}



import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, ReceiptQuejlParams, FinReceipt } from '@/types'

// 查询收款单列表
export function listReceipt(query: ReceiptQuejlParams): Promise<TableDataInfo<FinReceipt[]>> {
  return request({
    url: '/finance/receipt/list',
    method: 'get',
    params: query
  })
}

// 查询收款单详细
export function getReceipt(id: number): Promise<AjaxResult<FinReceipt>> {
  return request({
    url: '/finance/receipt/' + id,
    method: 'get'
  })
}

// 新增收款单
export function addReceipt(data: FinReceipt): Promise<AjaxResult> {
  return request({
    url: '/finance/receipt',
    method: 'post',
    data: data
  })
}

// 修改收款单
export function updateReceipt(data: FinReceipt): Promise<AjaxResult> {
  return request({
    url: '/finance/receipt',
    method: 'put',
    data: data
  })
}

// 删除收款单
export function delReceipt(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/finance/receipt/' + id,
    method: 'delete'
  })
}



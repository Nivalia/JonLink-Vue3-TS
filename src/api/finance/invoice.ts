import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, InvoiceQuejlParams, FinInvoice } from '@/types'

// 查询发票列表
export function listInvoice(query: InvoiceQuejlParams): Promise<TableDataInfo<FinInvoice[]>> {
  return request({
    url: '/finance/invoice/list',
    method: 'get',
    params: query
  })
}

// 查询发票详细
export function getInvoice(id: number): Promise<AjaxResult<FinInvoice>> {
  return request({
    url: '/finance/invoice/' + id,
    method: 'get'
  })
}

// 新增发票
export function addInvoice(data: FinInvoice): Promise<AjaxResult> {
  return request({
    url: '/finance/invoice',
    method: 'post',
    data: data
  })
}

// 修改发票
export function updateInvoice(data: FinInvoice): Promise<AjaxResult> {
  return request({
    url: '/finance/invoice',
    method: 'put',
    data: data
  })
}

// 删除发票
export function delInvoice(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/finance/invoice/' + id,
    method: 'delete'
  })
}

// 核验发票 (M6)
export function verifyInvoice(id: number): Promise<AjaxResult> {
  return request({
    url: '/finance/invoice/verify/' + id,
    method: 'post'
  })
}



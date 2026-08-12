import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, ProductQuejlParams, JonlinkProduct } from '@/types'

// 查询产品管理列表
export function listProduct(query: ProductQuejlParams): Promise<TableDataInfo<JonlinkProduct[]>> {
  return request({
    url: '/ledger/product/list',
    method: 'get',
    params: query
  })
}

// 查询产品管理详细
export function getProduct(id: number): Promise<AjaxResult<JonlinkProduct>> {
  return request({
    url: '/ledger/product/' + id,
    method: 'get'
  })
}

// 新增产品管理
export function addProduct(data: JonlinkProduct): Promise<AjaxResult> {
  return request({
    url: '/ledger/product',
    method: 'post',
    data: data
  })
}

// 修改产品管理
export function updateProduct(data: JonlinkProduct): Promise<AjaxResult> {
  return request({
    url: '/ledger/product',
    method: 'put',
    data: data
  })
}

// 删除产品管理
export function delProduct(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/ledger/product/' + id,
    method: 'delete'
  })
}



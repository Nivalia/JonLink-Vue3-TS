import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, OrderQuejlParams, WxBizOrder } from '@/types'

// 查询核销管理列表
export function listOrder(query: OrderQuejlParams): Promise<TableDataInfo<WxBizOrder[]>> {
  return request({
    url: '/wx/order/list',
    method: 'get',
    params: query
  })
}

// 查询核销管理详细
export function getOrder(id: number): Promise<AjaxResult<WxBizOrder>> {
  return request({
    url: '/wx/order/' + id,
    method: 'get'
  })
}

// 新增核销管理
export function addOrder(data: WxBizOrder): Promise<AjaxResult> {
  return request({
    url: '/wx/order',
    method: 'post',
    data: data
  })
}

// 修改核销管理
export function updateOrder(data: WxBizOrder): Promise<AjaxResult> {
  return request({
    url: '/wx/order',
    method: 'put',
    data: data
  })
}

// 删除核销管理
export function delOrder(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/wx/order/' + id,
    method: 'delete'
  })
}

// 订单核销 (R5 三要素幂等: orderNo + phone/carNo/amount)
export function verifyOrder(data: { orderNo: string; phone?: string; carNo?: string; amount?: number }): Promise<AjaxResult> {
  return request({
    url: '/wx/mp/verify',
    method: 'post',
    data: data
  })
}

// 模板下载 / 失败清单导出 — 走 axios (自动带 Bearer token),不用 window.open (window.open 新 tab 不带 auth 头 → 后端 401)
export function downloadImportTemplate(): Promise<BlobPart> {
  return request({
    url: '/wx/order/importTemplate',
    method: 'get',
    responseType: 'blob'
  })
}

export function downloadFailList(rowsJson: string): Promise<BlobPart> {
  return request({
    url: '/wx/order/exportFailList',
    method: 'get',
    params: { rowsJson },
    responseType: 'blob'
  })
}
export function listSyncCandidates(params: { startDate?: string; endDate?: string }): Promise<AjaxResult<any[]>> {
  return request({
    url: '/wx/order/syncCandidates',
    method: 'get',
    params
  })
}

// 一键同步台账到订单 (source_type=2)
export function syncFromLedger(ledgerIds: number[]): Promise<AjaxResult> {
  return request({
    url: '/wx/order/syncFromLedger',
    method: 'post',
    data: { ledgerIds }
  })
}

// Excel 导入
export function importOrderExcel(file: File): Promise<AjaxResult> {
  const form = new FormData()
  form.append('file', file)
  return request({
    url: '/wx/order/importExcel',
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: form
  })
}



import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, QrScanLogQuejlParams, WxQrScanLog } from '@/types'

// 查询扫码日志列表
export function listQrScanLog(query: QrScanLogQuejlParams): Promise<TableDataInfo<WxQrScanLog[]>> {
  return request({
    url: '/wx/qrScanLog/list',
    method: 'get',
    params: query
  })
}

// 查询扫码日志详细
export function getQrScanLog(id: number): Promise<AjaxResult<WxQrScanLog>> {
  return request({
    url: '/wx/qrScanLog/' + id,
    method: 'get'
  })
}

// 新增扫码日志
export function addQrScanLog(data: WxQrScanLog): Promise<AjaxResult> {
  return request({
    url: '/wx/qrScanLog',
    method: 'post',
    data: data
  })
}

// 修改扫码日志
export function updateQrScanLog(data: WxQrScanLog): Promise<AjaxResult> {
  return request({
    url: '/wx/qrScanLog',
    method: 'put',
    data: data
  })
}

// 删除扫码日志
export function delQrScanLog(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/wx/qrScanLog/' + id,
    method: 'delete'
  })
}



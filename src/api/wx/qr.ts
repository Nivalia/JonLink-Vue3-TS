import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, QrQuejlParams, WxQrScene } from '@/types'

// 查询二维码管理列表
export function listQr(query: QrQuejlParams): Promise<TableDataInfo<WxQrScene[]>> {
  return request({
    url: '/wx/qr/list',
    method: 'get',
    params: query
  })
}

// 查询二维码管理详细
export function getQr(id: number): Promise<AjaxResult<WxQrScene>> {
  return request({
    url: '/wx/qr/' + id,
    method: 'get'
  })
}

// 新增二维码管理
export function addQr(data: WxQrScene): Promise<AjaxResult> {
  return request({
    url: '/wx/qr',
    method: 'post',
    data: data
  })
}

// 修改二维码管理
export function updateQr(data: WxQrScene): Promise<AjaxResult> {
  return request({
    url: '/wx/qr',
    method: 'put',
    data: data
  })
}

// 删除二维码管理
export function delQr(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/wx/qr/' + id,
    method: 'delete'
  })
}



import request from '@/utils/request'
import type { AjaxResult, TableDataInfo } from '@/types'
import type { FcConfigQuejlParams, WxFcConfig } from '@/types/api/wx/fcConfig'

// 查询字段配置列表
export function listFcConfig(query: FcConfigQuejlParams): Promise<TableDataInfo<WxFcConfig[]>> {
  return request({
    url: '/wx/fcConfig/list',
    method: 'get',
    params: query
  })
}

// 查询字段配置详细
export function getFcConfig(id: number): Promise<AjaxResult<WxFcConfig>> {
  return request({
    url: '/wx/fcConfig/' + id,
    method: 'get'
  })
}

// 新增字段配置
export function addFcConfig(data: WxFcConfig): Promise<AjaxResult> {
  return request({
    url: '/wx/fcConfig',
    method: 'post',
    data: data
  })
}

// 修改字段配置
export function updateFcConfig(data: WxFcConfig): Promise<AjaxResult> {
  return request({
    url: '/wx/fcConfig',
    method: 'put',
    data: data
  })
}

// 删除字段配置
export function delFcConfig(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/wx/fcConfig/' + id,
    method: 'delete'
  })
}

// H5 公开接口: 拉可渲染字段配置(后端 @Anonymous, 无需登录)
export function renderFcConfig(sourceType: string = '0'): Promise<AjaxResult<WxFcConfig[]>> {
  return request({
    url: '/wx/fcConfig/render/' + sourceType,
    method: 'get'
  })
}

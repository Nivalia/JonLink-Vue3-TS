import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, TemplateQuejlParams, WxMpTemplate } from '@/types'

// 查询模板管理列表
export function listTemplate(query: TemplateQuejlParams): Promise<TableDataInfo<WxMpTemplate[]>> {
  return request({
    url: '/wx/template/list',
    method: 'get',
    params: query
  })
}

// 查询模板管理详细
export function getTemplate(id: number): Promise<AjaxResult<WxMpTemplate>> {
  return request({
    url: '/wx/template/' + id,
    method: 'get'
  })
}

// 新增模板管理
export function addTemplate(data: WxMpTemplate): Promise<AjaxResult> {
  return request({
    url: '/wx/template',
    method: 'post',
    data: data
  })
}

// 修改模板管理
export function updateTemplate(data: WxMpTemplate): Promise<AjaxResult> {
  return request({
    url: '/wx/template',
    method: 'put',
    data: data
  })
}

// 删除模板管理
export function delTemplate(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/wx/template/' + id,
    method: 'delete'
  })
}



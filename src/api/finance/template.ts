import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, TemplateQuejlParams, FinVoucherTemplate } from '@/types'

// 查询凭证模板列表
export function listTemplate(query: TemplateQuejlParams): Promise<TableDataInfo<FinVoucherTemplate[]>> {
  return request({
    url: '/finance/template/list',
    method: 'get',
    params: query
  })
}

// 查询凭证模板详细
export function getTemplate(id: number): Promise<AjaxResult<FinVoucherTemplate>> {
  return request({
    url: '/finance/template/' + id,
    method: 'get'
  })
}

// 新增凭证模板
export function addTemplate(data: FinVoucherTemplate): Promise<AjaxResult> {
  return request({
    url: '/finance/template',
    method: 'post',
    data: data
  })
}

// 修改凭证模板
export function updateTemplate(data: FinVoucherTemplate): Promise<AjaxResult> {
  return request({
    url: '/finance/template',
    method: 'put',
    data: data
  })
}

// 删除凭证模板
export function delTemplate(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/finance/template/' + id,
    method: 'delete'
  })
}



import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, PartnerQuejlParams, FinPartner } from '@/types'

// 查询往来单位列表
export function listPartner(query: PartnerQuejlParams): Promise<TableDataInfo<FinPartner[]>> {
  return request({
    url: '/finance/partner/list',
    method: 'get',
    params: query
  })
}

// 查询往来单位详细
export function getPartner(id: number): Promise<AjaxResult<FinPartner>> {
  return request({
    url: '/finance/partner/' + id,
    method: 'get'
  })
}

// 新增往来单位
export function addPartner(data: FinPartner): Promise<AjaxResult> {
  return request({
    url: '/finance/partner',
    method: 'post',
    data: data
  })
}

// 修改往来单位
export function updatePartner(data: FinPartner): Promise<AjaxResult> {
  return request({
    url: '/finance/partner',
    method: 'put',
    data: data
  })
}

// 删除往来单位
export function delPartner(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/finance/partner/' + id,
    method: 'delete'
  })
}



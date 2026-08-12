import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, CommissionQuejlParams, WxDistCommission } from '@/types'

// 查询佣金积分列表
export function listCommission(query: CommissionQuejlParams): Promise<TableDataInfo<WxDistCommission[]>> {
  return request({
    url: '/wx/commission/list',
    method: 'get',
    params: query
  })
}

// 查询佣金积分详细
export function getCommission(id: number): Promise<AjaxResult<WxDistCommission>> {
  return request({
    url: '/wx/commission/' + id,
    method: 'get'
  })
}

// 新增佣金积分
export function addCommission(data: WxDistCommission): Promise<AjaxResult> {
  return request({
    url: '/wx/commission',
    method: 'post',
    data: data
  })
}

// 修改佣金积分
export function updateCommission(data: WxDistCommission): Promise<AjaxResult> {
  return request({
    url: '/wx/commission',
    method: 'put',
    data: data
  })
}

// 删除佣金积分
export function delCommission(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/wx/commission/' + id,
    method: 'delete'
  })
}



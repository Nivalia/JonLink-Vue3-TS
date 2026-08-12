import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, DistMemberQuejlParams, WxDistMember } from '@/types'

// 查询分销员档案列表
export function listDistMember(query: DistMemberQuejlParams): Promise<TableDataInfo<WxDistMember[]>> {
  return request({
    url: '/wx/distMember/list',
    method: 'get',
    params: query
  })
}

// 查询分销员档案详细
export function getDistMember(id: number): Promise<AjaxResult<WxDistMember>> {
  return request({
    url: '/wx/distMember/' + id,
    method: 'get'
  })
}

// 新增分销员档案
export function addDistMember(data: WxDistMember): Promise<AjaxResult> {
  return request({
    url: '/wx/distMember',
    method: 'post',
    data: data
  })
}

// 修改分销员档案
export function updateDistMember(data: WxDistMember): Promise<AjaxResult> {
  return request({
    url: '/wx/distMember',
    method: 'put',
    data: data
  })
}

// 删除分销员档案
export function delDistMember(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/wx/distMember/' + id,
    method: 'delete'
  })
}



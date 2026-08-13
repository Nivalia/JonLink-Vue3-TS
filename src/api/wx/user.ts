import request from '@/utils/request'
import type { AjaxResult, TableDataInfo } from '@/types'
import type { UserQuejlParams, WxMpUser } from '@/types/api/wx/user'

// 查询粉丝管理列表
export function listUser(query: UserQuejlParams): Promise<TableDataInfo<WxMpUser[]>> {
  return request({
    url: '/wx/user/list',
    method: 'get',
    params: query
  })
}

// 查询粉丝管理详细
export function getUser(id: number): Promise<AjaxResult<WxMpUser>> {
  return request({
    url: '/wx/user/' + id,
    method: 'get'
  })
}

// 新增粉丝管理
export function addUser(data: WxMpUser): Promise<AjaxResult> {
  return request({
    url: '/wx/user',
    method: 'post',
    data: data
  })
}

// 修改粉丝管理
export function updateUser(data: WxMpUser): Promise<AjaxResult> {
  return request({
    url: '/wx/user',
    method: 'put',
    data: data
  })
}

// 从公众号同步粉丝（同步入库）
export function syncUser(): Promise<AjaxResult> {
  return request({
    url: '/wx/user/sync',
    method: 'post'
  })
}

// 删除粉丝管理
export function delUser(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/wx/user/' + id,
    method: 'delete'
  })
}

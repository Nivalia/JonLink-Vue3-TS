import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, AccountQuejlParams, WxMpAccount } from '@/types'

// 查询账号配置列表
export function listAccount(query: AccountQuejlParams): Promise<TableDataInfo<WxMpAccount[]>> {
  return request({
    url: '/wx/account/list',
    method: 'get',
    params: query
  })
}

// 查询账号配置详细
export function getAccount(id: number): Promise<AjaxResult<WxMpAccount>> {
  return request({
    url: '/wx/account/' + id,
    method: 'get'
  })
}

// 新增账号配置
export function addAccount(data: WxMpAccount): Promise<AjaxResult> {
  return request({
    url: '/wx/account',
    method: 'post',
    data: data
  })
}

// 修改账号配置
export function updateAccount(data: WxMpAccount): Promise<AjaxResult> {
  return request({
    url: '/wx/account',
    method: 'put',
    data: data
  })
}

// 删除账号配置
export function delAccount(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/wx/account/' + id,
    method: 'delete'
  })
}



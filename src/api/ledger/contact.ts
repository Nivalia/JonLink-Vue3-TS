import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, ContactQuejlParams, JonlinkContactPerson } from '@/types'

// 查询联系人管理列表
export function listContact(query: ContactQuejlParams): Promise<TableDataInfo<JonlinkContactPerson[]>> {
  return request({
    url: '/ledger/contact/list',
    method: 'get',
    params: query
  })
}

// 查询联系人管理详细
export function getContact(id: number): Promise<AjaxResult<JonlinkContactPerson>> {
  return request({
    url: '/ledger/contact/' + id,
    method: 'get'
  })
}

// 新增联系人管理
export function addContact(data: JonlinkContactPerson): Promise<AjaxResult> {
  return request({
    url: '/ledger/contact',
    method: 'post',
    data: data
  })
}

// 修改联系人管理
export function updateContact(data: JonlinkContactPerson): Promise<AjaxResult> {
  return request({
    url: '/ledger/contact',
    method: 'put',
    data: data
  })
}

// 删除联系人管理
export function delContact(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/ledger/contact/' + id,
    method: 'delete'
  })
}



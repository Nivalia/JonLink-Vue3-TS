import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, CompanyContactQuejlParams, JonlinkCompanyContact } from '@/types'

// 查询公司联系人列表
export function listCompanyContact(query: CompanyContactQuejlParams): Promise<TableDataInfo<JonlinkCompanyContact[]>> {
  return request({
    url: '/ledger/companyContact/list',
    method: 'get',
    params: query
  })
}

// 查询公司联系人详细
export function getCompanyContact(id: number): Promise<AjaxResult<JonlinkCompanyContact>> {
  return request({
    url: '/ledger/companyContact/' + id,
    method: 'get'
  })
}

// 新增公司联系人
export function addCompanyContact(data: JonlinkCompanyContact): Promise<AjaxResult> {
  return request({
    url: '/ledger/companyContact',
    method: 'post',
    data: data
  })
}

// 修改公司联系人
export function updateCompanyContact(data: JonlinkCompanyContact): Promise<AjaxResult> {
  return request({
    url: '/ledger/companyContact',
    method: 'put',
    data: data
  })
}

// 删除公司联系人
export function delCompanyContact(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/ledger/companyContact/' + id,
    method: 'delete'
  })
}



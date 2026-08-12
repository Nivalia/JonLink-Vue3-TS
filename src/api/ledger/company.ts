import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, CompanyQuejlParams, JonlinkInsuranceCompany } from '@/types'

// 查询保险公司列表
export function listCompany(query: CompanyQuejlParams): Promise<TableDataInfo<JonlinkInsuranceCompany[]>> {
  return request({
    url: '/ledger/company/list',
    method: 'get',
    params: query
  })
}

// 查询保险公司详细
export function getCompany(id: number): Promise<AjaxResult<JonlinkInsuranceCompany>> {
  return request({
    url: '/ledger/company/' + id,
    method: 'get'
  })
}

// 新增保险公司
export function addCompany(data: JonlinkInsuranceCompany): Promise<AjaxResult> {
  return request({
    url: '/ledger/company',
    method: 'post',
    data: data
  })
}

// 修改保险公司
export function updateCompany(data: JonlinkInsuranceCompany): Promise<AjaxResult> {
  return request({
    url: '/ledger/company',
    method: 'put',
    data: data
  })
}

// 删除保险公司
export function delCompany(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/ledger/company/' + id,
    method: 'delete'
  })
}



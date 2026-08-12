import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, InsuranceTypeQuejlParams, JonlinkInsuranceType } from '@/types'

// 查询险种管理列表
export function listInsuranceType(query: InsuranceTypeQuejlParams): Promise<TableDataInfo<JonlinkInsuranceType[]>> {
  return request({
    url: '/ledger/insuranceType/list',
    method: 'get',
    params: query
  })
}

// 查询险种管理详细
export function getInsuranceType(id: number): Promise<AjaxResult<JonlinkInsuranceType>> {
  return request({
    url: '/ledger/insuranceType/' + id,
    method: 'get'
  })
}

// 新增险种管理
export function addInsuranceType(data: JonlinkInsuranceType): Promise<AjaxResult> {
  return request({
    url: '/ledger/insuranceType',
    method: 'post',
    data: data
  })
}

// 修改险种管理
export function updateInsuranceType(data: JonlinkInsuranceType): Promise<AjaxResult> {
  return request({
    url: '/ledger/insuranceType',
    method: 'put',
    data: data
  })
}

// 删除险种管理
export function delInsuranceType(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/ledger/insuranceType/' + id,
    method: 'delete'
  })
}



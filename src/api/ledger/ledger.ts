import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, LedgerQuejlParams, JonlinkInsuranceLedger } from '@/types'

// 查询保险台账列表
export function listLedger(query: LedgerQuejlParams): Promise<TableDataInfo<JonlinkInsuranceLedger[]>> {
  return request({
    url: '/ledger/ledger/list',
    method: 'get',
    params: query
  })
}

// 查询保险台账详细
export function getLedger(id: number): Promise<AjaxResult<JonlinkInsuranceLedger>> {
  return request({
    url: '/ledger/ledger/' + id,
    method: 'get'
  })
}

// 新增保险台账
export function addLedger(data: JonlinkInsuranceLedger): Promise<AjaxResult> {
  return request({
    url: '/ledger/ledger',
    method: 'post',
    data: data
  })
}

// 修改保险台账
export function updateLedger(data: JonlinkInsuranceLedger): Promise<AjaxResult> {
  return request({
    url: '/ledger/ledger',
    method: 'put',
    data: data
  })
}

// 删除保险台账
export function delLedger(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/ledger/ledger/' + id,
    method: 'delete'
  })
}



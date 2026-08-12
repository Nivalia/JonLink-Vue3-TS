import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, SettleRecordQuejlParams, JonlinkSettleRecord } from '@/types'

// 查询结算记录列表
export function listSettleRecord(query: SettleRecordQuejlParams): Promise<TableDataInfo<JonlinkSettleRecord[]>> {
  return request({
    url: '/ledger/settleRecord/list',
    method: 'get',
    params: query
  })
}

// 查询结算记录详细
export function getSettleRecord(id: number): Promise<AjaxResult<JonlinkSettleRecord>> {
  return request({
    url: '/ledger/settleRecord/' + id,
    method: 'get'
  })
}

// 新增结算记录
export function addSettleRecord(data: JonlinkSettleRecord): Promise<AjaxResult> {
  return request({
    url: '/ledger/settleRecord',
    method: 'post',
    data: data
  })
}

// 修改结算记录
export function updateSettleRecord(data: JonlinkSettleRecord): Promise<AjaxResult> {
  return request({
    url: '/ledger/settleRecord',
    method: 'put',
    data: data
  })
}

// 删除结算记录
export function delSettleRecord(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/ledger/settleRecord/' + id,
    method: 'delete'
  })
}



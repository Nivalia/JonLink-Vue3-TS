import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, WxLedgerSummaryQuejlParams, WxLedgerSummary } from '@/types'

// 查询台账日汇总列表
export function listWxLedgerSummary(query: WxLedgerSummaryQuejlParams): Promise<TableDataInfo<WxLedgerSummary[]>> {
  return request({
    url: '/ledger/wxLedgerSummary/list',
    method: 'get',
    params: query
  })
}

// 查询台账日汇总详细
export function getWxLedgerSummary(id: number): Promise<AjaxResult<WxLedgerSummary>> {
  return request({
    url: '/ledger/wxLedgerSummary/' + id,
    method: 'get'
  })
}

// 新增台账日汇总
export function addWxLedgerSummary(data: WxLedgerSummary): Promise<AjaxResult> {
  return request({
    url: '/ledger/wxLedgerSummary',
    method: 'post',
    data: data
  })
}

// 修改台账日汇总
export function updateWxLedgerSummary(data: WxLedgerSummary): Promise<AjaxResult> {
  return request({
    url: '/ledger/wxLedgerSummary',
    method: 'put',
    data: data
  })
}

// 删除台账日汇总
export function delWxLedgerSummary(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/ledger/wxLedgerSummary/' + id,
    method: 'delete'
  })
}



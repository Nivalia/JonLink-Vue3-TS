import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, WxLedgerItemQuejlParams, WxLedgerItem } from '@/types'

// 查询电子台账流水列表
export function listWxLedgerItem(query: WxLedgerItemQuejlParams): Promise<TableDataInfo<WxLedgerItem[]>> {
  return request({
    url: '/ledger/wxLedgerItem/list',
    method: 'get',
    params: query
  })
}

// 查询电子台账流水详细
export function getWxLedgerItem(id: number): Promise<AjaxResult<WxLedgerItem>> {
  return request({
    url: '/ledger/wxLedgerItem/' + id,
    method: 'get'
  })
}

// 新增电子台账流水
export function addWxLedgerItem(data: WxLedgerItem): Promise<AjaxResult> {
  return request({
    url: '/ledger/wxLedgerItem',
    method: 'post',
    data: data
  })
}

// 修改电子台账流水
export function updateWxLedgerItem(data: WxLedgerItem): Promise<AjaxResult> {
  return request({
    url: '/ledger/wxLedgerItem',
    method: 'put',
    data: data
  })
}

// 删除电子台账流水
export function delWxLedgerItem(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/ledger/wxLedgerItem/' + id,
    method: 'delete'
  })
}



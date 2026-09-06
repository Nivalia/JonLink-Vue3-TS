import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, LogQuejlParams, FinLedgerVoucherLog } from '@/types'

// 查询台账记账日志列表
export function listLog(query: LogQuejlParams): Promise<TableDataInfo<FinLedgerVoucherLog[]>> {
  return request({
    url: '/finance/log/list',
    method: 'get',
    params: query
  })
}

// 查询台账记账日志详细
export function getLog(id: number): Promise<AjaxResult<FinLedgerVoucherLog>> {
  return request({
    url: '/finance/log/' + id,
    method: 'get'
  })
}

// 新增台账记账日志
export function addLog(data: FinLedgerVoucherLog): Promise<AjaxResult> {
  return request({
    url: '/finance/log',
    method: 'post',
    data: data
  })
}

// 修改台账记账日志
export function updateLog(data: FinLedgerVoucherLog): Promise<AjaxResult> {
  return request({
    url: '/finance/log',
    method: 'put',
    data: data
  })
}

// 删除台账记账日志
export function delLog(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/finance/log/' + id,
    method: 'delete'
  })
}



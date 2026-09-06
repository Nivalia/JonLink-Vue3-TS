import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, FlowQuejlParams, FinCashFlow } from '@/types'

// 查询资金流水列表
export function listFlow(query: FlowQuejlParams): Promise<TableDataInfo<FinCashFlow[]>> {
  return request({
    url: '/finance/flow/list',
    method: 'get',
    params: query
  })
}

// 查询资金流水详细
export function getFlow(id: number): Promise<AjaxResult<FinCashFlow>> {
  return request({
    url: '/finance/flow/' + id,
    method: 'get'
  })
}

// 新增资金流水
export function addFlow(data: FinCashFlow): Promise<AjaxResult> {
  return request({
    url: '/finance/flow',
    method: 'post',
    data: data
  })
}

// 修改资金流水
export function updateFlow(data: FinCashFlow): Promise<AjaxResult> {
  return request({
    url: '/finance/flow',
    method: 'put',
    data: data
  })
}

// 删除资金流水
export function delFlow(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/finance/flow/' + id,
    method: 'delete'
  })
}



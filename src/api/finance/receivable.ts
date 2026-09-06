import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, ReceivableQuejlParams, FinReceivable } from '@/types'

// 查询应收单列表
export function listReceivable(query: ReceivableQuejlParams): Promise<TableDataInfo<FinReceivable[]>> {
  return request({
    url: '/finance/receivable/list',
    method: 'get',
    params: query
  })
}

// 查询应收单详细
export function getReceivable(id: number): Promise<AjaxResult<FinReceivable>> {
  return request({
    url: '/finance/receivable/' + id,
    method: 'get'
  })
}

// 新增应收单
export function addReceivable(data: FinReceivable): Promise<AjaxResult> {
  return request({
    url: '/finance/receivable',
    method: 'post',
    data: data
  })
}

// 修改应收单
export function updateReceivable(data: FinReceivable): Promise<AjaxResult> {
  return request({
    url: '/finance/receivable',
    method: 'put',
    data: data
  })
}

// 删除应收单
export function delReceivable(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/finance/receivable/' + id,
    method: 'delete'
  })
}



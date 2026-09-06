import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, PayableQuejlParams, FinPayable } from '@/types'

// 查询应付单列表
export function listPayable(query: PayableQuejlParams): Promise<TableDataInfo<FinPayable[]>> {
  return request({
    url: '/finance/payable/list',
    method: 'get',
    params: query
  })
}

// 查询应付单详细
export function getPayable(id: number): Promise<AjaxResult<FinPayable>> {
  return request({
    url: '/finance/payable/' + id,
    method: 'get'
  })
}

// 新增应付单
export function addPayable(data: FinPayable): Promise<AjaxResult> {
  return request({
    url: '/finance/payable',
    method: 'post',
    data: data
  })
}

// 修改应付单
export function updatePayable(data: FinPayable): Promise<AjaxResult> {
  return request({
    url: '/finance/payable',
    method: 'put',
    data: data
  })
}

// 删除应付单
export function delPayable(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/finance/payable/' + id,
    method: 'delete'
  })
}



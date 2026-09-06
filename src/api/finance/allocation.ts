import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, AllocationQuejlParams, FinAllocation } from '@/types'

// 查询核销记录列表
export function listAllocation(query: AllocationQuejlParams): Promise<TableDataInfo<FinAllocation[]>> {
  return request({
    url: '/finance/allocation/list',
    method: 'get',
    params: query
  })
}

// 查询核销记录详细
export function getAllocation(id: number): Promise<AjaxResult<FinAllocation>> {
  return request({
    url: '/finance/allocation/' + id,
    method: 'get'
  })
}

// 新增核销记录
export function addAllocation(data: FinAllocation): Promise<AjaxResult> {
  return request({
    url: '/finance/allocation',
    method: 'post',
    data: data
  })
}

// 修改核销记录
export function updateAllocation(data: FinAllocation): Promise<AjaxResult> {
  return request({
    url: '/finance/allocation',
    method: 'put',
    data: data
  })
}

// 删除核销记录
export function delAllocation(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/finance/allocation/' + id,
    method: 'delete'
  })
}



import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, PeriodQuejlParams, FinPeriod } from '@/types'

// 查询会计期间列表
export function listPeriod(query: PeriodQuejlParams): Promise<TableDataInfo<FinPeriod[]>> {
  return request({
    url: '/finance/period/list',
    method: 'get',
    params: query
  })
}

// 查询会计期间详细
export function getPeriod(id: number): Promise<AjaxResult<FinPeriod>> {
  return request({
    url: '/finance/period/' + id,
    method: 'get'
  })
}

// 新增会计期间
export function addPeriod(data: FinPeriod): Promise<AjaxResult> {
  return request({
    url: '/finance/period',
    method: 'post',
    data: data
  })
}

// 修改会计期间
export function updatePeriod(data: FinPeriod): Promise<AjaxResult> {
  return request({
    url: '/finance/period',
    method: 'put',
    data: data
  })
}

// 删除会计期间
export function delPeriod(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/finance/period/' + id,
    method: 'delete'
  })
}



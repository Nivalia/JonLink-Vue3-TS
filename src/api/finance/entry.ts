import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, EntryQuejlParams, FinVoucherEntry } from '@/types'

// 查询凭证分录列表
export function listEntry(query: EntryQuejlParams): Promise<TableDataInfo<FinVoucherEntry[]>> {
  return request({
    url: '/finance/entry/list',
    method: 'get',
    params: query
  })
}

// 查询凭证分录详细
export function getEntry(id: number): Promise<AjaxResult<FinVoucherEntry>> {
  return request({
    url: '/finance/entry/' + id,
    method: 'get'
  })
}

// 新增凭证分录
export function addEntry(data: FinVoucherEntry): Promise<AjaxResult> {
  return request({
    url: '/finance/entry',
    method: 'post',
    data: data
  })
}

// 修改凭证分录
export function updateEntry(data: FinVoucherEntry): Promise<AjaxResult> {
  return request({
    url: '/finance/entry',
    method: 'put',
    data: data
  })
}

// 删除凭证分录
export function delEntry(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/finance/entry/' + id,
    method: 'delete'
  })
}



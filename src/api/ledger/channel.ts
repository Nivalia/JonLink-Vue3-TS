import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, ChannelQuejlParams, JonlinkChannel } from '@/types'

// 查询上游渠道商列表
export function listChannel(query: ChannelQuejlParams): Promise<TableDataInfo<JonlinkChannel[]>> {
  return request({
    url: '/ledger/channel/list',
    method: 'get',
    params: query
  })
}

// 查询上游渠道商详细
export function getChannel(id: number): Promise<AjaxResult<JonlinkChannel>> {
  return request({
    url: '/ledger/channel/' + id,
    method: 'get'
  })
}

// 查询启用的渠道商（下拉用）
export function listChannelOptions(): Promise<AjaxResult<JonlinkChannel[]>> {
  return request({
    url: '/ledger/channel/options',
    method: 'get'
  })
}

// 新增上游渠道商
export function addChannel(data: JonlinkChannel): Promise<AjaxResult> {
  return request({
    url: '/ledger/channel',
    method: 'post',
    data: data
  })
}

// 修改上游渠道商
export function updateChannel(data: JonlinkChannel): Promise<AjaxResult> {
  return request({
    url: '/ledger/channel',
    method: 'put',
    data: data
  })
}

// 删除上游渠道商
export function delChannel(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/ledger/channel/' + id,
    method: 'delete'
  })
}

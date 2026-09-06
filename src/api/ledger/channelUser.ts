import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, ChannelUserQuejlParams, JonlinkChannelUser } from '@/types'

// 查询渠道/业务员列表
export function listChannelUser(query: ChannelUserQuejlParams): Promise<TableDataInfo<JonlinkChannelUser[]>> {
  return request({
    url: '/ledger/channelUser/list',
    method: 'get',
    params: query
  })
}

// 查询渠道/业务员详细
export function getChannelUser(id: number): Promise<AjaxResult<JonlinkChannelUser>> {
  return request({
    url: '/ledger/channelUser/' + id,
    method: 'get'
  })
}

// 查询启用的渠道/业务员（下拉用，台账渠道类型=2 数据源）
export function listChannelUserOptions(): Promise<AjaxResult<JonlinkChannelUser[]>> {
  return request({
    url: '/ledger/channelUser/options',
    method: 'get'
  })
}

// 新增渠道/业务员
export function addChannelUser(data: JonlinkChannelUser): Promise<AjaxResult> {
  return request({
    url: '/ledger/channelUser',
    method: 'post',
    data: data
  })
}

// 修改渠道/业务员
export function updateChannelUser(data: JonlinkChannelUser): Promise<AjaxResult> {
  return request({
    url: '/ledger/channelUser',
    method: 'put',
    data: data
  })
}

// 删除渠道/业务员
export function delChannelUser(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/ledger/channelUser/' + id,
    method: 'delete'
  })
}

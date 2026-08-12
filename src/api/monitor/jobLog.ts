import request from '@/utils/request'
import type { JobLogQuejlParams, SysJobLog, AjaxResult, TableDataInfo } from '@/types'

// 查询调度日志列表
export function listJobLog(query: JobLogQuejlParams): Promise<TableDataInfo<SysJobLog[]>> {
  return request({
    url: '/monitor/jobLog/list',
    method: 'get',
    params: query
  })
}

// 删除调度日志
export function delJobLog(jobLogId: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/monitor/jobLog/' + jobLogId,
    method: 'delete'
  })
}

// 清空调度日志
export function cleanJobLog(): Promise<AjaxResult> {
  return request({
    url: '/monitor/jobLog/clean',
    method: 'delete'
  })
}


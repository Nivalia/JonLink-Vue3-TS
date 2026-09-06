import request from '@/utils/request'
import type { AjaxResult, TableDataInfo, SubjectQuejlParams, FinSubject } from '@/types'

// 查询会计科目列表
export function listSubject(query?: SubjectQuejlParams): Promise<AjaxResult<FinSubject[]>> {
  return request({
    url: '/finance/subject/list',
    method: 'get',
    params: query
  })
}

// 查询会计科目详细
export function getSubject(id: number): Promise<AjaxResult<FinSubject>> {
  return request({
    url: '/finance/subject/' + id,
    method: 'get'
  })
}

// 新增会计科目
export function addSubject(data: FinSubject): Promise<AjaxResult> {
  return request({
    url: '/finance/subject',
    method: 'post',
    data: data
  })
}

// 修改会计科目
export function updateSubject(data: FinSubject): Promise<AjaxResult> {
  return request({
    url: '/finance/subject',
    method: 'put',
    data: data
  })
}

// 删除会计科目
export function delSubject(id: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/finance/subject/' + id,
    method: 'delete'
  })
}



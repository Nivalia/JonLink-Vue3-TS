import request from '@/utils/request'

// 查询H5页面列表
export function listH5Page(query: any) {
  return request({
    url: '/wx/h5Page/list',
    method: 'get',
    params: query
  })
}

// 查询H5页面详细
export function getH5Page(id: number | string) {
  return request({
    url: '/wx/h5Page/' + id,
    method: 'get'
  })
}

// 新增H5页面
export function addH5Page(data: any) {
  return request({
    url: '/wx/h5Page',
    method: 'post',
    data: data
  })
}

// 修改H5页面
export function updateH5Page(data: any) {
  return request({
    url: '/wx/h5Page',
    method: 'put',
    data: data
  })
}

// 删除H5页面
export function delH5Page(id: number | string) {
  return request({
    url: '/wx/h5Page/' + id,
    method: 'delete'
  })
}

// 生成 H5 访问链接(ticket)
export function genTicket(data: any) {
  return request({
    url: '/wx/h5Page/ticket',
    method: 'post',
    data: data
  })
}

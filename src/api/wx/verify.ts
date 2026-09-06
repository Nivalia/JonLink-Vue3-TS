import request from '@/utils/request'

// H5 核销(匿名端点, 前端不传 token)
export function h5Verify(data: {
  orderNo: string
  phone?: string
  carNo?: string
  amount?: string | number
  extJson?: string
}): Promise<any> {
  return request({
    url: '/wx/h5/verify',
    method: 'post',
    data,
    headers: { isToken: false }
  })
}

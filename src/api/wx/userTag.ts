import request from "@/utils/request";

/** 粉丝标签关联信息 */
export interface WxUserTag {
  id?: number;
  userId?: number;
  tagId?: number;
  tagName?: string;
}

/** 查询粉丝标签列表 */
export function listUserTag(params: any) {
  return request({ url: "/wx/userTag/list", method: "get", params });
}

/** 获取粉丝标签详情 */
export function getUserTag(id: number) {
  return request({ url: "/wx/userTag/" + id, method: "get" });
}

/** 获取粉丝的所有标签 */
export function getTagsByUserId(userId: number) {
  return request({ url: "/wx/userTag/user/" + userId, method: "get" });
}

/** 新增粉丝标签 */
export function addUserTag(data: WxUserTag) {
  return request({ url: "/wx/userTag", method: "post", data });
}

/** 修改粉丝标签 */
export function updateUserTag(data: WxUserTag) {
  return request({ url: "/wx/userTag", method: "put", data });
}

/** 删除粉丝标签 */
export function delUserTag(ids: number | number[]) {
  return request({ url: "/wx/userTag/" + ids, method: "delete" });
}

/** 保存粉丝标签（先删后增） */
export function saveUserTags(userId: number, tagIds: number[]) {
  return request({ url: "/wx/userTag/save/" + userId, method: "post", data: tagIds });
}

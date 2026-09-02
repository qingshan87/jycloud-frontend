import { request } from '@/utils/request';

import type { UcenterUserForm, UcenterUserQuery, UcenterUserVO } from './model';

/** 用户中心（jy-ucenter）：用户管理 */
const Api = {
  Page: '/jy-ucenter/system/user/page',
  Create: '/jy-ucenter/system/user/create',
  Update: '/jy-ucenter/system/user/update',
  Detail: (userId: number) => `/jy-ucenter/system/user/${userId}`,
  ResetPassword: '/jy-ucenter/system/user/password/reset',
  UpdateUsername: '/jy-ucenter/system/user/username/update',
  Delete: (userId: number) => `/jy-ucenter/system/user/delete/${userId}`,
};

export function pageUcenterUsers(params: UcenterUserQuery) {
  return request.get<{ records: UcenterUserVO[]; total: number; size: number; current: number }>({
    url: Api.Page,
    params,
  });
}

export function createUcenterUser(data: UcenterUserForm) {
  return request.post<UcenterUserVO>({ url: Api.Create, data });
}

export function updateUcenterUser(data: UcenterUserForm) {
  return request.post<UcenterUserVO>({ url: Api.Update, data });
}

export function getUcenterUser(userId: number) {
  return request.get<UcenterUserVO>({ url: Api.Detail(userId) });
}

export function resetUcenterPassword(userIds: number[]) {
  return request.post({ url: `${Api.ResetPassword}?userIds=${userIds.join(',')}` });
}

export function updateUcenterUsername(userId: number, username: string) {
  return request.post({ url: `${Api.UpdateUsername}?userId=${userId}&username=${encodeURIComponent(username)}` });
}

export function deleteUcenterUser(userId: number) {
  return request.post({ url: Api.Delete(userId) });
}

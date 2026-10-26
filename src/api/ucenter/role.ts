import { request } from '@/utils/request';

import type { UcenterRoleForm, UcenterRoleQuery, UcenterRoleVO } from './model';

/** 用户中心（jy-ucenter）：角色管理 */
const Api = {
  Page: '/jy-ucenter/system/role/page',
  List: '/jy-ucenter/system/role/list',
  Create: '/jy-ucenter/system/role/create',
  Update: '/jy-ucenter/system/role/update',
  Detail: (roleId: number) => `/jy-ucenter/system/role/detail/${roleId}`,
  Delete: (roleId: number) => `/jy-ucenter/system/role/delete/${roleId}`,
};

export function pageUcenterRoles(params: UcenterRoleQuery) {
  return request.get<{ records: UcenterRoleVO[]; total: number; size: number; current: number }>({
    url: Api.Page,
    params,
  });
}

export function listUcenterRoles() {
  return request.get<UcenterRoleVO[]>({ url: Api.List });
}
export function createUcenterRole(data: UcenterRoleForm) {
  return request.post({ url: Api.Create, data });
}

export function updateUcenterRole(data: UcenterRoleForm) {
  return request.post({ url: Api.Update, data });
}

export function getUcenterRole(roleId: number) {
  return request.get<UcenterRoleVO>({ url: Api.Detail(roleId) });
}

export function deleteUcenterRole(roleId: number) {
  return request.post({ url: Api.Delete(roleId) });
}

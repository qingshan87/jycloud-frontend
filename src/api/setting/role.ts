import type { PageResult, RoleForm, RoleQuery, SettingRole } from '@/api/model/settingModel';
import { request } from '@/utils/request';

const Api = {
  Page: '/jy-setting/system/role/page',
  Create: '/jy-setting/system/role/create',
  Update: '/jy-setting/system/role/update',
  Detail: (roleId: number) => `/jy-setting/system/role/detail/${roleId}`,
  Delete: (roleId: number) => `/jy-setting/system/role/delete/${roleId}`,
};

export function pageRoles(params: RoleQuery) {
  return request.get<PageResult<SettingRole>>({
    url: Api.Page,
    params,
  });
}

/** 创建管理员角色（角色名必须是内置管理员角色名） */
export function createRole(data: RoleForm) {
  return request.post({
    url: Api.Create,
    data,
  });
}

/** 修改管理员角色（仅内置角色） */
export function updateRole(data: RoleForm) {
  return request.post({
    url: Api.Update,
    data,
  });
}

export function detailRole(roleId: number) {
  return request.get<SettingRole>({
    url: Api.Detail(roleId),
  });
}

export function deleteRole(roleId: number) {
  return request.post({
    url: Api.Delete(roleId),
  });
}

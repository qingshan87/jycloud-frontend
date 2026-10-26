import type { PageResult, SettingUser, UserForm, UserQuery } from '@/api/setting/settingModel';
import { request } from '@/utils/request';

const Api = {
  PageSystem: '/jy-setting/system/user/page/system',
  PageTenant: '/jy-setting/system/user/page/tenant',
  Create: '/jy-setting/system/user/create',
  Update: '/jy-setting/system/user/update',
  Delete: (userId: number) => `/jy-setting/system/user/delete/${userId}`,
  ResetPassword: '/jy-setting/system/user/password/reset',
  SetRole: '/jy-setting/system/user-role/set',
  ListRole: '/jy-setting/system/user-role/list',
  RemoveUserTenant: '/jy-setting/system/user-tenant/remove',
  InviteSearch: '/jy-setting/system/user/invite',
  BindUserTenant: '/jy-setting/system/user-tenant/bind',
};

/** 条件分页查询用户列表（可选按租户过滤，setting 平台使用） */
export function pageUsers(params: UserQuery & { tenantId?: string }) {
  return request.get<PageResult<SettingUser>>({
    url: Api.PageSystem,
    params,
  });
}

/** 租户内用户分页查询（租户详情-用户管理使用，tenantId 必传） */
export function pageTenantUsers(params: UserQuery & { tenantId: string }) {
  return request.get<PageResult<SettingUser>>({
    url: Api.PageTenant,
    params,
  });
}

export function createUser(data: UserForm) {
  return request.post<SettingUser>({
    url: Api.Create,
    data,
  });
}

export function updateUser(data: UserForm) {
  return request.post<SettingUser>({
    url: Api.Update,
    data,
  });
}

export function deleteUser(userId: number) {
  return request.post({
    url: Api.Delete(userId),
  });
}

/** 将用户移出指定租户（租户用户管理-删除使用，仅移除关联，不删除账号） */
export function removeUserFromTenant(userId: number, tenantId: string) {
  return request.post({
    url: `${Api.RemoveUserTenant}?userId=${userId}&tenantId=${tenantId}`,
  });
}

/** 查询可邀请加入租户的系统用户（至少携带一个查询条件，无条件返回空） */
export function searchInviteUsers(params: { username?: string; realname?: string; mobile?: string; tenantId: string }) {
  return request.get<SettingUser[]>({
    url: Api.InviteSearch,
    params,
  });
}

/** 邀请（绑定）用户加入指定租户 */
export function bindUserToTenant(userId: number, tenantId: string) {
  return request.post({
    url: `${Api.BindUserTenant}?userId=${userId}&tenantId=${tenantId}`,
  });
}

/** 重置密码（多个用户ID，英文逗号分隔） */
export function resetPassword(userIds: number[]) {
  return request.post({
    url: `${Api.ResetPassword}?userIds=${userIds.join(',')}`,
  });
}

/** 设置用户角色（roleIds 为空表示清空角色） */
export function setUserRoles(data: { userId: number; tenantId: string; roleIds?: number[] }) {
  return request.post({
    url: Api.SetRole,
    data,
  });
}

/** 查询用户绑定的角色 ID 集合 */
export function getUserRoles(userId: number, tenantId: string) {
  return request.get<number[]>({
    url: Api.ListRole,
    params: { userId, tenantId },
  });
}

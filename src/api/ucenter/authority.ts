import { request } from '@/utils/request';

import type { UcenterMenuVO, UserAuthorityForm } from './model';

/** 用户中心（jy-ucenter）：用户授权 / 菜单树 */
const Api = {
  SetRole: '/jy-ucenter/system/user-authority/set-role',
  ListRole: '/jy-ucenter/system/user-authority/list-role',
  SetMenu: '/jy-ucenter/system/user-authority/set-menu',
  ListMenu: '/jy-ucenter/system/user-authority/list-menu',
  MenuTree: '/jy-ucenter/system/menu/tree',
};

/** 给用户分配角色 */
export function setUserRoles(data: UserAuthorityForm) {
  return request.post({ url: Api.SetRole, data });
}

/** 查询用户已分配角色 ID */
export function listUserRoles(userId: number) {
  return request.get<number[]>({ url: `${Api.ListRole}?userId=${userId}` });
}

/** 给用户分配菜单（数据权限场景预留） */
export function setUserMenus(data: UserAuthorityForm) {
  return request.post({ url: Api.SetMenu, data });
}

/** 查询用户已分配菜单 ID */
export function listUserMenus(userId: number) {
  return request.get<number[]>({ url: `${Api.ListMenu}?userId=${userId}` });
}

/** 当前租户菜单树（角色授权使用） */
export function treeUcenterMenus() {
  return request.get<UcenterMenuVO[]>({ url: Api.MenuTree });
}

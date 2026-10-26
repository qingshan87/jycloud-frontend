import type { MenuForm, SettingMenu } from '@/api/setting/settingModel';
import { request } from '@/utils/request';

const Api = {
  Tree: (clientId: string) => `/jy-setting/system/menu/tree/${clientId}`,
  Create: '/jy-setting/system/menu/create',
  Update: '/jy-setting/system/menu/update',
  Detail: (menuId: number) => `/jy-setting/system/menu/${menuId}`,
  Delete: (menuId: number) => `/jy-setting/system/menu/delete/${menuId}`,
};

/** 查询应用菜单树 */
export function treeMenus(clientId: string) {
  return request.get<SettingMenu[]>({
    url: Api.Tree(clientId),
  });
}

export function createMenu(data: MenuForm) {
  return request.post<SettingMenu>({
    url: Api.Create,
    data,
  });
}

export function updateMenu(data: MenuForm) {
  return request.post<SettingMenu>({
    url: Api.Update,
    data,
  });
}

export function getMenu(menuId: number) {
  return request.get<SettingMenu>({
    url: Api.Detail(menuId),
  });
}

export function deleteMenu(menuId: number) {
  return request.post({
    url: Api.Delete(menuId),
  });
}

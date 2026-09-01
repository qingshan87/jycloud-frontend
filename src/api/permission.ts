import type { MenuListResult, MenuVO, MyApp, RouteItem } from '@/api/model/permissionModel';
import { request } from '@/utils/request';

const Api = {
  MenuList: '/jy-user/system/user/router/menu',
  MyApps: '/jy-user/system/user/apps',
};

/** 递归提取菜单树中的按钮权限标识（category=1 的 perms） */
function collectMenuPerms(menus: MenuVO[] | undefined): string[] {
  const perms: string[] = [];
  for (const menu of menus || []) {
    if (menu.category === 1 && menu.perms) {
      perms.push(menu.perms);
    }
    perms.push(...collectMenuPerms(menu.children));
  }
  return perms;
}

/** 后端菜单树 -> 前端路由菜单（RouteItem） */
function transformMenu(menus: MenuVO[] | undefined): RouteItem[] {
  const result: RouteItem[] = [];
  for (const menu of menus || []) {
    if (menu.category === 1) continue;
    const children = transformMenu(menu.children);
    const isDir = children.length > 0;
    const component = menu.component || (isDir ? 'LAYOUT' : '');
    if (!isDir && !component) {
      // 没有 children 就是单页面,必须配置 component 指向 src/pages 下的页面
      console.warn(
        `[permission] 菜单「${menu.menuTitle || menu.menuName || menu.menuId}」既无子菜单也无 component,已忽略`,
      );
      continue;
    }
    result.push({
      path: menu.path || '',
      name: menu.menuName || `menu-${menu.menuId}`,
      component: isDir ? 'LAYOUT' : component,
      redirect: isDir
        ? children[0]?.path?.startsWith('/')
          ? children[0].path
          : `${menu.path}/${children[0]?.path || ''}`
        : undefined,
      meta: {
        title: menu.menuTitle,
        icon: menu.icon,
        orderNo: menu.sort ?? 0,
        hidden: menu.hide === 1,
      },
      children,
    });
  }
  return result;
}

export function getMenuList() {
  return request
    .get<MenuVO[]>({
      url: Api.MenuList,
    })
    .then((list) => {
      return { list: transformMenu(list), perms: collectMenuPerms(list) } as MenuListResult;
    });
}

/** 获取当前用户可用应用列表（jy-user 公共接口 system/user/apps，按用户权限过滤） */
export function getMyApps() {
  return request.get<MyApp[]>({
    url: Api.MyApps,
  });
}

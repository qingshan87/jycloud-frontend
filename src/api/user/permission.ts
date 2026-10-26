import type { MenuListResult, MenuVO, MyApp, RouteItem } from '@/api/user/permissionModel';
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
    const routePath = isDir ? resolveDirectoryPath(menu.path, children) : menu.path || '';
    if (!isDir && !component) {
      // 没有 children 就是单页面,必须配置 component 指向 src/pages 下的页面
      console.warn(
        `[permission] 菜单「${menu.menuTitle || menu.menuName || menu.menuId}」既无子菜单也无 component,已忽略`,
      );
      continue;
    }
    result.push({
      path: routePath,
      name: menu.menuName || `menu-${menu.menuId}`,
      component: isDir ? 'LAYOUT' : component,
      redirect: isDir
        ? children[0]?.path?.startsWith('/')
          ? children[0].path
          : `${routePath}/${children[0]?.path || ''}`
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

/** 兼容目录菜单未配置 path 的情况，从首个子菜单路径推导目录路径 */
function resolveDirectoryPath(path: string | undefined, children: RouteItem[]): string {
  if (path) return path;
  const childPath = children[0]?.path;
  if (!childPath?.startsWith('/')) return '';
  const lastSlashIndex = childPath.lastIndexOf('/');
  return lastSlashIndex > 0 ? childPath.slice(0, lastSlashIndex) : '';
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

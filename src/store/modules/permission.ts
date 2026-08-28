import { defineStore } from 'pinia';
import type { RouteRecordRaw } from 'vue-router';

import type { RouteItem } from '@/api/model/permissionModel';
import { getMenuList } from '@/api/permission';
import router, { homepageRouterList } from '@/router';
import { store } from '@/store';
import { transformObjectToRoute } from '@/utils/route';

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    whiteListRouters: ['/login'],
    routers: [],
    removeRoutes: [],
    asyncRoutes: [],
  }),
  actions: {
    async initRoutes() {
      const accessedRouters = this.asyncRoutes;

      // 在菜单展示全部路由
      // this.routers = [...homepageRouterList, ...accessedRouters, ...fixedRouterList];
      // 在菜单只展示动态路由和首页
      this.routers = [...homepageRouterList, ...accessedRouters];
      // 在菜单只展示动态路由
      // this.routers = [...accessedRouters];
    },
    async buildAsyncRoutes() {
      try {
        // 发起菜单权限请求 获取菜单列表
        const menuResult = await getMenuList();
        const asyncRoutes: Array<RouteItem> = menuResult.list;

        // 将菜单树中的按钮权限合并到用户 store，
        // 保证登录接口未返回 permissions 时按钮级权限控制依然可用
        if (menuResult.perms?.length) {
          const { useUserStore } = await import('@/store/modules/user');
          const userStore = useUserStore();
          userStore.permissions = Array.from(new Set([...userStore.permissions, ...menuResult.perms]));
        }

        this.asyncRoutes = transformObjectToRoute(asyncRoutes);
        await this.initRoutes();
        return this.asyncRoutes;
      } catch (error) {
        throw new Error("Can't build routes", error);
      }
    },
    async restoreRoutes() {
      // 不需要在此额外调用initRoutes更新侧边导肮内容，在登录后asyncRoutes为空会调用
      this.asyncRoutes.forEach((item: RouteRecordRaw) => {
        if (item.name) {
          router.removeRoute(item.name);
        }
      });
      this.asyncRoutes = [];
    },
  },
});

export function getPermissionStore() {
  return usePermissionStore(store);
}

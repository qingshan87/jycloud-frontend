import { defineStore } from 'pinia';
import type { RouteRecordRaw } from 'vue-router';

import { login as loginApi, logout as logoutApi, switchTenant as switchTenantApi } from '@/api/auth';
import type { MyApp } from '@/api/model/permissionModel';
import { getMyApps } from '@/api/permission';
import { CLIENT_ID } from '@/constants';
import router from '@/router';
import { usePermissionStore } from '@/store';
import type { UserInfo, UserTenant } from '@/types/interface';

const InitUserInfo: UserInfo = {
  name: '', // 用户名，用于展示在页面右上角头像旁
  roles: [], // 登录接口返回的角色
};

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '', // 默认空，未登录跳转登录页
    userInfo: { ...InitUserInfo },
    permissions: [] as string[], // 按钮权限标识
    tenantId: '',
    tenant: null as UserTenant | null, // 当前租户信息
    tenants: [] as UserTenant[],
    clients: [] as MyApp[], // 当前用户可用应用列表（jy-user 公共接口，按用户权限过滤）
    currentApp: null as MyApp | null, // 当前应用
  }),
  getters: {
    roles: (state) => {
      return state.userInfo?.roles;
    },
  },
  actions: {
    /** 账号密码登录（jy-user） */
    async login(userInfo: Record<string, unknown>) {
      const { account, password } = userInfo as { account?: string; password?: string };
      const data = await loginApi({ username: account, password });
      this.token = data.token;
      const user = data.user || {};
      const name = String(user.nickname || user.realname || user.username || '');
      this.userInfo = {
        name,
        roles: Array.from(data.roles || []),
      };
      this.permissions = Array.from(data.permissions || []);
      this.tenantId = data.tenantId || '';
      this.tenant = data.tenantDto || null;
      this.tenants = Array.isArray(data.tenantDtos) ? data.tenantDtos : [];
      await this.loadMyApps();
    },
    /** 切换租户（jy-user switch_tenant）：换发新 token，并重建当前租户的动态菜单 */
    async switchTenant(tenantId: string) {
      const data = await switchTenantApi(tenantId);
      this.token = data.token;
      const user = data.user || {};
      const name = String(user.nickname || user.realname || user.username || '');
      this.userInfo = {
        name,
        roles: Array.from(data.roles || []),
      };
      this.permissions = Array.from(data.permissions || []);
      this.tenantId = data.tenantId || '';
      this.tenant = data.tenantDto || null;
      this.tenants = Array.isArray(data.tenantDtos) ? data.tenantDtos : [];
      await this.loadMyApps();

      // 移除旧租户的动态路由，跳转首页触发路由守卫按新租户重建菜单
      const permissionStore = usePermissionStore();
      permissionStore.restoreRoutes();
      await router.push('/');
    },
    /** 获取用户信息：登录接口已返回，直接复用本地缓存 */
    /** 获取当前用户可用应用列表（jy-user 公共接口 system/user/apps，按用户权限过滤） */
    async loadMyApps() {
      try {
        const list = (await getMyApps()) || [];
        this.clients = list;
        // 当前应用不在列表中时，回退到默认应用或第一个应用

        if (!this.currentApp || !list.some((item) => item.clientId === this.currentApp?.clientId)) {
          const fallback = list.find((item) => item.clientId === CLIENT_ID) || list[0] || null;
          this.currentApp = fallback;
        }
      } catch (e: any) {
        // 接口未就绪时忽略，顶部切换器不展示；控制台提示便于排查

        console.warn('[user] 加载我的应用列表失败', e?.message || e);
        this.clients = [];
      }
    },

    /** 切换应用：同租户内不换 token，仅切换 clientId 上下文并重建菜单路由 */
    async switchApp(clientId: string) {
      const app = this.clients.find((item) => item.clientId === clientId);
      if (!app || app.clientId === this.currentApp?.clientId) return;
      this.currentApp = app;

      const permissionStore = usePermissionStore();
      permissionStore.restoreRoutes();
      const routeList = await permissionStore.buildAsyncRoutes();
      routeList.forEach((item: RouteRecordRaw) => {
        router.addRoute(item);
      });
      const target = routeList.find((item) => item.path && item.path !== '/:w+')?.path || '/';
      await router.push(target);
    },

    async getUserInfo() {
      // 页面刷新或恢复登录态时，应用列表为空则补拉一次（登录/切租户已拉取）

      if (this.token && this.clients.length === 0) {
        await this.loadMyApps();
      }
      return this.userInfo;
    },
    /** 退出登录（jy-user） */
    async logout() {
      try {
        await logoutApi();
      } catch {
        // 忽略退出接口异常，本地状态照常清理
      }
      this.token = '';
      this.userInfo = { ...InitUserInfo };
      this.permissions = [];
      this.tenantId = '';
      this.tenant = null;
      this.tenants = [];
      this.clients = [];
      this.currentApp = null;
    },
  },
  persist: {
    afterRestore: () => {
      const permissionStore = usePermissionStore();
      permissionStore.initRoutes();
    },
    key: 'user',
    paths: ['token', 'userInfo', 'permissions', 'tenantId', 'tenant', 'tenants', 'clients', 'currentApp'],
  },
});

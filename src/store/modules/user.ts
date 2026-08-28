import { defineStore } from 'pinia';

import { login as loginApi, logout as logoutApi, switchTenant as switchTenantApi } from '@/api/auth';
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
    tenants: [] as UserTenant[], // 当前用户可切换的租户列表
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

      // 移除旧租户的动态路由，跳转首页触发路由守卫按新租户重建菜单
      const permissionStore = usePermissionStore();
      permissionStore.restoreRoutes();
      await router.push('/');
    },
    /** 获取用户信息：登录接口已返回，直接复用本地缓存 */
    async getUserInfo() {
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
    },
  },
  persist: {
    afterRestore: () => {
      const permissionStore = usePermissionStore();
      permissionStore.initRoutes();
    },
    key: 'user',
    paths: ['token', 'userInfo', 'permissions', 'tenantId', 'tenant', 'tenants'],
  },
});

import { CLIENT_ID } from '@/constants';
import type { UserTenant } from '@/types/interface';
import { request } from '@/utils/request';

/** 登录返回 AuthInfo（jy-user） */
export interface AuthResult {
  token: string;
  exipreTime?: string;
  permissions: string[];
  roles: string[];
  user: {
    userId?: number;
    username?: string;
    realname?: string;
    nickname?: string;
    avatar?: string;
    [key: string]: unknown;
  };
  tenantId?: string;
  tenantDto?: UserTenant;
  tenantDtos?: UserTenant[];
}

/** 账号密码登录：/jy-user/system/auth/login */
export function login(payload: { username?: string; password?: string }) {
  return request.post<AuthResult>({
    url: '/jy-user/system/auth/login',
    data: {
      clientId: CLIENT_ID,
      grantType: 'password',
      username: payload.username,
      password: payload.password,
    },
  });
}

/** 退出登录：/jy-user/system/auth/logout */
export function logout() {
  return request.post({
    url: '/jy-user/system/auth/logout',
  });
}

/** 切换租户：/jy-user/system/auth/login (grantType=switch_tenant)，换发当前租户的新 token */
export function switchTenant(tenantId: string) {
  return request.post<AuthResult>({
    url: '/jy-user/system/auth/login',
    data: {
      clientId: CLIENT_ID,
      grantType: 'switch_tenant',
      tenantId,
    },
  });
}

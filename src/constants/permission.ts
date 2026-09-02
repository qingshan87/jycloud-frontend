/**
 * 按钮权限标识常量（与后端菜单表 perms 字段保持一致）
 * 以 2026-08-28 菜单权限数据为准
 */
export const PERM = {
  user: {
    create: 'jy-setting:user:create',
    update: 'jy-setting:user:update',
    delete: 'jy-setting:user:delete',
    resetPassword: 'jy-setting:user:resetPassword',
  },
  tenant: {
    create: 'jy-setting:tenant:create',
    update: 'jy-setting:tenant:update',
    delete: 'jy-setting:tenant:delete',
  },
  userTenant: {
    bind: 'jy-setting:user-tenant:bind',
    remove: 'jy-setting:user-tenant:remove',
  },
  tenantClient: {
    set: 'jy-setting:tenant-client:set',
  },
  role: {
    create: 'jy-setting:role:create',
    update: 'jy-setting:role:update',
    delete: 'jy-setting:role:delete',
  },
  menu: {
    create: 'jy-setting:menu:create',
    update: 'jy-setting:menu:update',
    delete: 'jy-setting:menu:delete',
  },
  client: {
    create: 'jy-setting:client:create',
    update: 'jy-setting:client:update',
    delete: 'jy-setting:client:delete',
    resetSecret: 'jy-setting:client:resetSecret',
  },
  dict: {
    create: 'jy-setting:dict:create',
    update: 'jy-setting:dict:update',
    delete: 'jy-setting:dict:delete',
  },

  ucenter: {
    user: {
      create: 'jy-ucenter:user:create',
      update: 'jy-ucenter:user:update',
      delete: 'jy-ucenter:user:delete',
      resetPassword: 'jy-ucenter:user:resetPassword',
      updateUsername: 'jy-ucenter:user:updateUsername',
    },
    role: {
      create: 'jy-ucenter:role:create',
      update: 'jy-ucenter:role:update',
      delete: 'jy-ucenter:role:delete',
    },
    dept: {
      create: 'jy-ucenter:dept:create',
      update: 'jy-ucenter:dept:update',
      delete: 'jy-ucenter:dept:delete',
    },
    userAuthority: {
      set: 'jy-ucenter:user-authority:set',
    },
  },
} as const;

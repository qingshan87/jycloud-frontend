import { useUserStore } from '@/store';

export type PermissionMode = 'all' | 'any';

export interface PermissionBindingValue {
  perms: string | string[];
  mode?: PermissionMode;
}

export type PermissionValue = string | string[] | PermissionBindingValue;

function normalizePerms(perms: string | string[]): string[] {
  if (!perms) return [];
  return (Array.isArray(perms) ? perms : [perms]).filter(Boolean);
}

/**
 * 判断当前用户是否拥有指定权限
 * @param perms 单个权限标识或权限标识数组
 * @param mode any：拥有任一即可；all：需要全部拥有
 */
export function hasPerm(perms: string | string[], mode: PermissionMode = 'any'): boolean {
  const userStore = useUserStore();
  const owned = userStore.permissions || [];
  // 超管通配
  if (owned.includes('*')) return true;

  const required = normalizePerms(perms);
  // 未配置权限标识视为不限制
  if (required.length === 0) return true;

  return mode === 'all'
    ? required.every((item) => owned.includes(item))
    : required.some((item) => owned.includes(item));
}

/** 拥有任一权限即通过 */
export function hasAnyPerm(perms: string | string[]): boolean {
  return hasPerm(perms, 'any');
}

/** 需要同时拥有全部权限 */
export function hasAllPerm(perms: string | string[]): boolean {
  return hasPerm(perms, 'all');
}

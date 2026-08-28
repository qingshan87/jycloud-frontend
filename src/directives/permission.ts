import type { Directive, DirectiveBinding } from 'vue';

import type { PermissionBindingValue, PermissionMode, PermissionValue } from '@/utils/permission';
import { hasPerm } from '@/utils/permission';

function normalize(binding: DirectiveBinding<PermissionValue>): {
  perms: string | string[];
  mode: PermissionMode;
} {
  const value = binding.value;
  if (typeof value === 'string' || Array.isArray(value)) {
    return { perms: value, mode: 'any' };
  }
  const v = value as PermissionBindingValue | undefined;
  return { perms: v?.perms ?? [], mode: v?.mode ?? 'any' };
}

/** 记录被移除元素的原位置，权限恢复时可按原位插回 */
const removedRecords = new WeakMap<HTMLElement, { parent: Node; next: Node | null }>();

function detachEl(el: HTMLElement) {
  if (!el.parentNode) return;
  removedRecords.set(el, { parent: el.parentNode, next: el.nextSibling });
  el.parentNode.removeChild(el);
}

function restoreEl(el: HTMLElement) {
  const record = removedRecords.get(el);
  if (!record) return;
  // Vue 重渲染后节点可能已被重新插入 DOM
  if (el.parentNode) {
    removedRecords.delete(el);
    return;
  }
  if (record.next && record.next.parentNode === record.parent) {
    record.parent.insertBefore(el, record.next);
  } else {
    record.parent.appendChild(el);
  }
  removedRecords.delete(el);
}

/**
 * 按钮/操作权限指令
 * 用法：
 *   v-permission="'jy-setting:user:create'"
 *   v-permission="['jy-setting:user:create', 'jy-setting:user:update']"
 *   v-permission="{ perms: ['jy-setting:user:create', 'jy-setting:user:update'], mode: 'all' }"
 */
export const permissionDirective: Directive<HTMLElement, PermissionValue> = {
  mounted(el, binding) {
    const { perms, mode } = normalize(binding);
    if (!hasPerm(perms, mode)) {
      detachEl(el);
    }
  },
  updated(el, binding) {
    const { perms, mode } = normalize(binding);
    if (hasPerm(perms, mode)) {
      restoreEl(el);
    } else {
      detachEl(el);
    }
  },
  unmounted(el) {
    removedRecords.delete(el);
  },
};

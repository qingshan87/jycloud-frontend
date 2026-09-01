import type { defineComponent } from 'vue';

import type { RouteMeta } from '@/types/interface';

export interface MenuListResult {
  list: Array<RouteItem>;
  /** 菜单树中提取的按钮权限标识（category=1 的 perms） */
  perms?: string[];
}

/** jy-user 菜单 VO（/system/user/router/menu 返回结构） */
export interface MenuVO {
  menuId: number;
  clientId?: string;
  parentId?: number;
  menuTitle: string;
  menuName?: string;
  path?: string;
  component?: string;
  perms?: string;
  icon?: string;
  /** 类型：0 菜单，1 按钮 */
  category?: number;
  /** 是否隐藏：1 隐藏，0 不隐藏 */
  hide?: number;
  sort?: number;
  status?: number;
  children?: MenuVO[];
}

export type Component<T = any> =
  ReturnType<typeof defineComponent> | (() => Promise<typeof import('*.vue')>) | (() => Promise<T>);

export interface RouteItem {
  path: string;
  name: string;
  component?: Component | string;
  components?: Component;
  redirect?: string;
  meta: RouteMeta;
  children?: Array<RouteItem>;
}

/** 当前用户可用应用（jy-user 公共接口 system/user/apps） */
export interface MyApp {
  clientId: string;
  appName: string;
  icon?: string;
  /** 0 内部系统 1 业务系统 2 外部系统 */
  category?: number;
  description?: string;
  website?: string;
  status?: number;
}

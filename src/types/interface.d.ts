import type { TabValue } from 'tdesign-vue-next';
import type { LocationQueryRaw, RouteRecordName } from 'vue-router';

export interface RouteMeta {
  title?: string | Record<string, string>;
  icon?: string;
  expanded?: boolean;
  orderNo?: number;
  hidden?: boolean;
  hiddenBreadcrumb?: boolean;
  single?: boolean;
  keepAlive?: boolean;
  frameSrc?: string;
  frameBlank?: boolean;
}

export interface MenuRoute {
  // TODO: menuitem 组件实际支持 string 类型但是类型错误，暂时使用 any 类型避免打包错误待组件类型修复
  path: any;
  title?: string | Record<string, string>;
  name?: string;
  icon?:
    | string
    | {
        render: () => void;
      };
  redirect?: string;
  children: MenuRoute[];
  meta: RouteMeta;
}

export type ModeType = 'dark' | 'light';

export interface UserInfo {
  name: string;
  roles: string[];
}

/** 用户关联的租户信息（jy-user t_user_tenant / t_tenant） */
export interface UserTenant {
  id?: number;
  tenantId?: string;
  userId?: number;
  /** 是否默认租户：0 否，1 是 */
  ifDefault?: number;
  /** 是否 C 端用户：0 否，1 是 */
  consumer?: number;
  /** 是否 B 端用户：0 否，1 是 */
  manager?: number;
  /** 用户在租户中的状态：0 禁用 1 正常 */
  status?: number;
  tenantName?: string;
  tenantStatus?: number;
  [key: string]: unknown;
}

export interface NotificationItem {
  id: string;
  content: string;
  type: string;
  status: boolean;
  collected: boolean;
  date: string;
  quality: string;
}

export interface TRouterInfo {
  path: string;
  query?: LocationQueryRaw;
  routeIdx?: number;
  title?: string;
  name?: RouteRecordName;
  isAlive?: boolean;
  isHome?: boolean;
  meta?: any;
}

export interface TTabRouterType {
  isRefreshing: boolean;
  tabRouterList: Array<TRouterInfo>;
}

export interface TTabRemoveOptions {
  value: TabValue;
  index: number;
  e: MouseEvent;
}

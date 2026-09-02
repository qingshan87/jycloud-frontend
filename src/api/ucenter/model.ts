/** 用户中心（jy-ucenter）模型 */

/** 用户分页查询 */
export interface UcenterUserQuery {
  pageNum: number;
  pageSize: number;
  username?: string;
  realname?: string;
  mobile?: string;
  status?: string;
}

/** 用户表单 */
export interface UcenterUserForm {
  userId?: number;
  username?: string;
  realname?: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  mobile?: string;
  idCardNo?: string;
  ssex?: number;
  birthday?: string;
  description?: string;
  status?: number;
}

/** 用户视图 */
export interface UcenterUserVO {
  userId: number;
  username?: string;
  realname?: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  mobile?: string;
  idCardNo?: string;
  ssex?: number;
  birthday?: string;
  description?: string;
  deptId?: number;
  lastLoginIp?: string;
  status?: number;
  userTenantStatus?: number;
  createTime?: string;
  updateTime?: string;
  roles?: Array<{ roleId: number; roleName: string }>;
}

/** 角色分页查询 */
export interface UcenterRoleQuery {
  pageNum: number;
  pageSize: number;
  roleName?: string;
  readonly?: number;
  status?: number;
}

/** 角色表单 */
export interface UcenterRoleForm {
  roleId?: number;
  roleName?: string;
  remark?: string;
  sort?: number;
  status?: number;
  menuIds?: number[];
}

/** 角色视图 */
export interface UcenterRoleVO {
  roleId: number;
  roleName?: string;
  remark?: string;
  sort?: number;
  readonly?: number;
  status?: number;
  tenantId?: string;
  createTime?: string;
  updateTime?: string;
  menuIds?: number[];
}

/** 部门视图 */
export interface UcenterDeptVO {
  deptId: number;
  parentId?: number;
  deptName?: string;
  sort?: number;
  remark?: string;
  status?: number;
  tenantId?: string;
  createTime?: string;
  updateTime?: string;
  children?: UcenterDeptVO[];
}

/** 部门表单 */
export interface UcenterDeptForm {
  deptId?: number;
  parentId?: number;
  deptName?: string;
  sort?: number;
  remark?: string;
  status?: number;
}

/** 菜单树节点（jy-ucenter menu/tree） */
export interface UcenterMenuVO {
  menuId: number;
  clientId?: string;
  parentId?: number;
  menuTitle?: string;
  menuName?: string;
  path?: string;
  component?: string;
  perms?: string;
  icon?: string;
  category?: number;
  hide?: number;
  sort?: number;
  status?: number;
  children?: UcenterMenuVO[];
}

/** 用户授权（角色/菜单） */
export interface UserAuthorityForm {
  userId: number;
  dataIds: number[];
}

/** 租户绑定应用及其菜单树（jy-ucenter menu/tree 按应用分组返回） */
export interface TenantClientMenuVO {
  id?: number;
  tenantId?: string;
  clientId: string;
  /** 租户-应用绑定状态：0 禁用 1 启用 */
  status?: number;
  appName?: string;
  /** 0 内部系统 1 业务系统 2 外部系统 */
  category?: number;
  icon?: string;
  description?: string;
  website?: string;
  /** 应用自身状态 */
  clientStatus?: number;
  menuList?: UcenterMenuVO[];
}

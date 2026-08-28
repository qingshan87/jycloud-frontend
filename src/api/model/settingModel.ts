/** 后端 MyBatis-Plus 分页返回 */
export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
  [key: string]: unknown;
}

// ==================== 用户 ====================
export interface SettingUser {
  userId: number;
  unionid?: string;
  username: string;
  realname?: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  mobile?: string;
  idCardNo?: string;
  /** 0保密 1男 2女 */
  ssex?: number;
  birthday?: string;
  description?: string;
  deptId?: number;
  lastLoginIp?: string;
  /** 0禁用 1启用 */
  status?: number;
  /** 用户在租户中的状态: 0禁用 1正常 */
  userTenantStatus?: number;
  roles?: Array<{
    roleId: number;
    roleName: string;
    readonly?: number;
    status?: number;
    tenantId?: string;
  }>;
  createTime?: string;
  updateTime?: string;
}

export interface UserQuery {
  pageNum: number;
  pageSize: number;
  username?: string;
  realname?: string;
  mobile?: string;
  idCardNo?: string;
  ssex?: string;
  status?: string;
  sortField?: string;
  sortOrder?: string;
}

export interface UserForm {
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
  /** 仅 setting 平台按指定租户创建用户时使用 */
  tenantId?: string;
}

// ==================== 角色 ====================
export interface SettingRole {
  roleId: number;
  roleName: string;
  remark?: string;
  sort?: number;
  /** 0普通 1内置 */
  readonly?: number;
  status?: number;
  tenantId?: string;
  menuIds?: number[];
  createTime?: string;
  updateTime?: string;
}

export interface RoleQuery {
  pageNum: number;
  pageSize: number;
  tenantId?: string;
  roleName?: string;
  readonly?: number;
  status?: number;
  sortField?: string;
  sortOrder?: string;
}

export interface RoleForm {
  roleId?: number;
  roleName?: string;
  remark?: string;
  sort?: number;
  status?: number;
  tenantId?: string;
  menuIds?: number[];
}

// ==================== 菜单 ====================
export interface SettingMenu {
  menuId: number;
  clientId?: string;
  parentId?: number;
  menuTitle?: string;
  menuName?: string;
  path?: string;
  component?: string;
  perms?: string;
  icon?: string;
  /** 0菜单 1按钮 */
  category?: number;
  /** 1隐藏 0不隐藏 */
  hide?: number;
  sort?: number;
  status?: number;
  children?: SettingMenu[];
  createTime?: string;
  updateTime?: string;
}

export interface MenuForm {
  menuId?: number;
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
}

// ==================== 租户 ====================
export interface SettingTenant {
  id: number;
  tenantId: string;
  tenantName: string;
  domain?: string;
  linkman?: string;
  contactTel?: string;
  address?: string;
  status?: number;
  createTime?: string;
  updateTime?: string;
}

export interface TenantForm {
  id?: number;
  tenantName?: string;
  domain?: string;
  linkman?: string;
  contactTel?: string;
  address?: string;
  status?: number;
}

export interface TenantQuery {
  pageNum: number;
  pageSize: number;
  tenantId?: string;
  tenantName?: string;
  domain?: string;
  linkman?: string;
  status?: number;
  sortField?: string;
  sortOrder?: string;
}

// ==================== 应用 ====================
export interface SettingClient {
  id: number;
  clientId: string;
  parentId?: string;
  /** 0内部系统 1业务系统 2外部系统 */
  category?: number;
  icon?: string;
  appName: string;
  appKey?: string;
  appSecret?: string;
  salt?: string;
  description?: string;
  website?: string;
  legalIp?: string;
  status?: number;
  createTime?: string;
  updateTime?: string;
}

export interface ClientQuery {
  pageNum: number;
  pageSize: number;
  clientId?: string;
  category?: number;
  appName?: string;
  status?: number;
  sortField?: string;
  sortOrder?: string;
}

export interface ClientForm {
  id?: number;
  appName?: string;
  category?: number;
  icon?: string;
  description?: string;
  website?: string;
  legalIp?: string;
  status?: number;
}

// ==================== 租户-应用 ====================
export interface TenantClient {
  id: number;
  tenantId: string;
  clientId: string;
  /** 绑定状态 0禁用 1启用 */
  status?: number;
  appName?: string;
  category?: number;
  icon?: string;
  description?: string;
  website?: string;
  clientStatus?: number;
}

export interface TenantClientForm {
  tenantId: string;
  clientId: string;
  status?: number;
}

// ==================== 字典 ====================
export interface DictVO {
  dictId: number;
  /** 父主键, 0表示顶级字典类型 */
  parentId?: number;
  /** 字典码（类型唯一，子项继承父类型） */
  code?: string;
  /** 字典值（仅子项填写） */
  dictKey?: string;
  /** 字典名称（类型名称/字典项显示名） */
  dictValue: string;
  sort?: number;
  remark?: string;
  /** 0禁用 1启用 */
  status?: number;
  createTime?: string;
  updateTime?: string;
  children?: DictVO[];
}

export interface DictQuery {
  pageNum: number;
  pageSize: number;
  code?: string;
  dictValue?: string;
  sortField?: string;
  sortOrder?: string;
}

export interface DictForm {
  dictId?: number;
  /** 父主键, 0表示顶级字典类型 */
  parentId?: number;
  /** 字典码（类型创建时必填，编辑不可修改） */
  code?: string;
  /** 字典值（仅字典项填写） */
  dictKey?: string;
  /** 字典名称 */
  dictValue?: string;
  sort?: number;
  remark?: string;
  status?: number;
}

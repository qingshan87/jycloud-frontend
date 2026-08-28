# 设置平台接口约定

设置平台所有业务接口统一走 `jy-setting` 服务，由网关路由 `/jy-setting/**` 转发（开发环境 Vite 代理前缀 `/api`），
仅认证与动态菜单使用 `jy-user` 公共接口（`/jy-user/system/auth/*`、`/jy-user/system/user/router/menu`）。

统一返回结构：`{ code, msg, data }`，`code === 200` 为成功；分页数据为 MyBatis-Plus `IPage` 结构
（`records / total / size / current / pages`）。

| 模块 | 接口 | 说明 |
| --- | --- | --- |
| 用户管理 | `POST /jy-setting/system/user/create` | 新增用户，`tenantId` 可选（指定租户创建时传） |
| | `POST /jy-setting/system/user/update` | 修改用户（用户名不可改） |
| | `GET /jy-setting/system/user/page/system?tenantId=` | 平台用户分页，`tenantId` 可选，传了即按租户过滤（设置平台用户管理页使用） |
| | `GET /jy-setting/system/user/page/tenant?tenantId=` | 租户内用户分页，`tenantId` 必传（租户详情-用户管理 tab 使用） |
| | `POST /jy-setting/system/user/delete/{userId}` | 删除用户（逻辑删除） |
| | `POST /jy-setting/system/user/password/reset?userIds=1,2` | 重置密码为 123456 |
| | `POST /jy-setting/system/user-role/set` | 设置用户角色 `{ userId, tenantId, roleIds }` |
| | `GET /jy-setting/system/user-role/list?userId=&tenantId=` | 查询用户角色 ID 集合 |
| 角色管理 | `GET /jy-setting/system/role/page` | 角色分页，支持 `tenantId` 过滤 |
| | `GET /jy-setting/system/role/detail/{roleId}` | 角色详情（含 `menuIds`） |
| | `POST /jy-setting/system/role/create` | 创建管理员角色（tenant_admin / client_admin） |
| | `POST /jy-setting/system/role/update` | 修改管理员角色 |
| | `POST /jy-setting/system/role/delete/{roleId}` | 删除角色（内置角色不允许） |
| 菜单管理 | `GET /jy-setting/system/menu/tree/{clientId}` | 应用菜单树 |
| | `POST /jy-setting/system/menu/create` | 新增菜单/按钮 |
| | `POST /jy-setting/system/menu/update` | 修改菜单/按钮 |
| | `POST /jy-setting/system/menu/delete/{menuId}` | 删除菜单/按钮（有子节点不允许） |
| 租户管理 | `GET /jy-setting/system/tenant/page` | 租户分页 |
| | `POST /jy-setting/system/tenant/create` | 新增租户（自动生成租户ID与租户管理员角色） |
| | `POST /jy-setting/system/tenant/update` | 修改租户 |
| | `POST /jy-setting/system/tenant/delete/{id}` | 删除租户（默认租户不允许） |
| 租户-应用 | `GET /jy-setting/system/tenant-client/list/{tenantId}` | 租户已绑定应用 |
| | `POST /jy-setting/system/tenant-client/bind` | 绑定应用 `{ tenantId, clientId, status }` |
| | `POST /jy-setting/system/tenant-client/unbind/{id}` | 移除绑定 |
| 应用管理 | `GET /jy-setting/system/client/page` | 应用分页 |
| | `POST /jy-setting/system/client/create` | 新增应用（clientId/appKey/appSecret 后端生成） |
| | `POST /jy-setting/system/client/update` | 修改应用 |
| | `POST /jy-setting/system/client/reset-secret/{id}` | 重置秘钥（返回最新 AppKey/AppSecret） |
| | `POST /jy-setting/system/client/delete/{id}` | 删除应用（内置平台不允许） |
| 字典管理 | `GET /jy-setting/system/dict/page?code=&dictValue=` | 字典类型分页（含多级子字典项） |
| | `GET /jy-setting/system/dict/{dictId}` | 字典详情 |
| | `GET /jy-setting/system/dict/get-by-code/{code}` | 按字典码查询字典树（业务系统下拉数据源） |
| | `POST /jy-setting/system/dict/create` | 新增字典类型/字典项（类型 code 必填且唯一；子项 dictKey 必填，code 继承父类型） |
| | `POST /jy-setting/system/dict/update` | 修改字典（字典项 code/parentId 不可修改） |
| | `POST /jy-setting/system/dict/delete/{dictId}` | 删除字典（级联删除子字典项） |

> 后端新增的 setting 接口位于 `jycloud/web/jy-setting` 的 `UserController`，
> 用户按指定租户创建/查询复用 `UserService.createForTenant` / `pageByTenantId`。

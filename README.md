# JYCloud 前端基础框架（td_base）

基于 TDesign Vue Next Starter 的前端基础框架，保留原版侧边菜单、顶栏、主题设置、多语言等 UI 能力，集成 jy-user 服务的登录与用户动态菜单接口，供设置平台（setting）、用户中心（ucenter）及后续业务系统复用。

## 已集成能力

- 登录：调用 jy-user 认证接口（`/jy-user/system/auth/login`、`/jy-user/system/auth/logout`）
- 用户动态菜单：登录后调用 `/jy-user/system/user/router/menu` 获取当前用户菜单树，动态生成路由与侧边栏
- 请求头：每个请求自动携带 `clientId`（取 `VITE_CLIENT_ID`）与 `Authorization` token，与后端 `HeaderConstant` 约定一致
- 接口前缀：请求统一拼接 `VITE_API_URL_PREFIX`（默认 `/api`），开发环境由 Vite 代理剥离前缀后转发到网关

## 快速开始

```bash
npm install
npm run dev
```

开发服务器默认 `http://localhost:3002`，`/api` 前缀请求代理到网关（默认 `http://localhost:9000`，可用 `VITE_GATEWAY` 调整）。

## 环境变量

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `VITE_BASE_URL` | 打包路径 | `/` |
| `VITE_IS_REQUEST_PROXY` | 是否走 Vite 代理 | `true` |
| `VITE_API_URL` | 直连后端地址（走代理时留空） | 空 |
| `VITE_API_URL_PREFIX` | 接口前缀 | `/api` |
| `VITE_GATEWAY` | 本地开发代理的网关地址 | `http://localhost:9000` |
| `VITE_CLIENT_ID` | 当前应用客户端 ID | `jy-setting` |

> 生产部署时 Nginx 需将 `/api/` 前缀剥离后转发到网关，例如 `location /api/ { proxy_pass http://gateway:9000/; }`。

## 动态菜单约定

后端菜单（`MenuVO`）字段：

- `path`：路由路径（如 `/setting/tenant`）
- `component`：页面组件，对应 `src/pages` 下文件（如 `system/tenant/index`，也兼容 `system/tenant` 自动补 `index`）
- `category`：0 菜单 / 1 按钮（按钮不生成路由）
- `hide`：1 隐藏（保留路由但侧边栏不展示）
- `icon`：TDesign 图标名
- `sort`：菜单排序
- `children`：子菜单

派生业务系统在设置平台维护菜单后，用户登录即可看到对应侧边菜单并访问页面；尚未实现的页面组件会回退到异常页。

## 设置平台模块

基于以上动态菜单约定，本仓库已实现设置平台的核心管理页面，接口统一走 `jy-setting` 服务（开发环境前缀 `/api/jy-setting/**`）：

| 模块 | 页面 | 功能 |
| --- | --- | --- |
| 用户管理 | `src/pages/system/user/index.vue` | 全平台用户查询、新增、编辑、重置密码、删除 |
| 租户管理 | `src/pages/system/tenant/index.vue` | 租户增删改查；详情抽屉内提供该租户的「用户管理」「应用管理」 |
| 角色管理 | `src/pages/system/role/index.vue` | 按租户维护管理员角色（tenant_admin / client_admin）并授权菜单 |
| 菜单管理 | `src/pages/system/menu/index.vue` | 按应用维护菜单树（菜单/按钮），组件路径对应 `src/pages` |
| 应用管理 | `src/pages/system/client/index.vue` | 业务系统增删改查、重置秘钥 |
| 字典管理 | `src/pages/system/dict/index.vue` | 维护字典类型与字典项，供各业务系统下拉等场景复用 |

页面访问依赖后端 `t_menu` 中配置的菜单（`client_id = 1111`），组件路径如 `system/user/index`。
初始化菜单可直接执行 [docs/setting-menu.sql](docs/setting-menu.sql)，接口约定见 [docs/setting-api.md](docs/setting-api.md)。

## 目录结构

```text
src/
├─ api/                  # 接口层（auth、permission、setting 管理模块）
│   └─ setting/          # 设置平台接口（user/role/menu/tenant/tenantClient/client）
├─ layouts/              # 原版布局（侧边栏、顶栏、设置面板等）
├─ pages/                # 页面（登录、工作台、示例页、system 管理模块）
├─ router/               # 静态路由模块
├─ store/modules/        # user（登录态）、permission（动态菜单）等
├─ utils/request/        # axios 封装（前缀、token、clientId）
└─ utils/route/          # 菜单转路由
```

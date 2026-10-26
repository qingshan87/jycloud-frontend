# JYCloud 前端控制台（jycloud-frontend）

JYCloud 统一前端控制台：一套前端承载平台全部系统（用户中心、设置平台及后续业务系统），通过「应用切换 + 租户切换」按当前上下文动态刷新菜单、权限与应用品牌信息，避免为每个业务系统重复开发前端。

技术栈：Vue 3 + TypeScript + Vite + TDesign Vue Next + Pinia + Vue Router + Vue I18n + Axios + ECharts。

## 已实现功能

- 认证：账号密码登录、退出、切换租户（对接 jy-user 认证中心）。
- 用户中心：我的应用、个人资料、账号安全页面（对接 jy-ucenter 服务），作为登录后的默认系统。
- 动态菜单与路由：登录后调用 `/jy-user/system/user/router/menu` 获取当前用户菜单树，动态生成路由与侧边栏。
- 按钮级权限控制：`PERM` 权限标识常量 + `hasPerm` 判断 + 全局 `v-permission` 指令，权限标识来自登录响应与菜单树合并。
- 设置平台管理模块：用户、租户（含租户用户/应用）、角色、菜单、应用、字典的完整管理页面。
- 日志管理：登录日志、操作日志、API 调用日志、错误日志的条件分页查询与详情查看。
- 布局与品牌：侧边栏/顶栏/混合布局、主题色、明暗模式、多语言、多标签页。
- 外链支持：菜单可配置为 iframe 内嵌（`frameSrc`）或新窗口打开（`frameBlank`）。
- 请求层：自动携带 `Authorization` 与 `clientId` 请求头，接口统一 `/api` 前缀，开发环境由 Vite 代理到网关。

## 架构规划：多应用控制台

当前前端仍以单个应用（设置平台）运行，`clientId` 来自编译期环境变量 `VITE_CLIENT_ID`。规划目标如下：

### 认证与上下文约定

- token 只绑定「用户 + 租户」，`clientId` 不进入 token，仅作为请求头中的应用上下文。
- 同租户切换应用：不换 token，仅更新当前应用（`clientId` 请求头），刷新菜单路由与按钮权限。
- 跨租户切换：入口收敛在用户中心应用内；切换时换发 token、刷新该租户可用应用列表，并回退到新租户的默认应用。
- 外部系统：后端签发短时效、一次性授权码（ticket），前端拼接到外部链接后新窗口打开；内部/业务系统均为本平台自有系统，走应用切换，不使用 URL token。

### 待后端配合的接口

- 登录响应返回当前用户可用应用列表（含应用名称、图标、首页路径）。
- 提供按应用切换上下文的接口（或按 `clientId` 重新拉取菜单与权限）。
- 提供授权码签发与校验接口（绑定用户、租户、目标应用）。

### 前端演进点

- `clientId` 从编译期常量改为 store 中的「当前应用」状态，请求头动态读取。
- 布局左上/左下角的系统名称与 Logo 由 `currentApp` 驱动，随应用切换自动更新。
- 页面组件按应用目录组织（如 `src/pages/setting/**`、`src/pages/biz/**`），路由 name 加应用前缀避免冲突。
- `PERM` 常量按应用分组扩展（如 `PERM.setting.user.create`、`PERM.biz.order.create`）。

## 快速开始

```bash
npm install
npm run dev
```

开发服务器默认 `http://localhost:3002`，`/api` 前缀请求代理到网关（默认 `http://localhost:9000`，可用 `VITE_GATEWAY` 调整）。

```bash
npm run build        # 类型检查 + 生产构建
npm run build:test   # 测试环境构建
npm run lint         # ESLint 检查
npm run stylelint    # Stylelint 检查
```

## 环境变量

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `VITE_BASE_URL` | 打包路径 | `/` |
| `VITE_IS_REQUEST_PROXY` | 是否启用 Vite 代理 | `true` |
| `VITE_API_URL` | 直连后端地址（走代理时留空） | 空 |
| `VITE_API_URL_PREFIX` | 接口前缀 | `/api` |
| `VITE_GATEWAY` | 本地开发代理网关地址 | `http://localhost:9000` |
| `VITE_CLIENT_ID` | 默认应用 clientId（初始登录与兜底，默认进入用户中心） | `1112` |
| `VITE_APP_TITLE` | 全局标题 | JYCloud 前端控制台 |

> 真实环境变量文件（`.env*`）不入库，模板见 [.env.example](.env.example)，复制后按环境填写。

> 生产部署时，Nginx 需将 `/api/` 前缀剥离后转发到网关，例如 `location /api/ { proxy_pass http://gateway:9000/; }`。

## 动态菜单约定

后端菜单（`MenuVO`）字段：

- `path`：路由路径（如 `/setting/tenant`）。
- `component`：页面组件，对应 `src/pages` 下文件（如 `setting/tenant/index`，兼容省略 `/index`）。
- `category`：0 菜单 / 1 按钮（按钮不生成路由，仅作为权限标识）。
- `perms`：权限标识，如 `jy-setting:user:create`。
- `hide`：1 隐藏（保留路由但侧边栏不展示）。
- `icon`：TDesign 图标名。
- `sort`：菜单排序。
- `children`：子菜单。

业务系统在设置平台维护菜单后，用户登录即可看到对应侧边栏并访问页面；尚未实现的页面组件会回退到异常页。

## 按钮权限控制

- 权限标识集中维护在 `src/constants/permission.ts` 的 `PERM` 常量中。
- 页面按钮通过 `v-permission="PERM.xxx.yyy"` 控制显隐。
- 新增/变更权限只需修改常量并在对应按钮挂指令，判断逻辑为数据驱动，无需改动指令与工具函数。

## 设置平台模块

| 模块 | 页面 | 功能 |
| --- | --- | --- |
| 用户管理 | `src/pages/setting/user/index.vue` | 全平台用户查询、新增、编辑、重置密码、删除 |
| 租户管理 | `src/pages/setting/tenant/index.vue` | 租户增删改查；详情抽屉内提供该租户的「用户管理」「应用管理」 |
| 角色管理 | `src/pages/setting/role/index.vue` | 按租户维护管理员角色（tenant_admin / client_admin）并授权菜单 |
| 菜单管理 | `src/pages/setting/menu/index.vue` | 按应用维护菜单树（菜单/按钮），组件路径对应 `src/pages` |
| 应用管理 | `src/pages/setting/client/index.vue` | 业务系统增删改查、重置密钥 |
| 字典管理 | `src/pages/setting/dict/index.vue` | 维护字典类型与字典项，供各业务系统复用 |
| 登录日志 | `src/pages/setting/log/login/index.vue` | 按租户、账号、结果、登录方式、IP、终端和时间范围分页查询 |
| 操作日志 | `src/pages/setting/log/operation/index.vue` | 查询业务操作结果、请求上下文、耗时、参数与返回值 |
| API 日志 | `src/pages/setting/log/api/index.vue` | 查询跨服务 API 调用、响应码、耗时和响应数据 |
| 错误日志 | `src/pages/setting/log/error/index.vue` | 查询异常信息、请求参数和完整异常堆栈 |

页面访问依赖后端 `t_menu` 中配置的菜单（`client_id = 1111`）。初始化菜单可直接执行 [docs/setting-menu.sql](docs/setting-menu.sql)，接口约定见 [docs/setting-api.md](docs/setting-api.md)。

全新环境可执行 [docs/setting-log-menu.sql](docs/setting-log-menu.sql)。如果数据库中已经存在“日志管理”父菜单但层级或子菜单不完整，请执行可重复运行的 [docs/setting-log-menu-fix.sql](docs/setting-log-menu-fix.sql)。

## 目录结构

```text
src/
├── api/                  # 接口层（auth、permission、setting 管理模块）
│   ├── setting/          # 设置平台接口（user/role/menu/tenant/tenantClient/client/dict）
│   └── model/            # 接口类型定义
├── constants/            # 常量（含 PERM 按钮权限标识）
├── directives/           # 自定义指令（v-permission）
├── layouts/              # 布局（侧边栏、顶栏、iframe 容器、设置面板）
├── pages/                # 页面（登录、工作台、system 管理模块等）
├── router/               # 静态路由模块
├── store/modules/        # user（登录态）、permission（动态菜单）等
├── utils/                # request、route、permission 等工具
├── types/                # 全局类型
└── locales/              # 多语言
```

-- ============================================================
-- 设置平台（client 1111）初始菜单
-- 在 jy_cloud 库中执行，菜单 ID 由自增主键生成
-- 组件路径对应前端 src/pages 目录：
--   system/user/index  -> src/pages/system/user/index.vue
--   其余模块同理
-- ============================================================
INSERT INTO `t_menu`
  (`client_id`, `parent_id`, `menu_title`, `menu_name`, `path`, `component`, `perms`, `icon`, `category`, `hide`, `sort`, `status`, `create_uid`, `create_time`, `update_uid`, `update_time`, `delete_flag`)
VALUES
  ('1111', 0, '用户管理', 'SettingUser',   '/setting/user',   'system/user/index',   NULL, 'user-circle', 0, 0, 1, 1, 1, NOW(), 1, NOW(), 0),
  ('1111', 0, '租户管理', 'SettingTenant', '/setting/tenant', 'system/tenant/index', NULL, 'usergroup',   0, 0, 2, 1, 1, NOW(), 1, NOW(), 0),
  ('1111', 0, '角色管理', 'SettingRole',   '/setting/role',   'system/role/index',   NULL, 'secure',      0, 0, 3, 1, 1, NOW(), 1, NOW(), 0),
  ('1111', 0, '菜单管理', 'SettingMenu',   '/setting/menu',   'system/menu/index',   NULL, 'view-list',   0, 0, 4, 1, 1, NOW(), 1, NOW(), 0),
  ('1111', 0, '应用管理', 'SettingClient', '/setting/client', 'system/client/index', NULL, 'apps',        0, 0, 5, 1, 1, NOW(), 1, NOW(), 0),
  ('1111', 0, '字典管理', 'SettingDict',   '/setting/dict',   'system/dict/index',   NULL, 'data-base',   0, 0, 6, 1, 1, NOW(), 1, NOW(), 0);

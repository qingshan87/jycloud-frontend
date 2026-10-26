-- JYCloud 设置平台日志菜单
-- 使用前请确认 menu_id 1000-1004 未被占用；本脚本仅新增，不删除已有菜单。

INSERT INTO `t_menu`(
    `menu_id`, `client_id`, `parent_id`, `menu_title`, `menu_name`, `path`, `component`,
    `perms`, `icon`, `category`, `hide`, `sort`, `status`,
    `create_uid`, `create_time`, `update_uid`, `update_time`,
    `delete_flag`, `delete_time`, `delete_uid`
) VALUES
    (1000, '1111', 0, '日志管理', 'SettingLog', '/setting/log', 'LAYOUT', '', 'history', 0, 0, 7, 1,
     1, NOW(), 1, NOW(), 0, NULL, NULL),
    (1001, '1111', 1000, '登录日志', 'SettingLogLogin', '/setting/log/login', 'setting/log/login/index', '', 'login', 0, 0, 1, 1,
     1, NOW(), 1, NOW(), 0, NULL, NULL),
    (1002, '1111', 1000, '操作日志', 'SettingLogOperation', '/setting/log/operation', 'setting/log/operation/index', '', 'view-list', 0, 0, 2, 1,
     1, NOW(), 1, NOW(), 0, NULL, NULL),
    (1003, '1111', 1000, 'API 日志', 'SettingLogApi', '/setting/log/api', 'setting/log/api/index', '', 'api', 0, 0, 3, 1,
     1, NOW(), 1, NOW(), 0, NULL, NULL),
    (1004, '1111', 1000, '错误日志', 'SettingLogError', '/setting/log/error', 'setting/log/error/index', '', 'error-circle', 0, 0, 4, 1,
     1, NOW(), 1, NOW(), 0, NULL, NULL);

-- JYCloud 设置平台日志菜单修复脚本（MySQL 8.0+）
-- 适用于已存在“日志管理”父菜单但子菜单不完整的数据库。
-- 脚本可重复执行：自动定位父菜单，规范父菜单路径，并补齐四个子菜单。

START TRANSACTION;

-- 1. 定位已有日志父菜单；不存在时自动创建。
SET @log_parent_id = (
    SELECT `menu_id`
    FROM `t_menu`
    WHERE `client_id` = '1111'
      AND `parent_id` = 0
      AND `menu_title` = '日志管理'
      AND `delete_flag` = 0
    ORDER BY `menu_id`
    LIMIT 1
);

INSERT INTO `t_menu`(
    `client_id`, `parent_id`, `menu_title`, `menu_name`, `path`, `component`,
    `perms`, `icon`, `category`, `hide`, `sort`, `status`,
    `create_uid`, `create_time`, `update_uid`, `update_time`,
    `delete_flag`, `delete_time`, `delete_uid`
)
SELECT '1111', 0, '日志管理', 'SettingLog', '/setting/log', 'LAYOUT',
       '', 'system-log', 0, 0, 10, 1,
       1, NOW(), 1, NOW(),
       0, NULL, NULL
FROM DUAL
WHERE @log_parent_id IS NULL;

SET @log_parent_id = IFNULL(@log_parent_id, LAST_INSERT_ID());

UPDATE `t_menu`
SET `menu_title` = '日志管理',
    `menu_name` = 'SettingLog',
    `path` = '/setting/log',
    `component` = 'LAYOUT',
    `icon` = 'system-log',
    `category` = 0,
    `hide` = 0,
    `sort` = 10,
    `status` = 1,
    `update_time` = NOW(),
    `delete_flag` = 0
WHERE `menu_id` = @log_parent_id;

-- 2. 登录日志：修正现有节点并规范组件路径。
SET @child_exists = (
    SELECT COUNT(*)
    FROM `t_menu`
    WHERE `client_id` = '1111'
      AND `delete_flag` = 0
      AND (
          `path` = '/setting/log/login'
          OR (`parent_id` = @log_parent_id AND `menu_title` = '登录日志')
      )
);

INSERT INTO `t_menu`(
    `client_id`, `parent_id`, `menu_title`, `menu_name`, `path`, `component`,
    `perms`, `icon`, `category`, `hide`, `sort`, `status`,
    `create_uid`, `create_time`, `update_uid`, `update_time`,
    `delete_flag`, `delete_time`, `delete_uid`
)
SELECT '1111', @log_parent_id, '登录日志', 'SettingLogLogin', '/setting/log/login',
       'setting/log/login/index', '', 'login', 0, 0, 1, 1,
       1, NOW(), 1, NOW(), 0, NULL, NULL
FROM DUAL
WHERE @child_exists = 0;

UPDATE `t_menu`
SET `parent_id` = @log_parent_id,
    `menu_title` = '登录日志',
    `menu_name` = 'SettingLogLogin',
    `path` = '/setting/log/login',
    `component` = 'setting/log/login/index',
    `icon` = 'login',
    `category` = 0,
    `hide` = 0,
    `sort` = 1,
    `status` = 1,
    `update_time` = NOW(),
    `delete_flag` = 0
WHERE `client_id` = '1111'
  AND (
      `path` = '/setting/log/login'
      OR (`parent_id` = @log_parent_id AND `menu_title` = '登录日志')
  )
ORDER BY `menu_id`
LIMIT 1;

-- 3. 操作日志。
SET @child_exists = (
    SELECT COUNT(*)
    FROM `t_menu`
    WHERE `client_id` = '1111'
      AND `delete_flag` = 0
      AND (
          `path` = '/setting/log/operation'
          OR (`parent_id` = @log_parent_id AND `menu_title` = '操作日志')
      )
);

INSERT INTO `t_menu`(
    `client_id`, `parent_id`, `menu_title`, `menu_name`, `path`, `component`,
    `perms`, `icon`, `category`, `hide`, `sort`, `status`,
    `create_uid`, `create_time`, `update_uid`, `update_time`,
    `delete_flag`, `delete_time`, `delete_uid`
)
SELECT '1111', @log_parent_id, '操作日志', 'SettingLogOperation', '/setting/log/operation',
       'setting/log/operation/index', '', 'view-list', 0, 0, 2, 1,
       1, NOW(), 1, NOW(), 0, NULL, NULL
FROM DUAL
WHERE @child_exists = 0;

UPDATE `t_menu`
SET `parent_id` = @log_parent_id,
    `menu_title` = '操作日志',
    `menu_name` = 'SettingLogOperation',
    `path` = '/setting/log/operation',
    `component` = 'setting/log/operation/index',
    `icon` = 'view-list',
    `category` = 0,
    `hide` = 0,
    `sort` = 2,
    `status` = 1,
    `update_time` = NOW(),
    `delete_flag` = 0
WHERE `client_id` = '1111'
  AND (
      `path` = '/setting/log/operation'
      OR (`parent_id` = @log_parent_id AND `menu_title` = '操作日志')
  )
ORDER BY `menu_id`
LIMIT 1;

-- 4. API 日志。
SET @child_exists = (
    SELECT COUNT(*)
    FROM `t_menu`
    WHERE `client_id` = '1111'
      AND `delete_flag` = 0
      AND (
          `path` = '/setting/log/api'
          OR (`parent_id` = @log_parent_id AND `menu_title` = 'API 日志')
      )
);

INSERT INTO `t_menu`(
    `client_id`, `parent_id`, `menu_title`, `menu_name`, `path`, `component`,
    `perms`, `icon`, `category`, `hide`, `sort`, `status`,
    `create_uid`, `create_time`, `update_uid`, `update_time`,
    `delete_flag`, `delete_time`, `delete_uid`
)
SELECT '1111', @log_parent_id, 'API 日志', 'SettingLogApi', '/setting/log/api',
       'setting/log/api/index', '', 'api', 0, 0, 3, 1,
       1, NOW(), 1, NOW(), 0, NULL, NULL
FROM DUAL
WHERE @child_exists = 0;

UPDATE `t_menu`
SET `parent_id` = @log_parent_id,
    `menu_title` = 'API 日志',
    `menu_name` = 'SettingLogApi',
    `path` = '/setting/log/api',
    `component` = 'setting/log/api/index',
    `icon` = 'api',
    `category` = 0,
    `hide` = 0,
    `sort` = 3,
    `status` = 1,
    `update_time` = NOW(),
    `delete_flag` = 0
WHERE `client_id` = '1111'
  AND (
      `path` = '/setting/log/api'
      OR (`parent_id` = @log_parent_id AND `menu_title` = 'API 日志')
  )
ORDER BY `menu_id`
LIMIT 1;

-- 5. 错误日志。
SET @child_exists = (
    SELECT COUNT(*)
    FROM `t_menu`
    WHERE `client_id` = '1111'
      AND `delete_flag` = 0
      AND (
          `path` = '/setting/log/error'
          OR (`parent_id` = @log_parent_id AND `menu_title` = '错误日志')
      )
);

INSERT INTO `t_menu`(
    `client_id`, `parent_id`, `menu_title`, `menu_name`, `path`, `component`,
    `perms`, `icon`, `category`, `hide`, `sort`, `status`,
    `create_uid`, `create_time`, `update_uid`, `update_time`,
    `delete_flag`, `delete_time`, `delete_uid`
)
SELECT '1111', @log_parent_id, '错误日志', 'SettingLogError', '/setting/log/error',
       'setting/log/error/index', '', 'error-circle', 0, 0, 4, 1,
       1, NOW(), 1, NOW(), 0, NULL, NULL
FROM DUAL
WHERE @child_exists = 0;

UPDATE `t_menu`
SET `parent_id` = @log_parent_id,
    `menu_title` = '错误日志',
    `menu_name` = 'SettingLogError',
    `path` = '/setting/log/error',
    `component` = 'setting/log/error/index',
    `icon` = 'error-circle',
    `category` = 0,
    `hide` = 0,
    `sort` = 4,
    `status` = 1,
    `update_time` = NOW(),
    `delete_flag` = 0
WHERE `client_id` = '1111'
  AND (
      `path` = '/setting/log/error'
      OR (`parent_id` = @log_parent_id AND `menu_title` = '错误日志')
  )
ORDER BY `menu_id`
LIMIT 1;

COMMIT;

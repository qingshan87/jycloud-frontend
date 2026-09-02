// 合同状态枚举
export const CONTRACT_STATUS = {
  FAIL: 0,
  AUDIT_PENDING: 1,
  EXEC_PENDING: 2,
  EXECUTING: 3,
  FINISH: 4,
};

// 合同类型枚举
export const CONTRACT_TYPES = {
  MAIN: 0,
  SUB: 1,
  SUPPLEMENT: 2,
};

// 合同收付类型枚举
export const CONTRACT_PAYMENT_TYPES = {
  PAYMENT: 0,
  RECEIPT: 1,
};

// 标签类型
type TagTheme = 'default' | 'success' | 'primary' | 'warning' | 'danger';
// 通知的优先级对应的标签类型
export const NOTIFICATION_TYPES: Map<string, TagTheme> = new Map([
  ['low', 'primary'],
  ['middle', 'warning'],
  ['high', 'danger'],
]);

// 通用请求头
export enum ContentTypeEnum {
  Json = 'application/json;charset=UTF-8',
  FormURLEncoded = 'application/x-www-form-urlencoded;charset=UTF-8',
  FormData = 'multipart/form-data;charset=UTF-8',
}

// 当前应用客户端 ID，派生业务系统通过 VITE_CLIENT_ID 覆盖
export const CLIENT_ID: string = import.meta.env.VITE_CLIENT_ID || '1112';

// 用户中心 clientId（默认系统，登录后默认进入）
export const USER_CENTER_CLIENT_ID = '1112';

// 设置平台 clientId（与后端 UcConstant.SETTING_CLIENT_ID 一致）
export const SETTING_CLIENT_ID = '1111';

// 默认租户（系统租户）ID，与后端 TenantConstant.DEFAULT_TENANT_ID 一致
export const DEFAULT_TENANT_ID = '000000';

// 与后端 HeaderConstant.CLIENT_ID 保持一致
export const HEADER_CLIENT_ID = 'clientId';

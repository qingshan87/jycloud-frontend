import type { PageResult } from '@/api/setting/settingModel';

export interface LogPageQuery {
  pageNum: number;
  pageSize: number;
  beginTime?: string;
  endTime?: string;
  sortField?: string;
  sortOrder?: string;
}

export interface LoginLogQuery extends LogPageQuery {
  tenantId?: string;
  userId?: number;
  username?: string;
  /** 0失败 1成功 */
  type?: number;
  grantType?: string;
  ip?: string;
  browser?: string;
  location?: string;
}

export interface OperationLogQuery extends LogPageQuery {
  tenantId?: string;
  serviceId?: string;
  /** 0失败 1成功 */
  type?: number;
  username?: string;
  ip?: string;
  description?: string;
  classPath?: string;
  actionMethod?: string;
  requestUri?: string;
  httpMethod?: string;
  createUid?: number;
}

export interface ApiLogQuery extends LogPageQuery {
  requestId?: string;
  clientId?: string;
  tenantId?: string;
  serviceName?: string;
  /** 0失败 1成功 */
  type?: number;
  ip?: string;
  actionId?: string;
  description?: string;
  requestUri?: string;
  httpMethod?: string;
  responseCode?: number;
  clientName?: string;
}

export interface ErrorLogQuery extends LogPageQuery {
  tenantId?: string;
  serviceId?: string;
  username?: string;
  ip?: string;
  description?: string;
  classPath?: string;
  actionMethod?: string;
  requestUri?: string;
  httpMethod?: string;
  createUid?: number;
}

export interface LoginLog {
  id: number;
  tenantId?: string;
  userId?: number;
  username?: string;
  type?: number;
  grantType?: string;
  description?: string;
  loginTime?: string;
  ua?: string;
  browser?: string;
  browserVersion?: string;
  operatingSystem?: string;
  location?: string;
  ip?: string;
}

export interface OperationLog {
  id: number;
  tenantId?: string;
  serviceId?: string;
  type?: number;
  username?: string;
  ip?: string;
  description?: string;
  classPath?: string;
  actionMethod?: string;
  requestUri?: string;
  httpMethod?: string;
  params?: string;
  result?: string;
  exDetail?: string;
  startTime?: string;
  finishTime?: string;
  consumingTime?: number;
  ua?: string;
  createUid?: number;
  createTime?: string;
}

export interface ApiLog {
  id: number;
  requestId?: string;
  clientId?: string;
  tenantId?: string;
  serviceName?: string;
  type?: number;
  ip?: string;
  actionId?: string;
  description?: string;
  classPath?: string;
  actionMethod?: string;
  requestUri?: string;
  httpMethod?: string;
  params?: string;
  responseCode?: number;
  responseMsg?: string;
  responseData?: string;
  exDetail?: string;
  startTime?: string;
  finishTime?: string;
  costTime?: number;
  createTime?: string;
  clientName?: string;
}

export interface ErrorLog {
  id: number;
  tenantId?: string;
  serviceId?: string;
  username?: string;
  ip?: string;
  description?: string;
  classPath?: string;
  actionMethod?: string;
  requestUri?: string;
  httpMethod?: string;
  params?: string;
  exDetail?: string;
  ua?: string;
  createUid?: number;
  createTime?: string;
}

export type LoginLogPage = PageResult<LoginLog>;
export type OperationLogPage = PageResult<OperationLog>;
export type ApiLogPage = PageResult<ApiLog>;
export type ErrorLogPage = PageResult<ErrorLog>;

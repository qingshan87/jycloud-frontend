import type {
  ApiLogPage,
  ApiLogQuery,
  ErrorLogPage,
  ErrorLogQuery,
  LoginLogPage,
  LoginLogQuery,
  OperationLogPage,
  OperationLogQuery,
} from '@/api/setting/logModel';
import { request } from '@/utils/request';

const Api = {
  LoginPage: '/jy-setting/system/log/login/page',
  OperationPage: '/jy-setting/system/log/operation/page',
  ApiPage: '/jy-setting/system/log/api/page',
  ErrorPage: '/jy-setting/system/log/error/page',
};

/** 条件分页查询登录日志 */
export function pageLoginLogs(params: LoginLogQuery) {
  return request.get<LoginLogPage>({
    url: Api.LoginPage,
    params,
  });
}

/** 条件分页查询系统操作日志 */
export function pageOperationLogs(params: OperationLogQuery) {
  return request.get<OperationLogPage>({
    url: Api.OperationPage,
    params,
  });
}

/** 条件分页查询 API 调用日志 */
export function pageApiLogs(params: ApiLogQuery) {
  return request.get<ApiLogPage>({
    url: Api.ApiPage,
    params,
  });
}

/** 条件分页查询系统错误日志 */
export function pageErrorLogs(params: ErrorLogQuery) {
  return request.get<ErrorLogPage>({
    url: Api.ErrorPage,
    params,
  });
}

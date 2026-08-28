import type { PageResult, SettingTenant, TenantForm, TenantQuery } from '@/api/model/settingModel';
import { request } from '@/utils/request';

const Api = {
  Page: '/jy-setting/system/tenant/page',
  Create: '/jy-setting/system/tenant/create',
  Update: '/jy-setting/system/tenant/update',
  Detail: (id: number) => `/jy-setting/system/tenant/${id}`,
  Delete: (id: number) => `/jy-setting/system/tenant/delete/${id}`,
};

export function pageTenants(params: TenantQuery) {
  return request.get<PageResult<SettingTenant>>({
    url: Api.Page,
    params,
  });
}

export function createTenant(data: TenantForm) {
  return request.post<SettingTenant>({
    url: Api.Create,
    data,
  });
}

export function updateTenant(data: TenantForm) {
  return request.post<SettingTenant>({
    url: Api.Update,
    data,
  });
}

export function getTenant(id: number) {
  return request.get<SettingTenant>({
    url: Api.Detail(id),
  });
}

export function deleteTenant(id: number) {
  return request.post({
    url: Api.Delete(id),
  });
}

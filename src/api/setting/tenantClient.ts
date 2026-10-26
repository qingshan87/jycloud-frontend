import type { TenantClient, TenantClientForm } from '@/api/setting/settingModel';
import { request } from '@/utils/request';

const Api = {
  List: (tenantId: string) => `/jy-setting/system/tenant-client/list/${tenantId}`,
  Bind: '/jy-setting/system/tenant-client/bind',
  Unbind: (id: number) => `/jy-setting/system/tenant-client/unbind/${id}`,
};

export function listTenantClients(tenantId: string) {
  return request.get<TenantClient[]>({
    url: Api.List(tenantId),
  });
}

export function bindTenantClient(data: TenantClientForm) {
  return request.post({
    url: Api.Bind,
    data,
  });
}

export function unbindTenantClient(id: number) {
  return request.post({
    url: Api.Unbind(id),
  });
}

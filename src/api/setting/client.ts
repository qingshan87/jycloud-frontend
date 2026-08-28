import type { ClientForm, ClientQuery, PageResult, SettingClient } from '@/api/model/settingModel';
import { request } from '@/utils/request';

const Api = {
  Page: '/jy-setting/system/client/page',
  Create: '/jy-setting/system/client/create',
  Update: '/jy-setting/system/client/update',
  Detail: (id: number) => `/jy-setting/system/client/${id}`,
  Delete: (id: number) => `/jy-setting/system/client/delete/${id}`,
  ResetSecret: (id: number) => `/jy-setting/system/client/reset-secret/${id}`,
};

export function pageClients(params: ClientQuery) {
  return request.get<PageResult<SettingClient>>({
    url: Api.Page,
    params,
  });
}

export function createClient(data: ClientForm) {
  return request.post<SettingClient>({
    url: Api.Create,
    data,
  });
}

export function updateClient(data: ClientForm) {
  return request.post<SettingClient>({
    url: Api.Update,
    data,
  });
}

export function getClient(id: number) {
  return request.get<SettingClient>({
    url: Api.Detail(id),
  });
}

export function deleteClient(id: number) {
  return request.post({
    url: Api.Delete(id),
  });
}

/** 重置应用秘钥，返回最新的 appKey/appSecret */
export function resetClientSecret(id: number) {
  return request.post<SettingClient>({
    url: Api.ResetSecret(id),
  });
}

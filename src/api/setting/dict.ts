import type { DictForm, DictQuery, DictVO, PageResult } from '@/api/setting/settingModel';
import { request } from '@/utils/request';

const Api = {
  Page: '/jy-setting/system/dict/page',
  Create: '/jy-setting/system/dict/create',
  Update: '/jy-setting/system/dict/update',
  Detail: (dictId: number) => `/jy-setting/system/dict/${dictId}`,
  Delete: (dictId: number) => `/jy-setting/system/dict/delete/${dictId}`,
  GetByCode: (code: string) => `/jy-setting/system/dict/get-by-code/${code}`,
};

/** 条件分页查询字典类型列表（含多级子项） */
export function pageDicts(params: DictQuery) {
  return request.get<PageResult<DictVO>>({
    url: Api.Page,
    params,
  });
}

/** 新增字典类型/字典项 */
export function createDict(data: DictForm) {
  return request.post<DictVO>({
    url: Api.Create,
    data,
  });
}

/** 修改字典类型/字典项 */
export function updateDict(data: DictForm) {
  return request.post<DictVO>({
    url: Api.Update,
    data,
  });
}

/** 根据 ID 查询字典 */
export function getDict(dictId: number) {
  return request.get<DictVO>({
    url: Api.Detail(dictId),
  });
}

/** 根据字典码查询字典树（含多级子字典项，展开时按需加载） */
export function getDictTreeByCode(code: string) {
  return request.get<DictVO>({
    url: Api.GetByCode(code),
  });
}

/** 删除字典（级联删除子字典项） */
export function deleteDict(dictId: number) {
  return request.post({
    url: Api.Delete(dictId),
  });
}

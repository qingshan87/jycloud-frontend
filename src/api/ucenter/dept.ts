import { request } from '@/utils/request';

import type { UcenterDeptForm, UcenterDeptVO } from './model';

/** 用户中心（jy-ucenter）：部门管理 */
const Api = {
  Tree: '/jy-ucenter/system/dept/tree',
  Detail: (deptId: number) => `/jy-ucenter/system/dept/${deptId}`,
  Create: '/jy-ucenter/system/dept/create',
  Update: '/jy-ucenter/system/dept/update',
  Delete: (deptId: number) => `/jy-ucenter/system/dept/delete/${deptId}`,
};

export function treeUcenterDepts() {
  return request.get<UcenterDeptVO[]>({ url: Api.Tree });
}

export function getUcenterDept(deptId: number) {
  return request.get<UcenterDeptVO>({ url: Api.Detail(deptId) });
}

export function createUcenterDept(data: UcenterDeptForm) {
  return request.post<UcenterDeptVO>({ url: Api.Create, data });
}

export function updateUcenterDept(data: UcenterDeptForm) {
  return request.post<UcenterDeptVO>({ url: Api.Update, data });
}

export function deleteUcenterDept(deptId: number) {
  return request.post({ url: Api.Delete(deptId) });
}

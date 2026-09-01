import type { MyApp, PasswordForm, ProfileForm, UcenterProfile } from '@/api/model/ucenterModel';
import { request } from '@/utils/request';

/**
 * 用户中心（jy-ucenter）接口
 * 说明：路径按平台现有约定（/jy-<服务>/system/...）假定，后端按此提供；
 * 若实际接口不同，仅需调整本文件的 Api 常量。
 */
const Api = {
  Profile: '/jy-ucenter/system/profile',
  UpdateProfile: '/jy-ucenter/system/profile/update',
  UpdatePassword: '/jy-ucenter/system/password/update',
  MyApps: '/jy-ucenter/system/client/my',
};

/** 获取当前用户资料 */
export function getProfile() {
  return request.get<UcenterProfile>({
    url: Api.Profile,
  });
}

/** 保存当前用户资料 */
export function updateProfile(data: ProfileForm) {
  return request.post({
    url: Api.UpdateProfile,
    data,
  });
}

/** 修改当前用户密码 */
export function updatePassword(data: PasswordForm) {
  return request.post({
    url: Api.UpdatePassword,
    data,
  });
}

/** 获取当前租户下我的可用应用 */
export function getMyApps() {
  return request.get<MyApp[]>({
    url: Api.MyApps,
  });
}

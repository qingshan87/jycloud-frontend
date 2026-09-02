import type { PasswordDTO, UserProfileDTO, UserVO } from '@/api/model/userModel';
import { request } from '@/utils/request';

/** jy-user 公共接口：当前用户个人资料 / 密码 */
const Api = {
  UpdateProfile: '/jy-user/system/user/profile/update',
  UpdatePassword: '/jy-user/system/user/password/update',
};

/** 保存当前用户资料 */
export function updateProfile(data: UserProfileDTO) {
  return request.post({
    url: Api.UpdateProfile,
    data,
  });
}

/** 修改当前用户密码 */
export function updatePassword(data: PasswordDTO) {
  return request.post({
    url: Api.UpdatePassword,
    data,
  });
}

/** 获取当前用户完整资料（个人中心回显；不传 userId 时查询当前登录用户） */
export function getUserProfile(userId?: number) {
  return request.get<UserVO>({
    url: userId ? `/jy-user/system/user/${userId}` : '/jy-user/system/user',
  });
}

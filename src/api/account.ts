import type { PasswordDTO, UserProfileDTO } from '@/api/model/userModel';
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

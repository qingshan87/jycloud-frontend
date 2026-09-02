/** jy-user 公共模型 */

/** 当前用户资料保存（jy-user profile/update） */
export interface UserProfileDTO {
  avatar?: string;
  realname?: string;
  email?: string;
  mobile?: string;
  /** 0 保密 1 男 2 女 */
  ssex?: number;
  description?: string;
}

/** 修改密码（jy-user password/update） */
export interface PasswordDTO {
  oldPassword: string;
  newPassword: string;
}

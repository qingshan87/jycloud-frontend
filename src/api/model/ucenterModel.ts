/** 用户中心（jy-ucenter）模型定义 */

/** 当前用户资料 */
export interface UcenterProfile {
  userId?: number;
  username?: string;
  nickname?: string;
  realname?: string;
  avatar?: string;
  email?: string;
  mobile?: string;
  /** 0 保密 1 男 2 女 */
  ssex?: number;
  birthday?: string;
  description?: string;
  createTime?: string;
  updateTime?: string;
}

/** 保存资料表单 */
export interface ProfileForm {
  nickname?: string;
  realname?: string;
  avatar?: string;
  email?: string;
  mobile?: string;
  ssex?: number;
  birthday?: string;
  description?: string;
}

/** 修改密码参数 */
export interface PasswordForm {
  oldPassword: string;
  newPassword: string;
}

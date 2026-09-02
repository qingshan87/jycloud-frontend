<template>
  <t-dialog
    v-model:visible="visible"
    header="个人中心"
    :confirm-btn="{ content: '保存', loading: submitting }"
    cancel-btn="取消"
    width="560px"
    @confirm="handleSubmit"
  >
    <t-form ref="formRef" :data="form" :rules="rules" label-width="90px" @submit.prevent>
      <t-form-item label="用户名" name="username">
        <t-input :value="form.username" disabled />
      </t-form-item>
      <t-form-item label="昵称" name="nickname">
        <t-input :value="nickname" disabled />
      </t-form-item>
      <t-form-item label="真实姓名" name="realname">
        <t-input v-model="form.realname" placeholder="请输入真实姓名" clearable />
      </t-form-item>
      <t-form-item label="头像" name="avatar">
        <t-input v-model="form.avatar" placeholder="头像地址（可选）" clearable />
      </t-form-item>
      <t-form-item label="手机号" name="mobile">
        <t-input v-model="form.mobile" placeholder="请输入手机号" clearable />
      </t-form-item>
      <t-form-item label="邮箱" name="email">
        <t-input v-model="form.email" placeholder="请输入邮箱" clearable />
      </t-form-item>
      <t-form-item label="性别" name="ssex">
        <t-radio-group v-model="form.ssex">
          <t-radio :value="0">保密</t-radio>
          <t-radio :value="1">男</t-radio>
          <t-radio :value="2">女</t-radio>
        </t-radio-group>
      </t-form-item>
      <t-form-item label="个人简介" name="description">
        <t-textarea v-model="form.description" :maxlength="200" placeholder="介绍一下自己" />
      </t-form-item>
    </t-form>
  </t-dialog>
</template>
<script setup lang="ts">
import type { FormInstanceFunctions, FormRule } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { reactive, ref, watch } from 'vue';

import { getUserProfile, updateProfile } from '@/api/account';
import type { UserProfileDTO } from '@/api/model/userModel';
import { useUserStore } from '@/store';

defineOptions({ name: 'ProfileDialog' });

const visible = defineModel<boolean>('visible', { default: false });

const userStore = useUserStore();

const formRef = ref<FormInstanceFunctions>();
const submitting = ref(false);
const nickname = ref('');
const form = reactive<UserProfileDTO & { username?: string }>({
  username: '',
  realname: '',
  avatar: '',
  mobile: '',
  email: '',
  ssex: 0,
  description: '',
});

const rules: Record<string, FormRule[]> = {
  mobile: [{ required: true, message: '请输入手机号', type: 'error' }],
  email: [{ email: true, message: '邮箱格式不正确', type: 'error' }],
};

const loadProfile = async () => {
  Object.assign(form, {
    username: userStore.userInfo.username || userStore.userInfo.name,
    realname: userStore.userInfo.realname || '',
    avatar: userStore.userInfo.avatar || '',
    mobile: userStore.userInfo.mobile || '',
    email: userStore.userInfo.email || '',
    ssex: 0,
    description: '',
  });
  nickname.value = userStore.userInfo.nickname || '';
  try {
    const data = await getUserProfile();
    if (data) {
      Object.assign(form, {
        username: data.username || form.username,
        realname: data.realname || '',
        avatar: data.avatar || '',
        mobile: data.mobile || '',
        email: data.email || '',
        ssex: data.ssex ?? 0,
        description: data.description || '',
      });
      nickname.value = data.nickname || '';
    }
  } catch {
    // 回显失败时保留登录态数据
  }
};

watch(
  () => visible.value,
  (val) => {
    if (val) loadProfile();
  },
);

const handleSubmit = async () => {
  const result = await formRef.value?.validate();
  if (result !== true) return;
  submitting.value = true;
  try {
    const { username: _username, ...profile } = form;
    await updateProfile(profile);
    const user = userStore.userInfo;
    userStore.userInfo = {
      ...user,
      realname: form.realname,
      avatar: form.avatar,
      email: form.email,
      mobile: form.mobile,
      name: form.realname || user.username || user.name,
    };
    MessagePlugin.success('保存成功');
    visible.value = false;
  } catch (e: any) {
    MessagePlugin.error(e?.message || '保存失败');
  } finally {
    submitting.value = false;
  }
};
</script>

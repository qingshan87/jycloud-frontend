<template>
  <div class="ucenter-profile">
    <t-card :bordered="false" title="个人资料">
      <t-form ref="formRef" :data="form" :rules="rules" label-width="100px" style="max-width: 640px" @submit.prevent>
        <t-form-item label="用户名" name="username">
          <t-input :value="form.username" disabled />
        </t-form-item>
        <t-form-item label="昵称" name="nickname">
          <t-input v-model="form.nickname" placeholder="请输入昵称" clearable />
        </t-form-item>
        <t-form-item label="真实姓名" name="realname">
          <t-input v-model="form.realname" placeholder="请输入真实姓名" clearable />
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
        <t-form-item label="生日" name="birthday">
          <t-date-picker v-model="form.birthday" clearable style="width: 100%" />
        </t-form-item>
        <t-form-item label="个人简介" name="description">
          <t-textarea v-model="form.description" :maxlength="200" placeholder="介绍一下自己" />
        </t-form-item>
        <t-form-item>
          <t-button theme="primary" :loading="submitting" @click="handleSubmit">保存</t-button>
        </t-form-item>
      </t-form>
    </t-card>
  </div>
</template>
<script setup lang="ts">
import type { FormInstanceFunctions, FormRule } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, reactive, ref } from 'vue';

import type { ProfileForm } from '@/api/model/ucenterModel';
import { getProfile, updateProfile } from '@/api/ucenter';
import { useUserStore } from '@/store';

defineOptions({ name: 'UserCenterProfile' });

const userStore = useUserStore();

const formRef = ref<FormInstanceFunctions>();
const submitting = ref(false);
const form = reactive<ProfileForm & { username?: string }>({
  username: '',
  nickname: '',
  realname: '',
  mobile: '',
  email: '',
  ssex: 0,
  birthday: '',
  description: '',
});

const rules: Record<string, FormRule[]> = {
  mobile: [{ required: true, message: '请输入手机号', type: 'error' }],
  email: [{ email: true, message: '邮箱格式不正确', type: 'error' }],
};

const loadProfile = async () => {
  try {
    const data = await getProfile();
    Object.assign(form, {
      username: data?.username || userStore.userInfo.name,
      nickname: data?.nickname || '',
      realname: data?.realname || '',
      mobile: data?.mobile || '',
      email: data?.email || '',
      ssex: data?.ssex ?? 0,
      birthday: data?.birthday || '',
      description: data?.description || '',
    });
  } catch {
    Object.assign(form, { username: userStore.userInfo.name });
  }
};

const handleSubmit = async () => {
  const result = await formRef.value?.validate();
  if (result !== true) return;
  submitting.value = true;
  try {
    const { username: _username, ...profile } = form;
    await updateProfile(profile);
    MessagePlugin.success('保存成功');
  } catch (e: any) {
    MessagePlugin.error(e?.message || '保存失败');
  } finally {
    submitting.value = false;
  }
};

onMounted(loadProfile);
</script>

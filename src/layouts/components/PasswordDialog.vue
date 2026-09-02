<template>
  <t-dialog
    v-model:visible="visible"
    header="修改密码"
    :confirm-btn="{ content: '确认修改', loading: submitting }"
    cancel-btn="取消"
    width="480px"
    @confirm="handleSubmit"
  >
    <t-form ref="formRef" :data="form" :rules="rules" label-width="90px" @submit.prevent>
      <t-form-item label="原密码" name="oldPassword">
        <t-input v-model="form.oldPassword" type="password" placeholder="请输入原密码" clearable />
      </t-form-item>
      <t-form-item label="新密码" name="newPassword">
        <t-input v-model="form.newPassword" type="password" placeholder="6-20 位，建议包含字母和数字" clearable />
      </t-form-item>
      <t-form-item label="确认密码" name="confirmPassword">
        <t-input v-model="form.confirmPassword" type="password" placeholder="再次输入新密码" clearable />
      </t-form-item>
    </t-form>
  </t-dialog>
</template>
<script setup lang="ts">
import type { FormInstanceFunctions, FormRule } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { reactive, ref, watch } from 'vue';

import { updatePassword } from '@/api/account';

defineOptions({ name: 'PasswordDialog' });

const visible = defineModel<boolean>({ default: false });

const formRef = ref<FormInstanceFunctions>();
const submitting = ref(false);
const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const rules: Record<string, FormRule[]> = {
  oldPassword: [{ required: true, message: '请输入原密码', type: 'error' }],
  newPassword: [
    { required: true, message: '请输入新密码', type: 'error' },
    { min: 6, message: '密码长度不能少于 6 位', type: 'error' },
  ],
  confirmPassword: [{ required: true, message: '请再次输入新密码', type: 'error' }],
};

watch(
  () => visible.value,
  (val) => {
    if (val) {
      form.oldPassword = '';
      form.newPassword = '';
      form.confirmPassword = '';
      formRef.value?.clearValidate();
    }
  },
);

const handleSubmit = async () => {
  const result = await formRef.value?.validate();
  if (result !== true) return;
  if (form.newPassword !== form.confirmPassword) {
    MessagePlugin.warning('两次输入的密码不一致');
    return;
  }
  submitting.value = true;
  try {
    await updatePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword });
    MessagePlugin.success('密码修改成功');
    visible.value = false;
  } catch (e: any) {
    MessagePlugin.error(e?.message || '修改失败');
  } finally {
    submitting.value = false;
  }
};
</script>

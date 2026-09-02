<template>
  <div class="setting-page">
    <t-card :bordered="false" class="setting-filter-card">
      <t-form layout="inline" :data="query" @submit="handleSearch" @reset="handleReset">
        <t-form-item label="用户名" name="username">
          <t-input v-model="query.username" placeholder="请输入用户名" clearable style="width: 160px" />
        </t-form-item>
        <t-form-item label="姓名" name="realname">
          <t-input v-model="query.realname" placeholder="请输入真实姓名" clearable style="width: 160px" />
        </t-form-item>
        <t-form-item label="手机号" name="mobile">
          <t-input v-model="query.mobile" placeholder="请输入手机号" clearable style="width: 160px" />
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-select v-model="query.status" placeholder="全部" clearable style="width: 120px">
            <t-option label="启用" :value="1" />
            <t-option label="禁用" :value="0" />
          </t-select>
        </t-form-item>
        <t-form-item>
          <t-space>
            <t-button theme="primary" type="submit">查询</t-button>
            <t-button theme="default" type="reset">重置</t-button>
          </t-space>
        </t-form-item>
      </t-form>
    </t-card>

    <t-card :bordered="false" class="setting-content-card">
      <div class="setting-toolbar">
        <t-button v-permission="PERM.ucenter.user.create" theme="primary" @click="openCreate">
          <template #icon><t-icon name="add" /></template>
          新增用户
        </t-button>
      </div>

      <t-table
        :data="rows"
        :columns="columns"
        :pagination="pagination"
        :loading="loading"
        row-key="userId"
        @change="onTableChange"
      >
        <template #status="{ row }">
          <t-tag :theme="row.status === 1 ? 'success' : 'danger'" variant="light">{{
            row.status === 1 ? '启用' : '禁用'
          }}</t-tag>
        </template>
        <template #roles="{ row }">
          <span v-if="!row.roles || row.roles.length === 0">-</span>
          <t-tag v-for="role in row.roles" :key="role.roleId" variant="light" style="margin-right: 4px">
            {{ role.roleName }}
          </t-tag>
        </template>
        <template #op="{ row }">
          <t-space>
            <t-link v-permission="PERM.ucenter.user.update" theme="primary" @click="openEdit(row)">编辑</t-link>
            <t-link v-permission="PERM.ucenter.userAuthority.set" theme="primary" @click="openRole(row)"
              >分配角色</t-link
            >
            <t-link v-permission="PERM.ucenter.user.resetPassword" theme="primary" @click="handleResetPwd(row)"
              >重置密码</t-link
            >
            <t-link v-permission="PERM.ucenter.user.delete" theme="danger" @click="handleDelete(row)">删除</t-link>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <t-dialog
      v-model:visible="dialogVisible"
      :header="isEdit ? '编辑用户' : '新增用户'"
      :confirm-btn="{ content: '保存', loading: submitting }"
      cancel-btn="取消"
      width="560px"
      @confirm="handleSubmit"
    >
      <t-form ref="formRef" :data="form" :rules="rules" label-width="90px" @submit.prevent>
        <t-form-item label="用户名" name="username">
          <t-input v-model="form.username" :disabled="isEdit" placeholder="字母开头，6-20 位" clearable />
        </t-form-item>
        <t-form-item label="真实姓名" name="realname">
          <t-input v-model="form.realname" placeholder="请输入真实姓名" clearable />
        </t-form-item>
        <t-form-item label="昵称" name="nickname">
          <t-input v-model="form.nickname" placeholder="请输入昵称" clearable />
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
        <t-form-item label="状态" name="status">
          <t-radio-group v-model="form.status">
            <t-radio :value="1">启用</t-radio>
            <t-radio :value="0">禁用</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="描述" name="description">
          <t-textarea v-model="form.description" :maxlength="200" placeholder="请输入描述" />
        </t-form-item>
      </t-form>
    </t-dialog>

    <t-dialog
      v-model:visible="roleVisible"
      header="分配角色"
      :confirm-btn="{ content: '保存', loading: roleSubmitting }"
      cancel-btn="取消"
      width="480px"
      @confirm="handleRoleSubmit"
    >
      <t-checkbox-group v-model="selectedRoleIds">
        <div v-for="role in roleList" :key="role.roleId" class="uc-user-role-item">
          <t-checkbox :value="role.roleId">
            {{ role.roleName }}
            <t-tag v-if="role.readonly === 1" size="small" variant="light" style="margin-left: 4px">内置</t-tag>
          </t-checkbox>
        </div>
      </t-checkbox-group>
      <t-empty v-if="roleList.length === 0" description="暂无角色" />
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import type { FormInstanceFunctions, FormRule, PrimaryTableCol } from 'tdesign-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { onMounted, reactive, ref } from 'vue';

import { listUserRoles, setUserRoles } from '@/api/ucenter/authority';
import type { UcenterRoleVO, UcenterUserForm, UcenterUserQuery, UcenterUserVO } from '@/api/ucenter/model';
import { pageUcenterRoles } from '@/api/ucenter/role';
import {
  createUcenterUser,
  deleteUcenterUser,
  pageUcenterUsers,
  resetUcenterPassword,
  updateUcenterUser,
} from '@/api/ucenter/user';
import { PERM } from '@/constants/permission';

defineOptions({ name: 'UcenterUser' });

const loading = ref(false);
const rows = ref<UcenterUserVO[]>([]);
const query = reactive<UcenterUserQuery>({
  pageNum: 1,
  pageSize: 10,
  username: '',
  realname: '',
  mobile: '',
  status: undefined,
});
const pagination = reactive({ current: 1, pageSize: 10, total: 0, showJumper: true });

const columns: PrimaryTableCol[] = [
  { colKey: 'username', title: '用户名', width: 140 },
  { colKey: 'realname', title: '真实姓名', width: 120 },
  { colKey: 'nickname', title: '昵称', width: 120 },
  { colKey: 'mobile', title: '手机号', width: 140 },
  { colKey: 'email', title: '邮箱', width: 180 },
  { colKey: 'roles', title: '角色', minWidth: 160 },
  { colKey: 'status', title: '状态', width: 90 },
  { colKey: 'createTime', title: '创建时间', width: 170 },
  { colKey: 'op', title: '操作', width: 220, fixed: 'right' },
];

const fetchList = async () => {
  loading.value = true;
  try {
    const data = await pageUcenterUsers({
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      username: query.username || undefined,
      realname: query.realname || undefined,
      mobile: query.mobile || undefined,
      status: query.status === undefined ? undefined : String(query.status),
    });
    rows.value = data.records || [];
    pagination.total = data.total || 0;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  fetchList();
};

const handleReset = () => {
  query.username = '';
  query.realname = '';
  query.mobile = '';
  query.status = undefined;
  pagination.current = 1;
  fetchList();
};

const onTableChange = (changeParams: { pagination?: { current?: number; pageSize?: number } }) => {
  const { current, pageSize } = changeParams.pagination || {};
  if (current) pagination.current = current;
  if (pageSize) pagination.pageSize = pageSize;
  fetchList();
};

// 新增/编辑
const dialogVisible = ref(false);
const isEdit = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstanceFunctions>();
const form = reactive<UcenterUserForm>({});
const rules: Record<string, FormRule[]> = {
  username: [{ required: true, message: '请输入用户名', type: 'error' }],
  mobile: [{ required: true, message: '请输入手机号', type: 'error' }],
  email: [{ email: true, message: '邮箱格式不正确', type: 'error' }],
};

const openCreate = () => {
  isEdit.value = false;
  Object.assign(form, {
    userId: undefined,
    username: '',
    realname: '',
    nickname: '',
    mobile: '',
    email: '',
    ssex: 0,
    description: '',
    status: 1,
  });
  dialogVisible.value = true;
};

const openEdit = (row: UcenterUserVO) => {
  isEdit.value = true;
  Object.assign(form, {
    userId: row.userId,
    username: row.username,
    realname: row.realname,
    nickname: row.nickname,
    mobile: row.mobile,
    email: row.email,
    ssex: row.ssex ?? 0,
    description: row.description,
    status: row.status ?? 1,
  });
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  const result = await formRef.value?.validate();
  if (result !== true) return;
  submitting.value = true;
  try {
    if (isEdit.value) {
      await updateUcenterUser(form);
      MessagePlugin.success('修改成功');
    } else {
      await createUcenterUser(form);
      MessagePlugin.success('创建成功');
    }
    dialogVisible.value = false;
    fetchList();
  } catch (e: any) {
    MessagePlugin.error(e?.message || '保存失败');
  } finally {
    submitting.value = false;
  }
};

// 分配角色
const roleVisible = ref(false);
const roleSubmitting = ref(false);
const currentUser = ref<UcenterUserVO | null>(null);
const roleList = ref<UcenterRoleVO[]>([]);
const selectedRoleIds = ref<number[]>([]);

const openRole = async (row: UcenterUserVO) => {
  currentUser.value = row;
  roleVisible.value = true;
  try {
    const [rolePage, roleIds] = await Promise.all([
      pageUcenterRoles({ pageNum: 1, pageSize: 200 }),
      listUserRoles(row.userId),
    ]);
    roleList.value = rolePage.records || [];
    selectedRoleIds.value = Array.isArray(roleIds) ? roleIds : [];
  } catch (e: any) {
    MessagePlugin.error(e?.message || '加载角色失败');
  }
};

const handleRoleSubmit = async () => {
  if (!currentUser.value) return;
  roleSubmitting.value = true;
  try {
    await setUserRoles({ userId: currentUser.value.userId, dataIds: selectedRoleIds.value });
    MessagePlugin.success('分配成功');
    roleVisible.value = false;
    fetchList();
  } catch (e: any) {
    MessagePlugin.error(e?.message || '分配失败');
  } finally {
    roleSubmitting.value = false;
  }
};

// 重置密码 / 删除
const handleResetPwd = (row: UcenterUserVO) => {
  const dialog = DialogPlugin.confirm({
    header: '重置密码',
    body: `确定将用户「${row.username}」的密码重置为 123456 吗？`,
    theme: 'warning',
    onConfirm: async () => {
      try {
        await resetUcenterPassword([row.userId]);
        MessagePlugin.success('重置密码成功');
        dialog.hide();
      } catch (e: any) {
        MessagePlugin.error(e?.message || '重置失败');
      }
    },
  });
};

const handleDelete = (row: UcenterUserVO) => {
  const dialog = DialogPlugin.confirm({
    header: '删除用户',
    body: `确定删除用户「${row.username}」吗？删除后不可恢复。`,
    theme: 'danger',
    onConfirm: async () => {
      try {
        await deleteUcenterUser(row.userId);
        MessagePlugin.success('删除成功');
        dialog.hide();
        fetchList();
      } catch (e: any) {
        MessagePlugin.error(e?.message || '删除失败');
      }
    },
  });
};

onMounted(fetchList);
</script>
<style lang="less" scoped>
.setting-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 16px;
}

.uc-user-role-item {
  padding: 8px 0;
  border-bottom: 1px solid var(--td-component-stroke);

  &:last-child {
    border-bottom: none;
  }
}
</style>

<template>
  <div class="setting-page">
    <t-card :bordered="false" class="setting-content-card">
      <managed-table
        :data="rows"
        :columns="columns"
        :loading="loading"
        row-key="deptId"
        :tree="{ childrenKey: 'children' }"
        @refresh="fetchList"
      >
        <template #toolbar-left>
          <div class="setting-toolbar">
            <t-button v-permission="PERM.ucenter.dept.create" theme="primary" @click="openCreate(0)">
              <template #icon><t-icon name="add" /></template>
              新增部门
            </t-button>
          </div>
        </template>
        <template #status="{ row }">
          <t-tag :theme="row.status === 1 ? 'success' : 'danger'" variant="light">{{
            row.status === 1 ? '启用' : '禁用'
          }}</t-tag>
        </template>
        <template #op="{ row }">
          <t-space>
            <t-link v-permission="PERM.ucenter.dept.create" theme="primary" @click="openCreate(row.deptId)"
              >新增子部门</t-link
            >
            <t-link v-permission="PERM.ucenter.dept.update" theme="primary" @click="openEdit(row)">编辑</t-link>
            <t-link v-permission="PERM.ucenter.dept.delete" theme="danger" @click="handleDelete(row)">删除</t-link>
          </t-space>
        </template>
      </managed-table>
    </t-card>

    <t-dialog
      v-model:visible="dialogVisible"
      :header="isEdit ? '编辑部门' : '新增部门'"
      :confirm-btn="{ content: '保存', loading: submitting }"
      cancel-btn="取消"
      width="480px"
      @confirm="handleSubmit"
    >
      <t-form ref="formRef" :data="form" :rules="rules" label-width="90px" @submit.prevent>
        <t-form-item label="上级部门" name="parentId">
          <t-tree-select
            v-model="form.parentId"
            :data="parentOptions"
            :keys="treeKeys"
            clearable
            placeholder="顶级部门"
          />
        </t-form-item>
        <t-form-item label="部门名称" name="deptName">
          <t-input v-model="form.deptName" placeholder="请输入部门名称" clearable />
        </t-form-item>
        <t-form-item label="排序" name="sort">
          <t-input-number v-model="form.sort" :min="0" :max="9999" />
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-radio-group v-model="form.status">
            <t-radio :value="1">启用</t-radio>
            <t-radio :value="0">禁用</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="备注" name="remark">
          <t-textarea v-model="form.remark" :maxlength="200" placeholder="请输入备注" />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import type { FormInstanceFunctions, FormRule, PrimaryTableCol } from 'tdesign-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, reactive, ref } from 'vue';

import { createUcenterDept, deleteUcenterDept, treeUcenterDepts, updateUcenterDept } from '@/api/ucenter/dept';
import type { UcenterDeptForm, UcenterDeptVO } from '@/api/ucenter/model';
import ManagedTable from '@/components/managed-table/index.vue';
import { PERM } from '@/constants/permission';

defineOptions({ name: 'UcenterDept' });

const loading = ref(false);
const rows = ref<UcenterDeptVO[]>([]);
const treeKeys = { value: 'deptId', label: 'deptName', children: 'children' };

const columns: PrimaryTableCol[] = [
  { colKey: 'deptName', title: '部门名称', minWidth: 220 },
  { colKey: 'sort', title: '排序', width: 80 },
  { colKey: 'remark', title: '备注', minWidth: 180 },
  { colKey: 'status', title: '状态', width: 90 },
  { colKey: 'createTime', title: '创建时间', width: 170 },
  { colKey: 'op', title: '操作', width: 220, fixed: 'right' },
];

const fetchList = async () => {
  loading.value = true;
  try {
    rows.value = (await treeUcenterDepts()) || [];
  } finally {
    loading.value = false;
  }
};

const dialogVisible = ref(false);
const isEdit = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstanceFunctions>();
const form = reactive<UcenterDeptForm>({});
const rules: Record<string, FormRule[]> = {
  deptName: [{ required: true, message: '请输入部门名称', type: 'error' }],
};

const parentOptions = computed(() => [{ deptId: 0, deptName: '顶级部门', children: rows.value }]);

const openCreate = (parentId: number) => {
  isEdit.value = false;
  Object.assign(form, {
    deptId: undefined,
    parentId,
    deptName: '',
    sort: 0,
    status: 1,
    remark: '',
  });
  dialogVisible.value = true;
};

const openEdit = (row: UcenterDeptVO) => {
  isEdit.value = true;
  Object.assign(form, {
    deptId: row.deptId,
    parentId: row.parentId || 0,
    deptName: row.deptName,
    sort: row.sort ?? 0,
    status: row.status ?? 1,
    remark: row.remark,
  });
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  const result = await formRef.value?.validate();
  if (result !== true) return;
  submitting.value = true;
  try {
    if (isEdit.value) {
      await updateUcenterDept(form);
      MessagePlugin.success('修改成功');
    } else {
      await createUcenterDept(form);
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

const handleDelete = (row: UcenterDeptVO) => {
  const dialog = DialogPlugin.confirm({
    header: '删除部门',
    body: `确定删除部门「${row.deptName}」吗？存在子部门或用户时可能删除失败。`,
    theme: 'danger',
    onConfirm: async () => {
      try {
        await deleteUcenterDept(row.deptId);
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
</style>

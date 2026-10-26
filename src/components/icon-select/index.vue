<template>
  <t-select v-model="value" filterable clearable :popup-props="{ overlayInnerStyle: { maxWidth: '600px' } }">
    <t-option
      v-for="item in options"
      :key="item.stem"
      :value="item.stem"
      :label="item.stem"
      style="display: inline-block"
    >
      <div>
        <t-icon :name="item.stem" />
      </div>
    </t-option>
    <template #valueDisplay>
      <template v-if="value">
        <t-icon :name="value" class="jy-icon-select-preview" />
        {{ value }}
      </template>
      <div v-else class="jy-icon-select-placeholder">请选择图标</div>
    </template>
  </t-select>
</template>
<script setup lang="ts">
import { manifest } from 'tdesign-icons-vue-next';
import { ref } from 'vue';

defineOptions({
  name: 'IconSelect',
});

const options = ref(manifest);
const value = defineModel<string>({ default: '' });
</script>
<style lang="less" scoped>
.jy-icon-select-preview {
  margin-right: 8px;
}

.jy-icon-select-placeholder {
  color: var(--td-text-color-placeholder);
}
</style>

<script setup lang="ts">
import { useDialog } from "../../shared/tools/useDialog";
import { useTableExport } from "./useTableExport";
import { useUsers } from "./users";

defineOptions({
  name: "Home"
});


const { users, loadUsers } = useUsers();


const COLUMN_CONFIG = {
  id: { label: "ID", width: 10, exportable: false },
  name: { label: "姓名", width: 15, exportable: true },
  phone: { label: "手机号", width: 15, exportable: true }
} as const;


const { tableColumnInfo, exportTable } = useTableExport(COLUMN_CONFIG);
const { dialog, openDialog, closeDialog } = useDialog("选列导出");


const checkedColumns = ref<
  { field: string; columnsName: string; checked: boolean }[]
>([]);

// 初始化列选择状态
function initCheckedColumns() {
  if (users.value.length < 1) {
    checkedColumns.value = [];
    return;
  }
  checkedColumns.value = Object.keys(users.value[0]!).map(key => ({
    field: key,
    columnsName: tableColumnInfo.value[key] || key,
    checked:
      COLUMN_CONFIG[key as keyof typeof COLUMN_CONFIG]?.exportable ?? true
  }));
}


function showColumnsConfig() {
  if (users.value.length === 0 || users.value[0] === undefined) return;
  initCheckedColumns();
  openDialog();
}


function changeExportColumn(column: {
  field: string;
  columnsName: string;
  checked: boolean;
}) {
  column.checked = !column.checked;
}

// 是否有选中的列
const canExport = computed(() => {
  return checkedColumns.value.reduce(
    (hasChecked, col) => hasChecked || col.checked,
    false
  );
});


// 直接导出所有可导出的列
function handleViewColumnsExport() {
  const selectedFields = Object.keys(COLUMN_CONFIG).filter(
    key =>
      COLUMN_CONFIG[key as keyof typeof COLUMN_CONFIG]?.exportable !== false
  );

  const filteredData = users.value.map(user =>
    Object.fromEntries(
      selectedFields.map(field => [field, user[field as keyof typeof user]])
    )
  );

  exportTable(filteredData, "用户列表");
}

// 选列导出
function handleSelectColumnsExport() {
  const selectedFields = checkedColumns.value.reduce<string[]>((acc, col) => {
    if (col.checked) {
      acc.push(col.field);
    }
    return acc;
  }, []);

  const filteredData = users.value.map(user =>
    Object.fromEntries(
      selectedFields.map(field => [field, user[field as keyof typeof user]])
    )
  );

  exportTable(filteredData, "用户列表");
  closeDialog();
}


onMounted(() => {
  loadUsers();
});
</script>
<template>
  <div class="home">
    <div class="header">
      <el-button @click="handleViewColumnsExport" :disabled="users.length == 0">
        导出表格
      </el-button>
      <el-button @click="showColumnsConfig" :disabled="users.length == 0">
        选列导出
      </el-button>
    </div>
    <el-table :data="users" style="width: 100%" height="100%">
      <el-table-column prop="name" label="姓名" width="180" />
      <el-table-column prop="phone" label="手机号" />
    </el-table>
    <el-dialog v-model="dialog.visible" :title="dialog.title">
      <div class="dialog-container">
        <el-checkbox
          v-for="column in checkedColumns"
          :key="column.columnsName"
          :model-value="column.checked"
          @change="changeExportColumn(column)">
          {{ column.columnsName }}
        </el-checkbox>
      </div>
      <template #footer>
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="handleSelectColumnsExport" :disabled="!canExport">
          导出
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
<style scoped>
.home {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  justify-content: center;
  gap: 10px;

  .header {
    padding: 10px;
  }
}
</style>

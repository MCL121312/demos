<script setup lang="ts">
import { useDialog } from "../../shared/tools/useDialog";
import { useTableExport } from "./useTableExport";
import { useUsers } from "./users";

defineOptions({
  name: "Home"
});

const { users, loadUsers } = useUsers();

const { dialog, openDialog, closeDialog } = useDialog("选列导出");
function showColumnsConfig() {
  if (users.value.length === 0 || users.value[0] === undefined) return;

  initCheckedColumns();
  openDialog();
}

const COLUMN_CONFIG = {
  id: { label: "ID", width: 10, exportable: false },
  name: { label: "姓名", width: 15, exportable: true },
  phone: { label: "手机号", width: 15, exportable: true }
} as const;

const { tableColumnInfo, exportTable } = useTableExport(COLUMN_CONFIG);

const checkedColumns = ref<
  { field: string; columnsName: string; checked: boolean }[]
>([]);

// 初始化列选择状态
function initCheckedColumns() {
  if (users.value.length < 1) {
    checkedColumns.value = [];
    return;
  }
  // 根据 exportable 属性初始化选中状态
  checkedColumns.value = Object.keys(users.value[0]!).map(key => ({
    field: key,
    columnsName: tableColumnInfo.value[key] || key,
    checked: COLUMN_CONFIG[key as keyof typeof COLUMN_CONFIG]?.exportable ?? true
  }));
}

function handleExport() {

  const selectedFields = checkedColumns.value.reduce<string[]>((acc, col) => {
    if (col.checked) {
      acc.push(col.field);
    }
    return acc;
  }, []);

  // 只导出选中的列
  const filteredData = users.value.map(user =>
    Object.fromEntries(
      selectedFields.map(field => [field, user[field as keyof typeof user]])
    )
  );

  exportTable(filteredData, "用户列表");
}

function changeExportColumn(column: {
  field: string;
  columnsName: string;
  checked: boolean;
}) {
  column.checked = !column.checked;
}

const canExport = computed(() => {
  return checkedColumns.value.reduce((hasChecked, col) => hasChecked || col.checked, false);
});

onMounted(() => {
  loadUsers();
});
</script>

<template>
  <div class="home">
    <div class="header">
      <el-button @click="handleExport" :disabled="users.length == 0">
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
        <el-button type="primary" @click="handleExport" :disabled="!canExport">
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

<script setup lang="ts">
import { ElMessage } from "element-plus";
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
  phone: { label: "手机号", width: 15, exportable: true },
  registerTime: { label: "注册时间", width: 20, exportable: true, dateFormat: "yyyy-mm-dd hh:mm:ss" }
} as const;


const { exportTableWithFields } = useTableExport(COLUMN_CONFIG);
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
    columnsName: COLUMN_CONFIG[key as keyof typeof COLUMN_CONFIG]?.label || key,
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
async function handleViewColumnsExport() {
  try {
    const selectedFields = Object.keys(COLUMN_CONFIG).filter(
      key =>
        COLUMN_CONFIG[key as keyof typeof COLUMN_CONFIG]?.exportable !== false
    );

    await exportTableWithFields(users.value, selectedFields, "用户列表");
  } catch (error) {
    console.error("导出失败：", error);
    ElMessage.error("导出失败，请稍后重试");
  }
}

// 选列导出
async function handleSelectColumnsExport() {
  try {
    const selectedFields = checkedColumns.value
      .filter(col => col.checked)
      .map(col => col.field);

    await exportTableWithFields(users.value, selectedFields, "用户列表");
    closeDialog();
  } catch (error) {
    console.error("导出失败：", error);
    ElMessage.error("导出失败，请稍后重试");
  }
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
      <el-table-column prop="phone" label="手机号" width="180"/>
      <el-table-column prop="registerTime" label="注册时间" >
        <template #default="scope">
          {{ scope.row.registerTime.toLocaleString() }}
        </template>
      </el-table-column>
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

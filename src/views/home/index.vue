<script setup lang="ts">
import { colProps } from "element-plus";
import { useDialog } from "../../shared/tools/useDialog";
import { useExportExcel } from "../../shared/tools/useExportExcel";

defineOptions({
  name: "Home"
});

interface ViewUser {
  id: number;
  name: string;
  phone: string;
}

interface TableColumn {
  field: keyof ViewUser;
  label: string;
  width?: number;
  visible?: boolean;
}

interface ExportColumn {
  checked: boolean;
  columnsName: keyof ViewUser;
  label: string;
}

const tableColumnsConfig: TableColumn[] = [
  { field: "name", label: "姓名", width: 180 },
  { field: "phone", label: "手机号" }
];
const checkedColumns = ref<ExportColumn[]>([]);

const viewUsers = ref<ViewUser[]>([]);

function loadTestTableData() {
  viewUsers.value = [
    {
      id: 1,
      name: "张三",
      phone: "13800138000"
    },
    {
      id: 2,
      name: "李四",
      phone: "13800138001"
    },
    {
      id: 3,
      name: "王五",
      phone: "13800138002"
    }
  ];
}

const { arrayToExcel } = useExportExcel();
function exportTable() {
  const exportConfig: Record<string, { title: string; width: number }> = {};

  checkedColumns.value.forEach(col => {
    // 只导出被勾选的列
    if (col.checked) {
      const columnConfig = tableColumnsConfig.find(
        c => c.field === col.columnsName
      );
      if (columnConfig) {
        exportConfig[col.columnsName] = {
          title: col.label,
          width: 15 // 默认宽度
        };
      }
    }
  });

  arrayToExcel(viewUsers.value, exportConfig);
}

const { dialog, openDialog, closeDialog } = useDialog("选列导出");
function showColumns() {
  if (viewUsers.value.length === 0 || viewUsers.value[0] === undefined) return;
   
  
  openDialog();
}
function changeExportColumn(column: ExportColumn) {
  column.checked = !column.checked;
}

const canExport = computed(() => {
  return checkedColumns.value.filter(col => col.checked).length > 0;
});

onMounted(() => {
  loadTestTableData();
});
</script>

<template>
  <div class="home">
    <div class="header">
      <el-button @click="exportTable" :disabled="viewUsers.length == 0">
        导出表格
      </el-button>
      <el-button @click="showColumns" :disabled="viewUsers.length == 0">
        选列导出
      </el-button>
    </div>
    <el-table :data="viewUsers" style="width: 100%" height="100%">
      <el-table-column
        v-for="col in tableColumnsConfig"
        :key="col.field"
        :prop="col.field"
        :label="col.label"
        :width="col.width" />
    </el-table>
    <el-dialog v-model="dialog.visible" :title="dialog.title">
      <div class="dialog-container">
        <el-checkbox
          v-for="column in checkedColumns"
          :key="column.columnsName"
          :model-value="column.checked"
          @change="changeExportColumn(column)">
          {{ column.label }}
        </el-checkbox>
      </div>
      <template #footer>
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="exportTable" :disabled="!canExport">
          确定
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

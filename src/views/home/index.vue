<script setup lang="ts">
import { ElMessage } from "element-plus";
import { useDialog } from "../../shared/tools/useDialog";
import { useTableExport } from "./useTableExport";
import { useUsers } from "./useUsers";

defineOptions({
  name: "Home"
});

const {
  users,
  loadUsers,
  searchUsers,
  invalidUsers,
  pagination,
  changePageNumber,
  changePageSize,
  pageSizes
} = useUsers();

onMounted(() => {
  loadUsers();
});

const searchKeyword = ref("");

function handleSearch() {
  searchUsers(pagination.value, { name: searchKeyword.value });
}

function handlePageSizeChange(pageSize: number) {
  changePageSize(pageSize);
  searchUsers(pagination.value, { name: searchKeyword.value });
}

function handlePageNumberChange(pageNumber: number) {
  changePageNumber(pageNumber);
  searchUsers(pagination.value, { name: searchKeyword.value });
}

function handleResetSearchConditions() {
  searchKeyword.value = "";
  loadUsers();
}

const COLUMN_CONFIG = {
  id: { label: "ID", width: 10, exportable: false },
  name: { label: "姓名", width: 15, exportable: true },
  phone: { label: "手机号", width: 15, exportable: true },
  registerTime: {
    label: "注册时间",
    width: 20,
    exportable: true,
    dateFormat: "yyyy-mm-dd hh:mm:ss"
  }
} as const;

const {
  exportAllExportableColumns,
  exportSelectedColumns,
  checkedColumns,
  initCheckedColumns,
  toggleColumn,
  canExport
} = useTableExport(COLUMN_CONFIG);

const { dialog, openDialog, closeDialog } = useDialog("选列导出");

function handleShowColumnsConfig() {
  if (invalidUsers.value) return;
  initCheckedColumns();
  openDialog();
}

// 直接导出所有可导出的列
async function handleViewColumnsExport() {
  try {
    await exportAllExportableColumns(users.value, "用户列表");
  } catch (error) {
    console.error("导出失败：", error);
    ElMessage.error("导出失败，请稍后重试");
  }
}

// 选列导出
async function handleSelectColumnsExport() {
  try {
    await exportSelectedColumns(users.value, "用户列表");
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
      <div class="header__search">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索"
          v-on:keydown.enter="handleSearch"
          clearable
          @clear="handleResetSearchConditions"
          style="width: 200px;"
          />
    
      </div>
    <div class="header__table-actions">
        <el-button @click="handleViewColumnsExport" :disabled="invalidUsers">
        导出表格
      </el-button>
      <el-button @click="handleShowColumnsConfig" :disabled="invalidUsers">
        选列导出
      </el-button>
    </div>
    </div>

    <el-table :data="users" class="users-table">
      <el-table-column prop="name" label="姓名" width="180" />
      <el-table-column prop="phone" label="手机号" width="180" />
      <el-table-column prop="registerTime" label="注册时间">
        <template #default="scope">
          {{ scope.row.registerTime.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }) }}
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.pageNumber"
        v-model:page-size="pagination.pageSize"
        :page-sizes="pageSizes"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        @size-change="handlePageSizeChange"
        @current-change="handlePageNumberChange" />
    </div>
    <el-dialog v-model="dialog.visible" :title="dialog.title">
      <div class="dialog-container">
        <el-checkbox
          v-for="column in checkedColumns"
          :key="column.columnsName"
          :model-value="column.checked"
          @change="toggleColumn(column)">
          {{ column.columnsName }}
        </el-checkbox>
      </div>
      <template #footer>
        <el-button @click="closeDialog">取消</el-button>
        <el-button
          type="primary"
          @click="handleSelectColumnsExport"
          :disabled="!canExport">
          导出
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
<style scoped>
.home {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: 50px 1fr 50px;
  grid-template-areas:
    "header"
    "main"
    "pagination";
  box-sizing: border-box;
  padding: 8px;

  .header {
    grid-area: header;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px;
    gap: 10px;
    background-color: bisque; 
    border-radius: 4px;
     
  }

  .users-table {
    grid-area: main;
    height: calc(100vh - 166px);

    /* height: calc(100% - 100px); */
  }

  .pagination {
    grid-area: pagination;
    height: 50px;
    display: flex;
    align-items: center;
    padding: 0 10px;
    background-color: rgb(177, 255, 255);
        border-radius: 4px;
  }
}
</style>

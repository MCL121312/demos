<script setup lang="ts">
import { useExportExcel } from "../../shared/tools/useExportExcel";

defineOptions({
  name: "Home"
});

interface TestTableData {
  name: string;
  phone: string;
}
const testTableData = ref<TestTableData[]>([]);

function loadTestTableData() {
  testTableData.value = [
    {
      name: "张三",
      phone: "13800138000"
    },
    {
      name: "李四",
      phone: "13800138001"
    },
    {
      name: "王五",
      phone: "13800138002"
    }
  ];
}

const { exportData } = useExportExcel();
function exportTable() {
  exportData(testTableData.value, {
    name: { title: "姓名", width: 15 },
    phone: { title: "手机号", width: 20 }
  });
}

onMounted(() => {
  loadTestTableData();
});
</script>

<template>
  <div class="home">
    <div class="header">
      <el-button @click="exportTable">导出表格</el-button>
    </div>
    <el-table :data="testTableData" style="width: 100%" height="100%">
      <el-table-column prop="name" label="名字" width="180" />
      <el-table-column prop="phone" label="手机号" />
    </el-table>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  gap: 10px;
  .header {
    padding: 10px;
  }
}
</style>

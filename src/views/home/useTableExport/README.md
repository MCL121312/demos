# useTableExport

通用的表格导出工具，提供配置驱动的表格导出功能。

## 特性

- ✅ **配置驱动**: 只需定义列配置，自动派生所有需要的数据
- ✅ **类型安全**: 完整的 TypeScript 类型支持
- ✅ **高度复用**: 适用于任何需要表格导出的场景
- ✅ **灵活控制**: 支持控制哪些列可导出
- ✅ **性能优化**: 使用 reduce 一次遍历完成过滤和转换

## 依赖

基于 `useExportExcel` 工具，需要先安装：

```json
"xlsx": "^0.18.5"
```

## API

### `useTableExport(columnConfig)`

创建一个表格导出工具实例。

**参数：**
- `columnConfig`: 列配置对象

**返回值：**
```ts
{
  // 基础导出方法
  exportTable,                  // 导出表格（自定义配置）
  exportTableWithFields,        // 导出指定字段

  // 便捷导出方法
  exportAllExportableColumns,   // 导出所有可导出的列
  exportSelectedColumns,        // 导出选中的列

  // 列选择状态管理
  checkedColumns,               // ref<CheckedColumn[]> 列选择状态
  initCheckedColumns,           // () => void 初始化列选择
  toggleColumn,                 // (column) => void 切换列选中状态
  canExport,                    // computed<boolean> 是否可导出
  getSelectedFields,            // () => T[] 获取选中的字段
  getExportableFields           // () => T[] 获取所有可导出字段
}
```

## 列配置格式

```ts
interface ColumnConfig {
  label: string;        // 列的显示名称
  width?: number;       // 列宽（可选，默认 10）
  exportable?: boolean; // 是否可导出（可选，默认 true）
  dateFormat?: string;  // 时间格式（可选，如 "yyyy-mm-dd hh:mm:ss"）
}
```

## 使用示例

### 基础用法 - 导出所有可导出列

```ts
import { useTableExport } from "./useTableExport";

// 1. 定义列配置
const COLUMN_CONFIG = {
  id: { label: "ID", width: 10, exportable: false },
  name: { label: "姓名", width: 15 },
  phone: { label: "手机号", width: 15 }
} as const;

// 2. 使用工具
const { exportAllExportableColumns } = useTableExport(COLUMN_CONFIG);

// 3. 导出数据（自动过滤掉 exportable: false 的列）
async function handleExport() {
  await exportAllExportableColumns(users.value, "用户列表");
}
```

### 选列导出功能

```vue
<template>
  <div>
    <el-button @click="handleShowColumnsConfig">选列导出</el-button>

    <el-dialog v-model="dialog.visible" title="选择导出列">
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
        <el-button @click="dialog.visible = false">取消</el-button>
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

<script setup lang="ts">
import { useTableExport } from "./useTableExport";
import { useDialog } from "../../shared/tools/useDialog";

const COLUMN_CONFIG = {
  id: { label: "ID", width: 10, exportable: false },
  name: { label: "姓名", width: 15 },
  phone: { label: "手机号", width: 15 }
} as const;

const {
  exportSelectedColumns,
  checkedColumns,
  initCheckedColumns,
  toggleColumn,
  canExport
} = useTableExport(COLUMN_CONFIG);

const { dialog, openDialog } = useDialog("选列导出");

// 打开选列对话框
function handleShowColumnsConfig() {
  initCheckedColumns();  // 初始化列选择状态
  openDialog();
}

// 导出选中的列
async function handleSelectColumnsExport() {
  await exportSelectedColumns(users.value, "用户列表");
  dialog.value.visible = false;
}
</script>
```

### 控制可导出列

```ts
const COLUMN_CONFIG = {
  id: { label: "ID", exportable: false },      // 不导出
  password: { label: "密码", exportable: false }, // 不导出
  name: { label: "姓名" },                      // 导出
  email: { label: "邮箱" }                      // 导出
} as const;

// exportConfig 只会包含 name 和 email
```

### 时间格式配置

```ts
const COLUMN_CONFIG = {
  id: { label: "ID", width: 10, exportable: false },
  name: { label: "姓名", width: 15 },
  registerTime: {
    label: "注册时间",
    width: 20,
    dateFormat: "yyyy-mm-dd hh:mm:ss"  // 显示完整的日期时间
  }
} as const;

const { exportTable } = useTableExport(COLUMN_CONFIG);

// 导出时，registerTime 列会按照指定的格式显示
exportTable(users.value, "用户列表");
```

### 完整示例 - 同时支持快速导出和选列导出

```vue
<script setup lang="ts">
import { ElMessage } from "element-plus";
import { useTableExport } from "./useTableExport";
import { useDialog } from "../../shared/tools/useDialog";
import { useUsers } from "./useUsers";

const { users, loadUsers, invalidUsers } = useUsers();

// 定义列配置
const COLUMN_CONFIG = {
  id: { label: "ID", width: 10, exportable: false },
  name: { label: "姓名", width: 15 },
  phone: { label: "手机号", width: 15 },
  email: { label: "邮箱", width: 20 }
} as const;

// 使用导出工具
const {
  exportAllExportableColumns,
  exportSelectedColumns,
  checkedColumns,
  initCheckedColumns,
  toggleColumn,
  canExport
} = useTableExport(COLUMN_CONFIG);

const { dialog, openDialog, closeDialog } = useDialog("选列导出");

// 快速导出所有可导出列
async function handleQuickExport() {
  try {
    await exportAllExportableColumns(users.value, "用户列表");
  } catch (error) {
    ElMessage.error("导出失败，请稍后重试");
  }
}

// 打开选列对话框
function handleShowColumnsConfig() {
  if (invalidUsers.value) return;
  initCheckedColumns();
  openDialog();
}

// 导出选中的列
async function handleSelectColumnsExport() {
  try {
    await exportSelectedColumns(users.value, "用户列表");
    closeDialog();
  } catch (error) {
    ElMessage.error("导出失败，请稍后重试");
  }
}

onMounted(() => {
  loadUsers();
});
</script>

<template>
  <div>
    <div class="header">
      <el-button @click="handleQuickExport" :disabled="invalidUsers">
        快速导出
      </el-button>
      <el-button @click="handleShowColumnsConfig" :disabled="invalidUsers">
        选列导出
      </el-button>
    </div>

    <el-table :data="users">
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="phone" label="手机号" />
      <el-table-column prop="email" label="邮箱" />
    </el-table>

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
```

## 多场景复用

这个工具设计用于在多个页面中复用：

```ts
// 用户列表页面
const USER_COLUMNS = {
  name: { label: "姓名", width: 15 },
  phone: { label: "手机号", width: 15 }
} as const;

// 订单列表页面
const ORDER_COLUMNS = {
  orderNo: { label: "订单号", width: 20 },
  amount: { label: "金额", width: 12 },
  status: { label: "状态", width: 10 }
} as const;

// 产品列表页面
const PRODUCT_COLUMNS = {
  sku: { label: "SKU", width: 15 },
  name: { label: "产品名称", width: 20 },
  price: { label: "价格", width: 12 }
} as const;
```

每个页面都使用相同的模式，只需定义自己的列配置即可。

## 设计理念

### 单一数据源
所有列相关的配置都集中在 `COLUMN_CONFIG` 中，避免多处维护同样的数据。

### 职责分离
- **Vue 文件**: 处理 UI 交互和业务逻辑
- **useTableExport**: 处理导出逻辑和列选择状态管理
- **useExportExcel**: 处理底层 Excel 生成

### 封装列选择逻辑
将 `checkedColumns` 相关逻辑封装在 `useTableExport` 中，而不是放在视图层：
- ✅ **职责更清晰**: 列选择是导出功能的一部分
- ✅ **复用性更好**: 其他页面可以直接复用选列导出功能
- ✅ **减少视图层代码**: 视图层只需关注 UI 交互
- ✅ **更好的类型安全**: 列配置的类型信息在 composable 内部

### 性能优化
使用 `reduce` 替代 `filter + map`，一次遍历完成过滤和转换，减少中间数组创建。

```ts
// 使用 reduce 一次遍历
const exportConfig = computed(() =>
  Object.entries(columnConfig).reduce(
    (acc, [key, config]) => {
      if (config.exportable !== false) {
        acc[key] = { label: config.label, width: config.width || 10 };
      }
      return acc;
    },
    {} as Record<string, { label: string; width: number }>
  )
);
```

## 注意事项

1. **exportable 默认为 true**: 如果不设置 `exportable`，列默认会被导出
2. **width 默认为 10**: 如果不设置 `width`，列宽默认为 10
3. **使用 as const**: 建议在定义 `COLUMN_CONFIG` 时使用 `as const` 以获得更好的类型推导
4. **文件名可选**: `exportTable` 的第二个参数是可选的，默认为 "导出数据"


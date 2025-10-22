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
  tableColumnInfo,  // 列名映射表（computed）
  exportConfig,     // 导出配置（computed）
  exportTable       // 导出方法
}
```

## 列配置格式

```ts
interface ColumnConfig {
  label: string;        // 列的显示名称
  width?: number;       // 列宽（可选，默认 10）
  exportable?: boolean; // 是否可导出（可选，默认 true）
}
```

## 使用示例

### 基础用法

```ts
import { useTableExport } from "../../shared/tools/useTableExport";

// 1. 定义列配置
const COLUMN_CONFIG = {
  id: { label: "ID", width: 10, exportable: false },
  name: { label: "姓名", width: 15 },
  phone: { label: "手机号", width: 15 }
} as const;

// 2. 使用工具
const { tableColumnInfo, exportTable } = useTableExport(COLUMN_CONFIG);

// 3. 导出数据
function handleExport() {
  exportTable(users.value, "用户列表");
}
```

### 在模板中使用列名映射

```vue
<template>
  <div v-for="column in checkedColumns" :key="column.field">
    {{ tableColumnInfo[column.field] }}
  </div>
</template>

<script setup lang="ts">
const checkedColumns = computed(() => {
  return Object.keys(users.value[0] || {}).map(key => ({
    field: key,
    columnsName: tableColumnInfo.value[key] || key,
    checked: true
  }));
});
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

### 完整示例

```vue
<script setup lang="ts">
import { useTableExport } from "../../shared/tools/useTableExport";
import { useUsers } from "./users";

const { users, loadUsers } = useUsers();

// 定义列配置
const COLUMN_CONFIG = {
  id: { label: "ID", width: 10, exportable: false },
  name: { label: "姓名", width: 15 },
  phone: { label: "手机号", width: 15 },
  email: { label: "邮箱", width: 20 }
} as const;

// 使用导出工具
const { tableColumnInfo, exportTable } = useTableExport(COLUMN_CONFIG);

// 导出处理函数
function handleExport() {
  exportTable(users.value, "用户列表");
}

onMounted(() => {
  loadUsers();
});
</script>

<template>
  <div>
    <el-button @click="handleExport">导出用户</el-button>
    <el-table :data="users">
      <el-table-column prop="name" :label="tableColumnInfo.name" />
      <el-table-column prop="phone" :label="tableColumnInfo.phone" />
      <el-table-column prop="email" :label="tableColumnInfo.email" />
    </el-table>
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
- **Vue 文件**: 处理 ViewModel（视图模型）
- **useTableExport**: 处理配置驱动的导出逻辑
- **useExportExcel**: 处理底层 Excel 生成

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


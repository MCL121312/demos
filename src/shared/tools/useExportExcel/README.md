# useExportExcel

Excel 导出工具，基于 `xlsx` 库。
为了解决简单的表格导出问题，传入对象数组，调用方法就会自动导出。

## 依赖

```json
"xlsx": "^0.18.5"
```

## API

### `useExportExcel()`

创建一个 Excel 导出工具实例。

**返回值：**
```ts
{
  arrayToExcel,      // 主要方法，将数组数据导出到 Excel 文件
  transformData,     // 根据列配置转换数据
  createSheet,       // 创建工作表
  exportToFile       // 导出工作表到文件
}
```

## 使用示例

### 基础用法 - 导出数据

```ts
import { useExportExcel } from "../../shared/tools/useExportExcel";

const { arrayToExcel } = useExportExcel();

const users = [
  { id: 1, name: "张三", age: 25 },
  { id: 2, name: "李四", age: 30 },
  { id: 3, name: "王五", age: 28 }
];

const config = {
  id: { label: "ID", width: 10 },
  name: { label: "姓名", width: 15 },
  age: { label: "年龄", width: 10 }
};

arrayToExcel(users, config);
// 导出为 "导出数据.xlsx"
```

### 自定义文件名

通过 `exportToFile` 方法的第二个参数指定文件名：

```ts
const { arrayToExcel, exportToFile, createSheet, transformData } = useExportExcel();

const users = [
  { id: 1, name: "张三", age: 25 },
  { id: 2, name: "李四", age: 30 }
];

const config = {
  id: { label: "ID", width: 10 },
  name: { label: "姓名", width: 15 }
};

// 方式1: 使用 arrayToExcel（默认文件名为 "导出数据"）
arrayToExcel(users, config);
// 导出为 "导出数据.xlsx"

// 方式2: 使用 exportToFile 指定自定义文件名
const transformed = transformData(users, config);
const sheet = createSheet(config, transformed);
exportToFile(sheet, "用户数据");
// 导出为 "用户数据.xlsx"
```

### 分步操作

```ts
const { transformData, createSheet, exportToFile } = useExportExcel();

const users = [
  { id: 1, name: "张三", age: 25 },
  { id: 2, name: "李四", age: 30 }
];

const config = {
  id: { label: "ID", width: 10 },
  name: { label: "姓名", width: 15 }
};

// 1. 转换数据（只保留配置中指定的字段）
const transformed = transformData(users, config);
// 结果: [{ id: 1, name: "张三" }, { id: 2, name: "李四" }]

// 2. 创建工作表
const sheet = createSheet(config, transformed);

// 3. 导出到文件（不指定文件名时默认为 "导出数据"）
exportToFile(sheet);
// 导出为 "导出数据.xlsx"

// 或指定自定义文件名
exportToFile(sheet, "我的数据");
// 导出为 "我的数据.xlsx"
```

## 配置说明

### HeadConfig

```ts
interface HeadConfig {
  label: string;      // 列标题
  width?: number;     // 列宽（可选，默认为 10）
  dateFormat?: string; // 时间格式（可选，如 "yyyy-mm-dd hh:mm:ss"）
}
```

**注意：**
- `width` 不需要写单位，这是直接输入到 Excel 的值。
- `dateFormat` 用于指定时间字段的显示格式，支持 Excel 的标准格式代码。

### 字段过滤

只有在 `config` 中指定的字段才会被导出，其他字段会被过滤掉：

```ts
const users = [
  { id: 1, name: "张三", age: 25, email: "zhangsan@example.com" }
];

const config = {
  id: { label: "ID" },
  name: { label: "姓名" }
  // age 和 email 不会被导出
};

arrayToExcel(users, config);
```

### 跳过列

将配置值设为 `undefined` 可以跳过该列：

```ts
const config = {
  id: { label: "ID" },
  name: { label: "姓名" },
  age: undefined  // 跳过 age 列
};
```

### 时间格式配置

使用 `dateFormat` 指定时间字段的显示格式：

```ts
const users = [
  { id: 1, name: "张三", registerTime: new Date() },
  { id: 2, name: "李四", registerTime: new Date() }
];

const config = {
  id: { label: "ID" },
  name: { label: "姓名" },
  registerTime: {
    label: "注册时间",
    dateFormat: "yyyy-mm-dd hh:mm:ss"  // 显示年月日时分秒
  }
};

arrayToExcel(users, config);
// 导出的 Excel 中，registerTime 列会显示完整的日期时间
```

**常用时间格式：**
- `"yyyy-mm-dd"` - 仅显示年月日
- `"yyyy-mm-dd hh:mm:ss"` - 显示年月日时分秒
- `"hh:mm:ss"` - 仅显示时分秒
- `"mm/dd/yyyy"` - 美式日期格式
- `"dd/mm/yyyy"` - 欧式日期格式
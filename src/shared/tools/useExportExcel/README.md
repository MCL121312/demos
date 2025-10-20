依赖 "xlsx": "^0.18.5"

```ts
import { useExportExcel } from "../../shared/tools/useExportExcel";

const { exportData } = useExportExcel();
const users = [
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
function test() {
  const config = {
    name: { title: "姓名", width: 15 },
    phone: { title: "手机号", width: 20 }
  };
  exportData(users, config);
}
test();
```
config中的 width 不要写单位，这是直接输入到excel的值
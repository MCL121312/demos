import { getPaginatedData } from "../helpers";

interface User {
  id: number;
  name: string;
  phone: string;
  registerTime: Date;
}

// const mockUsers: User[] = [
//   {
//     id: 1,
//     name: "张一",
//     phone: "13800138000",
//     registerTime: new Date("2024/01/15")
//   },
//   {
//     id: 2,
//     name: "李二",
//     phone: "13800138001",
//     registerTime: new Date("2024/02/20")
//   },
//   {
//     id: 3,
//     name: "王三",
//     phone: "13800138002",
//     registerTime: new Date("2024/03/10")
//   },
//   {
//     id: 4,
//     name: "赵四",
//     phone: "13800138003",
//     registerTime: new Date("2024/04/10")
//   },
//   {
//     id: 5,
//     name: "钱五",
//     phone: "13800138004",
//     registerTime: new Date("2024/05/10")
//   },
//   {
//     id: 6,
//     name: "孙六",
//     phone: "13800138005",
//     registerTime: new Date("2024/06/10")
//   },
//   {
//     id: 7,
//     name: "周七",
//     phone: "13800138006",
//     registerTime: new Date("2024/07/10")
//   },
//   {
//     id: 8,
//     name: "吴八",
//     phone: "13800138007",
//     registerTime: new Date("2024/08/10")
//   },
//   {
//     id: 9,
//     name: "郑九",
//     phone: "13800138008",
//     registerTime: new Date("2024/09/10")
//   },
//   {
//     id: 10,
//     name: "王十",
//     phone: "13800138009",
//     registerTime: new Date("2024/10/10")
//   },
//   {
//     id: 11,
//     name: "赵十一",
//     phone: "13800138010",
//     registerTime: new Date("2024/11/10")
//   },
//   {
//     id: 12,
//     name: "钱十二",
//     phone: "13800138011",
//     registerTime: new Date("2024/12/10")
//   },
//   {
//     id: 13,
//     name: "孙十三",
//     phone: "13800138012",
//     registerTime: new Date("2025/01/10")
//   },
//   {
//     id: 14,
//     name: "周十四",
//     phone: "13800138013",
//     registerTime: new Date("2025/02/10")
//   },
//   {
//     id: 15,
//     name: "吴十五",
//     phone: "13800138014",
//     registerTime: new Date("2025/03/10")
//   },
//   {
//     id: 16,
//     name: "郑十六",
//     phone: "13800138015",
//     registerTime: new Date("2025/04/10")
//   },
//   {
//     id: 17,
//     name: "王十七",
//     phone: "13800138016",
//     registerTime: new Date("2025/05/10")
//   },
//   {
//     id: 18,
//     name: "赵十八",
//     phone: "13800138017",
//     registerTime: new Date("2025/06/10")
//   },
//   {
//     id: 19,
//     name: "钱十九",
//     phone: "13800138018",
//     registerTime: new Date("2025/07/10")
//   },
//   {
//     id: 20,
//     name: "孙二十",
//     phone: "13800138019",
//     registerTime: new Date("2025/08/10")
//   },
//   {
//     id: 21,
//     name: "周二十一",
//     phone: "13800138020",
//     registerTime: new Date("2025/09/10")
//   }
// ];
const mockUsers: User[] =createSomeUsers(100000)
function createSomeUsers(size:number){

  return  Array.from({length:size},(_,i)=>({
    id:i+1,
    name:`user${i+1}`,
    phone:`18888888888`,
    registerTime:new Date(`2025/01/01`)
  }))
}

export const getUsersApi = async (
  { pageNumber, pageSize }: { pageNumber: number; pageSize: number },
  filters: { name?: string }
): Promise<{
  data: User[];
  total: number;
}> => {
 
  // 过滤
  const filteredUsers = mockUsers.filter(user => {
    if (filters.name && !user.name.includes(filters.name)) return false;
    return true;
  });
  // 分页
  const paginatedData = getPaginatedData(filteredUsers, {
    pageNumber,
    pageSize
  });

  return {
    data: paginatedData,
    total: filteredUsers.length
  };
};

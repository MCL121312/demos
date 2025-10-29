import { getPaginatedData } from "../helpers";

interface User {
  id: number;
  name: string;
  phone: string;
  registerTime: Date;
}

const mockUsers: User[] = [
  {
    id: 1,
    name: "张三",
    phone: "13800138000",
    registerTime: new Date("2024-01-15")
  },
  {
    id: 2,
    name: "李四",
    phone: "13800138001",
    registerTime: new Date("2024-02-20")
  },
  {
    id: 3,
    name: "王五",
    phone: "13800138002",
    registerTime: new Date("2024-03-10")
  }
];

export const getUsers = async (
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
  const { paginatedData, total } = getPaginatedData(filteredUsers, {
    pageNumber,
    pageSize
  });

  return {
    data: paginatedData,
    total
  };
};

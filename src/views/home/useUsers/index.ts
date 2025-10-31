import { getUsers } from "../../../network/apis/users";
import { usePagination } from "../../../shared/tools/usePagination";
// viewModel
interface User {
  id: number;
  name: string;
  phone: string;
  registerTime: Date;
}
type Users = User[];

export const useUsers = () => {
  const users = ref<Users>([]);

  const {
    pagination,
    resetPagination,
    changePageNumber: changePaginationPageNumber,
    changePageSize: changePaginationPageSize,
    pageSizes
  } = usePagination();

  // 重置搜索条件 并搜索
  async function loadUsers() {
    resetPagination();
    await searchUsers(pagination.value);
  }

  interface PaginationFilterConditions {
    pageNumber: number;
    pageSize: number;
  }
  interface KeywordFilterConditions {
    name: string;
  }
  async function searchUsers(
    paginationFilterConditions: PaginationFilterConditions,
    keywordFilterConditions: KeywordFilterConditions={ name: "" }
  ) {
    
    const { data, total } = await getUsers(paginationFilterConditions, keywordFilterConditions);
    users.value = data;
    pagination.value.total = total;
  }

  const changePageNumber = (newPage: number) => {
    changePaginationPageNumber(newPage);
    // searchUsers(pagination.value);
  };

  const changePageSize = (newSize: number) => {
    changePaginationPageSize(newSize);
    // searchUsers(pagination.value);
  };

  return {
    users,

    loadUsers,
    searchUsers,

    pagination,
    changePageNumber,
    changePageSize,

    pageSizes
  };
};

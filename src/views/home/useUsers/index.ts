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
  } = usePagination();

  async function loadUsers() {
    resetPagination();
    await searchUsers(pagination.value);
  }

  interface PaginationFilter {
    pageNumber: number;
    pageSize: number;
  }
  interface KeywordFilter {
    name: string;
  }
  async function searchUsers(
    paginationFilter: PaginationFilter,
    keywordFilter: KeywordFilter={ name: "" }
  ) {
    const { data, total } = await getUsers(paginationFilter, keywordFilter);
    users.value = data;
    pagination.value.total = total;
  }

  return {
    users,

    loadUsers,
    searchUsers
  };
};

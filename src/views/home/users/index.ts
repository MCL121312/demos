interface User {
    id: number;
    name: string;
    phone: string;
    registerTime:Date;
}
type Users = User[];
export const useUsers = ()=>{
    const users =  ref<Users>([]);

    function loadUsers(){
        users.value = [
            {
                id: 1,
                name: "张三",
                phone: "13800138000",
                registerTime:new Date()
            },
            {
                id: 2,
                name: "李四",
                phone: "13800138001",
                registerTime:new Date()
            },
            {
                id: 3,
                name: "王五",
                phone: "13800138002",
                registerTime:new Date()
            }
        ];
    }

    return {
        users,

        loadUsers
    }
}
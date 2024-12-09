import { useState, useEffect } from "react";

function UserList({socket, currentUser, onSelectedUser}) {
    const [users, setUsers] = useState([]);//список пользователей

    useEffect(() => {
        //если мы залогинились
        if(currentUser) {
            socket.emit("getUsers", (userList) => {
            //получаем полььзователей, добавляем в состояние users, кроме нашего пользователя
            setUsers(userList.filter((user) => user !== currentUser));
        });
        }
    }, [currentUser, socket]);

    return (
        <ul className="list-group rounded-0 overflow-y-auto">
            {users.map((user) => (
                <li
                    className="list-group-item list-group-item-action list-group-item-dark d-flex justify-content-between align-items-start py-4 px-3"
                    key={user}
                    onClick={() => onSelectedUser(user)}
                >
                    <div className="ms-2 me-auto">
                        <div className="fw-bold">{user}</div>
                        Content for list item
                    </div>
                    <span className="badge text-bg-primary rounded-pill">
                        14
                    </span>
                </li>
            ))}
        </ul>
    );
}

export default UserList;

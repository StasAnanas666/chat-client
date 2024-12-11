import { useState, useEffect } from "react";

function UserList({socket, currentUser, onSelectedUser}) {
    const [users, setUsers] = useState([]);//список пользователей
    const [unreadMessages, setUnreadMessages] = useState({});

    useEffect(() => {
        //если мы залогинились
        if(currentUser) {
            socket.emit("getUsers", (userList) => {
            //получаем полььзователей, добавляем в состояние users, кроме нашего пользователя
            setUsers(userList.filter((user) => user.name !== currentUser.name));
        });
        }
        //запрашиваем количество непрочитанных сообщений
        socket.emit("getUnreadMessages", currentUser.id, (unreadList) => {
            const counts = {};//объект с записями id отправителей в виде ключа и количества непрочитанных от них сообщений в виде значения
            unreadList.forEach(item => {
                counts[item.senderid] = item.unread_messages;
            })
            setUnreadMessages(counts);
        })
        //обновить количество непрочитанных сообщений, если пришло новое во время онлайна
        socket.on("newMessage", (msg) => {
            if(msg.receiverid === currentUser.id && msg.senderid !== currentUser.id) {
                setUnreadMessages(prev => ({
                    ...prev, [msg.senderid]:(prev[msg.senderid] || 0) + 1
                }))
            }
        });
        //реакция на событие регистрации нового пользователя в приложении(добавляем в список пользователей)
        socket.on("newUser", (newUser) => {
            setUsers((prev) => [...prev, newUser.name]);
        });
        return () => {
            socket.off("newMessage");
            socket.off("newUser");
        };
    }, [currentUser, socket]);

    return (
        <ul className="list-group rounded-0 overflow-y-auto">
            {users.map((user) => (
                <li
                    className="list-group-item list-group-item-action list-group-item-dark d-flex justify-content-between align-items-start py-4 px-3"
                    key={user.id}
                    onClick={() => onSelectedUser(user.name)}
                >
                    <div className="ms-2 me-auto">
                        <div className="fw-bold">{user.name}</div>
                        Content for list item
                    </div>
                    {unreadMessages[user.id] > 0 && (
                        <span className="badge text-bg-primary rounded-pill">
                            {unreadMessages[user.id]}
                        </span>
                    )}
                </li>
            ))}
        </ul>
    );
}

export default UserList;

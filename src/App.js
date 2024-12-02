import { useState, useEffect } from "react";
import io from "socket.io-client";
import Login from "./Components/Login";

const socket = io("http://localhost:5555");

function App() {
    const [currentUser, setCurrentUser] = useState(null); //наш пользователь
    const [users, setUsers] = useState([]); //список пользователей
    const [selectedUser, setSelectedUser] = useState(""); //выбранный пользователь из списка, для которого загузится переписка
    const [message, setMessage] = useState(""); //отправляемое сообщение
    const [messages, setMessages] = useState([]); //переписка

    //реагируем на сообщение от сервера newMessage после записи сообщения в БД, получаем его и записываем в состояние messages
    useEffect(() => {
        socket.on("newMessage", (msg) => {
            setMessages((prev) => [...prev, msg]);
            console.log(msg);
        });
        return () => socket.off("newMessage");
    }, []);

    const handleLogin = (e, name) => {
        e.preventDefault();
        socket.emit("checkUser", name, (response) => {
            if (response.success) {
                setCurrentUser({id: response.userId, name});
                loadUsers();
            } else {
                alert(response.error);
            }
        });
    };

    const loadUsers = () => {
        socket.emit("getUsers", (userList) => {
            //получаем полььзователей, добавляем в состояние users, кроме нашего пользователя
            setUsers(userList.filter((user) => user !== currentUser.name));
        });
    };

    const loadMessages = (receiverUser) => {
        //при выборе пользователя из списка отправляем запрос на получение переписки с ним
        setSelectedUser(receiverUser);
        socket.emit(
            "getMessages",
            { userId: currentUser.id, receiverUserName: receiverUser },
            (msgList) => {
                setMessages(msgList);
                console.log(msgList);
            }
        );
    };

    const sendMessage = () => {
        socket.emit("sendMessage", {
            senderid: currentUser.id,
            receiverName: selectedUser,
            message,
        });
        setMessage("");
    };

    return (
        <div className="container-fluid">
            {!currentUser ? (
                //форма "авторизации"
                <Login onLogin={handleLogin} />
            ) : (
                <div className="row min-vh-100">
                    <div className="col-4 px-0 bg-secondary">
                        <div className="app-header py-3 px-3 bg-dark text-light sticky-top">
                            <h5 className="mb-3">Chat App</h5>
                        </div>
                        {/* список пользователей */}
                        <ul className="list-group rounded-0">
                            {users.map((user) => (
                                <li
                                    className="list-group-item list-group-item-action list-group-item-dark d-flex justify-content-between align-items-start py-4 px-3"
                                    key={user}
                                    onClick={() => loadMessages(user)}
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
                    </div>
                    <div className="col-8 px-0">
                        <div
                            className="d-flex flex-column min-vh-100"
                        >
                            <div className="chat-header px-3 py-3 bg-dark text-light sticky-top">
                                <h5 className="mb-3">Чат с {selectedUser}</h5>
                            </div>
                            {/* чат с пользователем */}
                            <div className="chat-messages px-3 flex-grow-1">
                                <div className="d-flex flex-column my-5">
                                    {messages.map((msg, index) =>
                                        (msg.senderid === currentUser.id ? (
                                            <div
                                                className="bg-primary text-light py-2 px-4 ms-auto my-2 rounded-3 border-1 d-flex flex-column"
                                                key={index}
                                            >
                                                <span>{msg.message}</span>
                                                <span style={{fontSize: "12px"}}>{msg.timestamp}</span>
                                            </div>
                                        ) : (
                                            <div
                                                className="bg-secondary text-light py-2 px-4 me-auto my-2 rounded-3 border-1 d-flex flex-column"
                                                key={index}
                                            >
                                                <span className="fw-bold text-primary">
                                                    {selectedUser}
                                                </span>
                                                <span>{msg.message}</span>
                                                <span style={{fontSize: "12px"}}>{msg.timestamp}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="chat-input px-3 py-4 sticky-bottom">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Введите сообщение..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === "Enter" && sendMessage()
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;

import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5555");

function App() {
    const [name, setName] = useState(""); //имя нашего пользователя
    const [userId, setUserId] = useState(null); //id нашего пользователя
    const [users, setUsers] = useState([]); //список пользователей
    const [selectedUser, setSelectedUser] = useState(""); //выбранный пользователь из списка, для которого загузится переписка
    const [message, setMessage] = useState(""); //отправляемое сообщение
    const [messages, setMessages] = useState([]); //переписка

    //реагируем на сообщение от сервера newMessage после записи сообщения в БД, получаем его и записываем в состояние messages
    useEffect(() => {
        socket.on("newMessage", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });
        return () => socket.off("newMessage");
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        socket.emit("checkUser", name, (response) => {
            if (response.success) {
                setUserId(response.userId);
                loadUsers();
            } else {
                alert(response.error);
            }
        });
    };

    const loadUsers = () => {
        socket.emit("getUsers", (userList) => {
            //получаем полььзователей, добавляем в состояние users, кроме нашего пользователя
            setUsers(userList.filter((user) => user !== name));
        });
    };

    const loadMessages = (receiverUser) => {
        //при выборе пользователя из списка отправляем запрос на получение переписки с ним
        setSelectedUser(receiverUser);
        socket.emit(
            "getMessages",
            { userId, receiverUserName: receiverUser },
            (msgList) => {
                setMessages(msgList);
            }
        );
    };

    const sendMessage = () => {
        socket.emit("sendMessage", {
            senderId: userId,
            receiverName: selectedUser,
            message,
        });
        setMessage("");
    };

    return (
        <div className="container-fluid">
            {!userId ? (
                <div className="container">
                    <div
                        className="d-flex justify-content-center align-items-center"
                        style={{ minHeight: "92vh" }}
                    >
                        <form
                            onSubmit={handleLogin}
                            className="d-flex justify-content-center align-items-center w-50"
                        >
                            <input
                                type="text"
                                className="form-control me-4"
                                placeholder="Введите ваше имя..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <button
                                className="btn btn-outline-success"
                                type="submit"
                            >
                                Войти
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="row min-vh-100">
                    <div className="col-4 px-0">
                        <div className="app-header py-3 px-3 bg-dark text-light">
                            <h5 className="mb-3">Chat App</h5>
                        </div>
                        <ul className="list-group my-5 px-3">
                            {users.map((user) => (
                                <li
                                    className="list-group-item"
                                    key={user}
                                    onClick={() => loadMessages(user)}
                                >
                                    {user}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="col-8 px-0">
                        <div
                            className="d-flex flex-column"
                            style={{ minHeight: "95vh" }}
                        >
                            <div className="chat-header px-3 py-3 bg-dark text-light">
                                <h5 className="mb-3">Чат с {selectedUser}</h5>
                            </div>
                            <div className="chat-messages px-3 flex-grow-1">
                                <ul className="list-group my-5">
                                    {messages.map((msg, index) => (
                                        <li
                                            className="list-group-item"
                                            key={index}
                                        >
                                            <span className="fw-bold">
                                                {msg.senderid === userId
                                                    ? "Вы"
                                                    : selectedUser}
                                                :{" "}
                                            </span>
                                            <span>{msg.message}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="chat-input px-3">
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

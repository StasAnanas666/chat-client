import { useState, useEffect } from "react";
import io from "socket.io-client";
import Login from "./Components/Login";
import UserList from "./Components/UserList";
import Chat from "./Components/Chat";
import AppHeader from "./Components/AppHeader";

const socket = io("https://chat-server-z3gi.onrender.com");
//const socket = io("http://localhost:5555");

function App() {
    const [currentUser, setCurrentUser] = useState(null); //наш пользователь
    const [selectedUser, setSelectedUser] = useState(""); //выбранный пользователь из списка, для которого загузится переписка

    //загрузка пользователя из localStorage, если есть
    useEffect(() => {
        let user = JSON.parse(localStorage.getItem("currentUser"));
        if(user) {
            setCurrentUser(user);
        }
    }, [])

    //todo: добавить в таблицу users флаг is_online, устанавливать true, когда авторизовались
    //вход в чат
    const handleLogin = (name) => {
        socket.emit("checkUser", name, (response) => {
            if (response.success) {
                const user = { id: response.userId, name };
                setCurrentUser(user);
                //запись в LocalStorage
                localStorage.setItem("currentUser", JSON.stringify(user));
            } else {
                alert(response.error);
            }
        });
    };

    //todo: при выходе сбрасывать флаг is_online в false и заисывать в таблицу users текущее время(время выхода). на его основе посчитать разницу с текущим временем и вывести, когда пользователь был в сети последний раз

    //выход из чата на страницу входа
    const handleLogout = () => {
        setCurrentUser(null);
        setSelectedUser("");
        //удаление текущего пользователя из localStorage
        localStorage.removeItem("currentUser");
    }

    const handleSelectedUser = (receiverUser) => {
        //при выборе пользователя из списка отправляем запрос на получение переписки с ним
        setSelectedUser(receiverUser);
    };

    return (
        <div className="container-fluid">
            {!currentUser ? (
                //форма "авторизации"
                <Login onLogin={handleLogin} />
            ) : (
                <div className="row vh-100">
                    <div className="col-4 px-0 bg-secondary">
                        <AppHeader currentUser={currentUser} onLogout={handleLogout} />
                        {/* список пользователей */}
                        <UserList
                            socket={socket}
                            currentUser={currentUser}
                            onSelectedUser={handleSelectedUser}
                        />
                    </div>
                    <div className="col-8 px-0">
                        {/* чат с пользователем */}
                        {selectedUser && (
                            <Chat
                            socket={socket}
                            currentUser={currentUser}
                            selectedUser={selectedUser}
                        />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;

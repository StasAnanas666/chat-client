import { useState, useEffect } from "react";
import io from "socket.io-client";
import Login from "./Components/Login";
import UserList from "./Components/UserList";
import Chat from "./Components/Chat";

const socket = io("http://localhost:5555");

function App() {
    const [currentUser, setCurrentUser] = useState(null); //наш пользователь
    const [selectedUser, setSelectedUser] = useState(""); //выбранный пользователь из списка, для которого загузится переписка

    //срабатывает после авторизации и при каждом изменении currentUser
    useEffect(() => {
        if(currentUser !== null) {
            localStorage.setItem("currentUser", currentUser);
            console.log(currentUser);
        }
    }, [currentUser])

    useEffect(() => {
        let user = localStorage.getItem("currentUser");
        if(user !== null) {
            setCurrentUser(user);
            console.log(currentUser);
        }
    }, [])

    const handleLogin = (name) => {
        socket.emit("checkUser", name, (response) => {
            if (response.success) {
                setCurrentUser({ id: response.userId, name });
            } else {
                alert(response.error);
            }
        });
    };

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
                <div className="row min-vh-100">
                    <div className="col-4 px-0 bg-secondary">
                        <div className="app-header py-3 px-3 bg-dark text-light sticky-top">
                            <h5 className="mb-3">Chat App</h5>
                        </div>
                        {/* список пользователей */}
                        <UserList
                            socket={socket}
                            currentUser={currentUser.name}
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

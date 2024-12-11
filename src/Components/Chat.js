import { useState, useEffect } from "react";
import { format } from "date-fns";

function Chat({ socket, currentUser, selectedUser }) {
    const [message, setMessage] = useState(""); //отправляемое сообщение
    const [messages, setMessages] = useState([]); //переписка

    useEffect(() => {
        //если в списке нажат пользователь - загрузить переписку с ним
        if (selectedUser) {
            socket.emit(
                "getMessages",
                { userId: currentUser.id, receiverUserName: selectedUser },
                (msgList) => {
                    setMessages(msgList);
                }
            );
        }
    }, [selectedUser, currentUser.id, socket]);

    //реагируем на сообщение от сервера newMessage после записи сообщения в БД, получаем его и записываем в состояние messages
    useEffect(() => {
        socket.on("newMessage", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });
        return () => socket.off("newMessage");
    }, [currentUser.id, selectedUser.id, socket]);

    const sendMessage = () => {
        socket.emit("sendMessage", {
            senderid: currentUser.id,
            receiverName: selectedUser,
            message,
        });
        setMessage("");
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            <div className="chat-header px-3 py-3 bg-dark text-light sticky-top">
                <h5 className="mb-3">{selectedUser}</h5>
            </div>
            <div className="chat-messages px-3 flex-grow-1 overflow-y-auto">
                <div className="d-flex flex-column my-5">
                    {messages.map((msg, index) =>
                        msg.senderid === currentUser.id ? (
                            <div
                                className="bg-primary text-light py-2 px-4 ms-auto my-2 rounded-3 border-1 d-flex flex-column"
                                key={index}
                            >
                                <span>{msg.message}</span>
                                <span style={{ fontSize: "12px" }}>
                                    {msg.timestamp &&
                                        format(
                                            new Date(msg.timestamp),
                                            "dd.MM.yyyy HH:mm"
                                        )}
                                </span>
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
                                <span style={{ fontSize: "12px" }}>
                                    {msg.timestamp &&
                                        format(
                                            new Date(msg.timestamp),
                                            "dd.MM.yyyy HH:mm"
                                        )}
                                </span>
                            </div>
                        )
                    )}
                </div>
            </div>
            <div className="chat-input px-3 py-4 sticky-bottom bg-dark">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Введите сообщение..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
            </div>
        </div>
    );
}

export default Chat;

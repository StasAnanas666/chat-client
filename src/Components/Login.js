import { useState } from "react";

function Login({ onLogin }) {
    const [name, setName] = useState(""); //имя нашего пользователя

    const handleLogin = (e) => {
        e.preventDefault();
        onLogin(name);
    };

    return (
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
                    <button className="btn btn-outline-success" type="submit">
                        Войти
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;

function AppHeader({ currentUser, onLogout }) {
    return (
        <div className="app-header px-3 py-3 bg-dark text-light sticky-top d-flex align-items-center">
            <h5>Chat App</h5>
            <div className="dropdown ms-auto">
                <button
                    className="btn btn-dark dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    <span className="fw-bold">{currentUser.name}</span>
                </button>
                <ul className="dropdown-menu">
                    <li>
                        <button className="dropdown-item" onClick={onLogout}>
                            Выйти
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default AppHeader;

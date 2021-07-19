import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import './App.css';
import AuthedApp from './AuthedApp';
import Login from './Login';

export interface Ticket {
    title: string;
    number: number;
    content: string;
    id: string;
}

/**
 * null removes the record
 */
const useStorage = (key: string, initialState: string | null, storage: Storage = localStorage) => {
    const useStateResult = useState(() => storage.getItem(key) ?? initialState);
    const [value] = useStateResult;

    useEffect(() => {
        if (value !== null) {
            storage.setItem(key, value);
        } else {
            storage.removeItem(key);
        }
    }, [key, value, storage]);

    return useStateResult;
}

const App = () => {
    const [token, setToken] = useStorage('token', null);

    return <div className="App-wrapper">
        <div className="App">
            <Navbar>
                <Navbar.Brand className="me-auto">Tickety</Navbar.Brand>
                {token !== null && <Nav>
                    <Nav.Link onClick={() => setToken(null)}>Wyloguj</Nav.Link>
                </Nav>}
            </Navbar>
            {token !== null
                ? <AuthedApp token={token} />
                : <Login onLogin={(username, token) => {
                    setToken(token);
                }} />
            }
        </div>
    </div>;
}

export default App;

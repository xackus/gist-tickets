import 'bootstrap/dist/css/bootstrap.min.css';
import { Octokit } from '@octokit/core';
import { useEffect, useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import './App.css';
import AuthedApp from './AuthedApp';
import Login from './Login';

export interface Ticket {
    title: string;
    number: number;
    content: string;
    id: string;
}

export interface User {
    name: string;
    octokit: Octokit;
}

export interface Credentials {
    name: string;
    token: string;
}

/**
 * null removes the record
 */
const useStorage = <T,>(key: string, initialState: T | null, storage: Storage = localStorage) => {
    const useStateResult = useState<T | null>(() => {
        const item = storage.getItem(key);
        if (item !== null) return JSON.parse(item);
        return initialState;
    });
    const [value] = useStateResult;

    useEffect(() => {
        if (value !== null) {
            storage.setItem(key, JSON.stringify(value));
        } else {
            storage.removeItem(key);
        }
    }, [key, value, storage]);

    return useStateResult;
}

const App = () => {
    const [credentials, setCredentials] = useStorage<Credentials>('credentials', null);

    return <div className="App-wrapper">
        <div className="App">
            <Navbar variant="light" bg="light" expand="sm" className="mb-3">
                <Container>
                    <Navbar.Brand>Tickety</Navbar.Brand>
                    {credentials !== null && <>
                        <Navbar.Toggle />
                        <Navbar.Collapse className="justify-content-end">
                            <Navbar.Text>Użytkownik: {credentials.name}</Navbar.Text>
                            <Nav>
                                <Nav.Link onClick={() => setCredentials(null)}>Wyloguj</Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </>}
                </Container>
            </Navbar>
            {credentials !== null
                ? <AuthedApp user={{ name: credentials.name, octokit: new Octokit({ auth: credentials.token }) }} />
                : <Login onLogin={(name, token) => {
                    setCredentials({ name, token });
                }} />
            }
        </div>
    </div>;
}

export default App;

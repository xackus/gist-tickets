import { Octokit } from '@octokit/core';
import { useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';

interface LoginProps {
    onLogin: (username: string, token: string) => void;
}

const Login = ({ onLogin }: LoginProps) => {
    const [username, setUsername] = useState('');
    const [token, setToken] = useState('');
    const [validated, setValidated] = useState(false);
    const [error, setError] = useState<string | null>(null);

    return <div className="Login">
        <Form noValidate validated={validated} onSubmit={async event => {
            event.preventDefault();
            if (!event.currentTarget.checkValidity()) {
                setValidated(true);
                return;
            }
            try {
                const octokit = new Octokit({ auth: token });
                const response = await octokit.request('GET /user');
                setValidated(false);
                if (username !== response.data.login) {
                    setError('Nieprawidłowe dane logowania.');
                } else if (!response.headers['x-oauth-scopes']?.split(', ').includes('gist')) {
                    setError('Token nie ma uprawnienia "gist".');
                } else {
                    onLogin(response.data.login, token);
                }
            } catch (error) {
                setValidated(false);
                if (error.status === 401) {
                    setError('Nieprawidłowe dane logowania.');
                } else if (error.status === 500) {
                    setError('Nieudane połączenie z serwerem.');
                } else {
                    setError(`Wystąpił błąd. (${error.status} ${error.message})`);
                }
            }
        }}>
            <Form.Group className="mb-3" controlId="Login-username">
                <Form.Label>Nazwa użytkownika</Form.Label>
                <Form.Control type="text" value={username} onChange={event => setUsername(event.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="Login-token">
                <Form.Label>Klucz API</Form.Label>
                <Form.Control type="password" value={token} onChange={event => setToken(event.target.value)} required />
            </Form.Group>
            {error !== null && <Alert variant="danger">
                {error}
            </Alert>}
            <div className="text-center">
                <Button variant="primary" type="submit">Zaloguj</Button>
            </div>
        </Form>
    </div>;
};

export default Login;

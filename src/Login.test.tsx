import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'jest-fetch-mock';
import React from 'react';
import Login from './Login';

describe('Login', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    })

    const fillForm = () => {
        userEvent.type(screen.getByLabelText('Nazwa użytkownika'), 'test_user');
        userEvent.type(screen.getByLabelText('Klucz API'), 'test_token');
        userEvent.click(screen.getByText('Zaloguj'));
    }

    test('handles success', async () => {
        fetchMock.mockResponse(JSON.stringify({ login: 'test_user' }), {
            headers: {
                'content-type': 'application/json; charset=utf-8',
                'x-oauth-scopes': 'user, gist',
            },
        });
        const onLogin = jest.fn();
        render(<Login onLogin={onLogin} />);
        fillForm();
        await waitFor(() => expect(onLogin).toHaveBeenCalledTimes(1));
    });

    test('handles no gist scope', async () => {
        fetchMock.mockResponse(JSON.stringify({ login: 'test_user' }), {
            headers: { 'content-type': 'application/json; charset=utf-8' },
        });
        render(<Login onLogin={() => { }} />);
        fillForm();
        expect(await screen.findByText('Token nie ma uprawnienia "gist".')).toBeInTheDocument();
    });

    test('handles 401', async () => {
        fetchMock.mockResponse('', { status: 401 });
        render(<Login onLogin={() => { }} />);
        fillForm();
        expect(await screen.findByText('Nieprawidłowe dane logowania.')).toBeInTheDocument();
    });

    test('handles 500', async () => {
        fetchMock.mockResponse('', { status: 500 });
        render(<Login onLogin={() => { }} />);
        fillForm();
        expect(await screen.findByText('Nieudane połączenie z serwerem.')).toBeInTheDocument();
    });

    test('handles other error', async () => {
        fetchMock.mockResponse(JSON.stringify({ message: 'Test message' }), {
            status: 400,
            headers: { 'content-type': 'application/json; charset=utf-8' },
        });
        render(<Login onLogin={() => { }} />);
        fillForm();
        expect(await screen.findByText('Wystąpił błąd. (400 Test message)')).toBeInTheDocument();
    });

    test('handles reject', async () => {
        fetchMock.mockReject(new Error());
        render(<Login onLogin={() => { }} />);
        fillForm();
        expect(await screen.findByText('Nieudane połączenie z serwerem.')).toBeInTheDocument();
    });
});

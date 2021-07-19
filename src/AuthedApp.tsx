import 'bootstrap/dist/css/bootstrap.min.css';
import { Octokit } from 'octokit';
import { useEffect, useState } from 'react';
import { Alert, Button } from 'react-bootstrap';
import AddTicket from './AddTicket';
import './App.css';
import List from './List';

export interface Ticket {
    title: string;
    number: number;
    content: string;
    id: string;
}

interface AuthedAppProps {
    token: string;
}

const AuthedApp = ({ token }: AuthedAppProps) => {
    const [view, setView] = useState<'list' | 'add'>('list');
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [successMsg, setSuccessMsg] = useState(false);

    const fetchTickets = () => {
        const octokit = new Octokit({ auth: token });
        octokit.graphql(`
            query {
                viewer {
                    login
                    gists (first: 30, orderBy: {field: CREATED_AT, direction: DESC}, privacy: ALL ) {
                        nodes {
                            id
                            description
                            files (limit: 1) {
                                name
                                text
                            }
                        }
                    }
                }
            }
        `).then(response => setTickets((response as any).viewer.gists.nodes.flatMap((gist: any) => {
            const file = gist.files?.[0];
            if (file?.name !== 'ticket.json' || typeof file?.text !== 'string') return [];
            let parsed;
            try {
                parsed = JSON.parse(file.text)
            } catch (err) {
                return [];
            }
            if (typeof parsed.number !== 'number' || typeof parsed.content !== 'string') return [];
            return [{
                title: gist.description,
                number: parsed.number,
                content: parsed.content,
                id: gist.id,
            }];
        })), err => console.dir(err));
    };

    useEffect(fetchTickets, [token]);

    return <div>
        {view === 'list' &&
            <>
                {successMsg && <Alert variant="success">Dodano ticket.</Alert>}
                <div className="mb-3">
                    <Button onClick={() => setView('add')}>Utwórz</Button>
                </div>
                <List tickets={tickets} onDelete={id => {
                    const octokit = new Octokit({ auth: token });
                    octokit.rest.gists.delete({
                        // TODO
                        gist_id: atob(id).slice(7),
                    }).then(response => {
                        setTickets(tickets.filter(ticket => ticket.id !== id));
                        // setSuccessMsg(true);
                    }, error => console.dir(error));
                }} />
            </>
        }
        {view === 'add' &&
            <AddTicket onAdd={ticket => {
                const octokit = new Octokit({ auth: token });
                octokit.rest.gists.create({
                    description: ticket.title,
                    files: {
                        'ticket.json': { content: JSON.stringify({ number: ticket.number, content: ticket.content }) },
                    },
                    public: false,
                }).then(response => {
                    setTickets([{ ...ticket, id: response.data.id! }, ...tickets])
                    setView('list');
                    setSuccessMsg(true);
                }, error => console.dir(error));
            }} />
        }
    </div>;
}

export default AuthedApp;

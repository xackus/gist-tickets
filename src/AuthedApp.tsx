import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';
import AddTicket from './AddTicket';
import { User } from './App';
import './App.css';
import List from './List';

export interface Ticket {
    title: string;
    number: number;
    content: string;
    id: string;
}

interface AuthedAppProps {
    user: User;
}

const TICKET_FILENAME = 'ticket.json';

const AuthedApp = ({ user }: AuthedAppProps) => {
    const [view, setView] = useState<'list' | 'add'>('list');
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [successMsg, setSuccessMsg] = useState(false);

    const { octokit } = user;

    useEffect(() => {
        const fetchTickets = async () => {
            // Use graphql to fetch all files in one request.
            // Unfortunately right now the graphql API does not support deleting gists
            // and the REST API needs gist_id rather than node_id.
            // Use the REST API to obtain gist_id.
            try {
                const unfiltered_list = await octokit.request('GET /gists');

                const list = unfiltered_list.data.filter(gist => {
                    const filenames = Object.keys(gist.files);
                    return filenames.length === 1 && filenames[0] === TICKET_FILENAME;
                });

                const node_id_to_gist_id = new Map(list.map(gist => [gist.node_id, gist.id]));

                const { nodes } = await octokit.graphql(`
                    query gists($node_ids: [ID!]!){
                        nodes(ids: $node_ids) {
                            ... on Gist {
                                id
                                description
                                files (limit: 1) {
                                    name
                                    text
                                }
                            }
                        }
                    }
                `, {
                    node_ids: list.map(gist => gist.node_id)
                });
                setTickets(nodes.flatMap((gist: any) => {
                    const file = gist?.files?.[0];
                    if (typeof gist?.description !== 'string') return [];
                    if (file?.name !== TICKET_FILENAME || typeof file?.text !== 'string') return [];
                    let parsed;
                    try {
                        parsed = JSON.parse(file.text)
                    } catch (err) {
                        return [];
                    }
                    if (typeof parsed?.number !== 'number' || typeof parsed?.content !== 'string') return [];
                    return [{
                        title: gist.description,
                        number: parsed.number,
                        content: parsed.content,
                        id: node_id_to_gist_id.get(gist.id),
                    }];
                }));
            } catch (error) {
                console.dir(error)
            }
        };
        fetchTickets();
    }, [octokit]);

    return <div>
        {successMsg && <Alert variant="success">Dodano ticket.</Alert>}
        <div className="mb-3">
            <Button onClick={() => setView('add')}>Utwórz</Button>
        </div>
        <List tickets={tickets} onDelete={id => {
            octokit.request('DELETE /gists/{gist_id}', {
                gist_id: id,
            }).then(response => {
                setTickets(tickets.filter(ticket => ticket.id !== id));
                setSuccessMsg(false);
            }, error => console.dir(error));
        }} />
        {/* Looks like there is a bug in Modal type definition
            Probably Element instead of Element[] somewhere
        // @ts-ignore */}
        <Modal show={view === 'add'} onHide={() => setView('list')} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Utwórz ticket</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <AddTicket onAdd={ticket => {
                    octokit.request('POST /gists', {
                        description: ticket.title,
                        files: {
                            [TICKET_FILENAME]: { content: JSON.stringify({ number: ticket.number, content: ticket.content }) },
                        },
                        public: false,
                    }).then(response => {
                        setTickets([{ ...ticket, id: response.data.id! }, ...tickets])
                        setView('list');
                        setSuccessMsg(true);
                    }, error => console.dir(error));
                }} />
            </Modal.Body>
        </Modal>
    </div>;
}

export default AuthedApp;

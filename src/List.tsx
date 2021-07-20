import { Button, ListGroup } from 'react-bootstrap';
import { GoTrashcan } from "react-icons/go";
import { Ticket } from './App';

interface ListProps {
    tickets: Ticket[];
    onDelete: (id: string) => void;
}

const List = ({ tickets, onDelete }: ListProps) => {
    return <ListGroup>
        {tickets.map(ticket => <ListGroup.Item key={ticket.id} className="List-item">
            <div className="List-item-header">
                <h3>{ticket.title} <span className="List-item-number">#{ticket.number}</span></h3>
                <Button onClick={() => onDelete(ticket.id)} variant="outline-dark" aria-label="Usuń" className="List-item-delete">
                    <GoTrashcan />
                </Button>
            </div>
            {ticket.content.split('\n').map(line => (
                <>{line}<br /></>
            ))}
        </ListGroup.Item>)}
    </ListGroup>;
}

export default List;
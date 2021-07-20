import { useState } from 'react';
import { Accordion, Button, Form } from 'react-bootstrap';
import { Ticket } from './App';

interface AddTicketProps {
    onAdd: (ticket: Omit<Ticket, 'id'>) => void;
}

const AddTicket = ({ onAdd }: AddTicketProps) => {
    const [title, setTitle] = useState('');
    const [number, setNumber] = useState<number | null>(null);
    const [content, setContent] = useState('');
    const [validated, setValidated] = useState(false);

    type Step = 'title' | 'number' | 'content' | undefined;
    const [step, setStep] = useState<Step>('title');

    return <Form noValidate validated={validated} onSubmit={event => {
        event.preventDefault();
        if (title.length === 0) {
            setStep('title');
            setValidated(true);
        } else if (number === null || number < 1) {
            setStep('number');
            setValidated(true);
        } else if (content.length === 0) {
            setStep('content');
            setValidated(true);
        } else {
            onAdd({ title, number, content });
        }
    }}>
        <Accordion className="mb-3" activeKey={step} onSelect={eventKey => setStep((eventKey ?? undefined) as Step)}>
            <Accordion.Item eventKey="title">
                <Accordion.Header id="AddTicket-title-label">Tytuł</Accordion.Header>
                <Accordion.Body>
                    <Form.Control
                        type="text"
                        value={title}
                        onChange={event => setTitle(event.target.value)}
                        required
                        aria-labelledby="AddTicket-title-label"
                    />
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="number">
                <Accordion.Header id="AddTicket-number-label">Numer</Accordion.Header>
                <Accordion.Body>
                    <Form.Control
                        type="number"
                        value={number ?? ''}
                        min={1}
                        onChange={event => {
                            const val = parseInt(event.target.value, 10);
                            setNumber(isNaN(val) ? null : val);
                        }}
                        required
                        aria-labelledby="AddTicket-number-label"
                    />
                </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="content">
                <Accordion.Header id="AddTicket-content-label">Treść</Accordion.Header>
                <Accordion.Body>
                    <Form.Control
                        as="textarea"
                        className="AddTicket-content-textarea"
                        value={content}
                        onChange={event => setContent(event.target.value)}
                        required
                        aria-labelledby="AddTicket-content-label"
                    />
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
        <div className="text-center">
            <Button type="submit">Utwórz</Button>
        </div>
    </Form>
}

export default AddTicket;
import { useEffect, useRef, useState } from 'react';
import './App.css';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

function App() {
    const [connection, setConnection] = useState<HubConnection>();
    const [messages, setMessages] = useState<Array<{ user: string; message: string; }>>([]);
    const [userMessage, setUserMessage] = useState<string>();
    const boxMessage = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const connect = new HubConnectionBuilder()
            .withUrl('http://localhost:5294/chatHub')
            .build();

        setConnection(connect);
    }, []);

    useEffect(() => {
        if (connection) {
            connection.start().then(function () {
                console.log('Connected.');
                setMessages([]);
                setUserMessage('');
                (document!.getElementById("userInput") as HTMLInputElement).disabled = false;
            }).catch(function (err) {
                return console.error(err.toString());
            });
            connection.on("ReceiveMessage", function (user, message) {
                setMessages(oldArray => [...oldArray, { user, message }]);
                if (!userMessage && (document!.getElementById("userInput") as HTMLInputElement).value) {
                    setUserMessage((document!.getElementById("userInput") as HTMLInputElement).value);
                    (document!.getElementById("userInput") as HTMLInputElement).disabled = true;
                }
            });
            connection.onclose(() => {
                console.log("Disconnected.");
            });
        }

    }, [connection]);

    const sendMessage = () => {
        connection?.invoke(
            "SendMessage",
            (document!.getElementById("userInput") as HTMLInputElement).value,
            (document!.getElementById("messageInput") as HTMLInputElement).value
        )
            .catch(function (err) {
                return console.error(err.toString());
            });
    };

    useEffect(() => {
        (boxMessage.current as HTMLDivElement)!.scrollTo({ top: +(boxMessage.current as HTMLDivElement)!.scrollHeight });

    }, [messages]);

    return (
        <div id='box'>
            <div id='box-messages' ref={boxMessage}>
                {
                    messages.map((m, index) => {
                        return (
                            <div key={index} className={'card-message ' + (userMessage === m.user ? 'message-me' : 'message-other')}>
                                <strong>{m.user}</strong> <br />
                                <span>{m.message}</span>
                            </div>

                        );
                    })
                }
            </div>
            <div id='box-send-message'>
                <input type="text" id='userInput' placeholder='Nome' />
                <input type="text" id='messageInput' placeholder='Mensagem' style={{ width: '300px' }} onKeyUp={(event) => {
                    if (event.key === 'Enter') {
                        sendMessage();
                    }
                }} />
                <button onClick={() => sendMessage()}>Send Message</button>

            </div>
        </div>
    );
}

export default App;

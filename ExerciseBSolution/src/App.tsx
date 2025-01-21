import React, { useEffect, useState } from 'react';
import {useWebSocketWithRequests, BaseDto} from "ws-request-hook"

// DTOs
class ClientWantsToSendMessageToRoom extends BaseDto {
  constructor(
      public readonly text: string,
  ) {
    super();
  }
}

class ServerConfirmsMessageSent extends BaseDto {
  constructor(
      public readonly messageId: string,
      public readonly text: string,
      public readonly sender: string,
      public readonly timestamp: number,
  public readonly requestId: string,

) {
    super();
  }
}

class ServerSendsMessageToRoom extends BaseDto {
  constructor(
      public readonly messageId: string,
      public readonly text: string,
      public readonly sender: string,
      public readonly timestamp: number
  ) {
    super();
  }
}

type Message = {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
};

export default function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const { sendRequest, onMessage } = useWebSocketWithRequests('ws://localhost:8181');

  // Subscribe to incoming messages from other users
  useEffect(() => {
    const unsubscribe = onMessage(ServerSendsMessageToRoom, (message) => {
      setMessages(prev => [...prev, {
        id: message.messageId,
        text: message.text,
        sender: message.sender,
        timestamp: message.timestamp
      }]);
    });

    return () => unsubscribe();
  }, [onMessage]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const request = new ClientWantsToSendMessageToRoom(newMessage);

      const response = await sendRequest<
          ClientWantsToSendMessageToRoom,
          ServerConfirmsMessageSent
      >(request);

      setMessages(prev => [...prev, {
        id: response.messageId,
        text: response.text,
        sender: response.sender,
        timestamp: response.timestamp
      }]);

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
      <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
        <div className="flex-1 overflow-y-auto mb-4 space-y-2">
          {messages.map((message) => (
              <div
                  key={message.id}
                  className={`p-3 rounded-lg max-w-[80%] ${
                      message.sender === 'You'
                          ? 'ml-auto bg-blue-500 text-white'
                          : 'bg-gray-100'
                  }`}
              >
                <div className="font-semibold text-sm">
                  {message.sender}
                </div>
                <div>{message.text}</div>
                <div className="text-xs opacity-75">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </form>
      </div>
  );
}
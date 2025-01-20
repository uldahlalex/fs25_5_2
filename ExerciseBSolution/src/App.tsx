import React, { useState, useEffect } from 'react';
import { ReadyState } from 'react-use-websocket';
import {BaseDto, useWebSocketWithRequests} from './UseWebSocketWithRequests';

// Message type for UI state
type Message = {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
};

// DTOs
export interface SendMessageDto extends BaseDto {
  eventType: 'ClientWantsToSendMessage';
  messageId: string;
  text: string;
}

export interface EditMessageDto extends BaseDto {
  eventType: 'EDIT_MESSAGE';
  messageId: string;
  text: string;
}

export interface DeleteMessageDto extends BaseDto {
  eventType: 'DELETE_MESSAGE';
  messageId: string;
}

export default function App() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const { sendRequest, readyState } = useWebSocketWithRequests('ws://localhost:8181');

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Connected',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Disconnected',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const response = await sendRequest<SendMessageDto>({
        eventType: 'SEND_MESSAGE',
        messageId: '',
        text: inputText.trim()
      });

      setMessages(prev => [...prev, {
        id: response.messageId,
        text: inputText,
        sender: 'me',
        timestamp: response.timestamp
      }]);

      setInputText('');
    } catch (error) {
      alert('Failed to send message: ' + (error as Error).message);
    }
  };

  const handleEditMessage = async (messageId: string, newText: string) => {
    try {
      const response = await sendRequest<EditMessageDto>({
        eventType: 'EDIT_MESSAGE',
        messageId,
        text: newText
      });

      if (response.success) {
        setMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, text: newText } : msg
        ));
      }
    } catch (error) {
      alert('Failed to edit message: ' + (error as Error).message);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await sendRequest<DeleteMessageDto>({
        eventType: 'DELETE_MESSAGE',
        messageId
      });

      if (response.success) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
      }
    } catch (error) {
      alert('Failed to delete message: ' + (error as Error).message);
    }
  };

  // Format timestamp helper
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
      <div className="p-4 max-w-2xl mx-auto">
        <div className="mb-4 text-sm font-medium flex items-center gap-2">
          <span>Status: {connectionStatus}</span>
          <div
              className={`w-2 h-2 rounded-full ${
                  readyState === ReadyState.OPEN
                      ? 'bg-green-500'
                      : readyState === ReadyState.CONNECTING
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
              }`}
          />
        </div>

        {/* Messages List */}
        <div className="space-y-2 mb-4 h-96 overflow-y-auto p-4 bg-gray-50 rounded">
          {messages.map((message) => (
              <div
                  key={message.id}
                  className={`p-3 rounded-lg shadow-sm ${
                      message.sender === 'me'
                          ? 'bg-blue-100 ml-auto'
                          : 'bg-white'
                  } max-w-[80%] break-words`}
              >
                <div className="text-sm">{message.text}</div>
                <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">
                {formatTime(message.timestamp)}
              </span>
                  {message.sender === 'me' && (
                      <div className="flex gap-2">
                        <button
                            onClick={() => handleEditMessage(message.id, message.text + ' (edited)')}
                            className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-xs text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                  )}
                </div>
              </div>
          ))}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                readyState === ReadyState.OPEN
                    ? "Type a message..."
                    : "Connecting..."
              }
              className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={readyState !== ReadyState.OPEN}
          />
          <button
              type="submit"
              disabled={readyState !== ReadyState.OPEN || !inputText.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600
                     disabled:bg-gray-300 disabled:cursor-not-allowed
                     transition-colors duration-200"
          >
            Send
          </button>
        </form>
      </div>
  );
}
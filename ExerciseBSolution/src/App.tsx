import React, { useState, useEffect, useCallback, useRef } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import {BaseDto, useWebSocketWithRequests} from "./useWebSocketWithRequests.tsx";

// Base DTO that only enforces eventType exists
// interface BaseDto {
//   eventType: string;
//   [key: string]: any;
// }

// type MessageHandler<T extends BaseDto> = (message: T) => void;

// // WebSocket Hook
// function useWebSocketWithRequests(url: string) {
//   const { sendMessage, lastMessage, readyState } = useWebSocket(url);
//   const pendingRequests = useRef<Map<string, {
//     resolve: (value: any) => void;
//     reject: (error: Error) => void;
//     timeout: NodeJS.Timeout;
//   }>>(new Map());
//
//   const messageHandlers = useRef<Map<string, MessageHandler<any>>>(new Map());
//
//   const sendRequest = useCallback(async <
//       TRequest extends BaseDto,
//       TResponse extends BaseDto
//   >(
//       dto: TRequest,
//       timeoutMs: number = 5000
//   ): Promise<TResponse> => {
//     const requestId = crypto.randomUUID();
//
//     const promise = new Promise<TResponse>((resolve, reject) => {
//       const timeout = setTimeout(() => {
//         pendingRequests.current.delete(requestId);
//         reject(new Error('Request timed out'));
//       }, timeoutMs);
//
//       pendingRequests.current.set(requestId, { resolve, reject, timeout });
//     });
//
//     sendMessage(JSON.stringify({
//       ...dto,
//       requestId
//     }));
//
//     return promise;
//   }, [sendMessage]);
//
//   const onMessage = useCallback(<T extends BaseDto>(
//       eventType: string,
//       handler: MessageHandler<T>
//   ) => {
//     messageHandlers.current.set(eventType, handler);
//     return () => {
//       messageHandlers.current.delete(eventType);
//     };
//   }, []);
//
//   useEffect(() => {
//     if (lastMessage) {
//       try {
//         const message = JSON.parse(lastMessage.data);
//
//         if (message.requestId && pendingRequests.current.has(message.requestId)) {
//           const { resolve, reject, timeout } = pendingRequests.current.get(message.requestId)!;
//           clearTimeout(timeout);
//
//           if (message.error) {
//             reject(new Error(message.error));
//           } else {
//             resolve(message);
//           }
//
//           pendingRequests.current.delete(message.requestId);
//           return;
//         }
//
//         if (message.eventType && messageHandlers.current.has(message.eventType)) {
//           const handler = messageHandlers.current.get(message.eventType)!;
//           handler(message);
//         }
//       } catch (error) {
//         console.error('Failed to parse WebSocket message:', error);
//       }
//     }
//   }, [lastMessage]);
//
//   return {
//     sendRequest,
//     onMessage,
//     readyState
//   };
// }

// Message Types and DTOs
interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
}

// Request-Response DTOs
interface JoinRoomRequest extends BaseDto {
  eventType: 'JOIN_ROOM';
  username: string;
}

interface JoinRoomResponse extends BaseDto {
  eventType: 'ROOM_JOINED';
  username: string;
  activeUsers: string[];
  messageHistory: Message[];
}

interface SendMessageRequest extends BaseDto {
  eventType: 'SEND_MESSAGE';
  text: string;
}

interface MessageSentResponse extends BaseDto {
  eventType: 'MESSAGE_SENT';
  messageId: string;
  text: string;
  timestamp: number;
  sender: string;
}

interface EditMessageRequest extends BaseDto {
  eventType: 'EDIT_MESSAGE';
  messageId: string;
  text: string;
}

interface MessageEditedResponse extends BaseDto {
  eventType: 'MESSAGE_EDITED';
  messageId: string;
  text: string;
  timestamp: number;
}

interface DeleteMessageRequest extends BaseDto {
  eventType: 'DELETE_MESSAGE';
  messageId: string;
}

interface MessageDeletedResponse extends BaseDto {
  eventType: 'MESSAGE_DELETED';
  messageId: string;
}

// Broadcast DTOs
interface BroadcastMessage extends BaseDto {
  eventType: 'NEW_MESSAGE';
  messageId: string;
  text: string;
  timestamp: number;
  sender: string;
}

interface UserJoinedBroadcast extends BaseDto {
  eventType: 'USER_JOINED';
  username: string;
  activeUsers: string[];
}

interface UserLeftBroadcast extends BaseDto {
  eventType: 'USER_LEFT';
  username: string;
  activeUsers: string[];
}

interface MessageEditedBroadcast extends BaseDto {
  eventType: 'MESSAGE_EDITED_BROADCAST';
  messageId: string;
  text: string;
  timestamp: number;
}

interface MessageDeletedBroadcast extends BaseDto {
  eventType: 'MESSAGE_DELETED_BROADCAST';
  messageId: string;
}

// SVG Icons
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2"/>
    </svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
    </svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
);

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);

export default function ChatRoom() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [isJoining, setIsJoining] = useState(true);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { sendRequest, onMessage, readyState } = useWebSocketWithRequests('ws://localhost:8080');

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Set up handlers for broadcast messages
  useEffect(() => {
    const newMessageCleanup = onMessage<BroadcastMessage>('NEW_MESSAGE', (message) => {
      setMessages(prev => [...prev, {
        id: message.messageId,
        text: message.text,
        sender: message.sender,
        timestamp: message.timestamp
      }]);
    });

    const userJoinedCleanup = onMessage<UserJoinedBroadcast>('USER_JOINED', (message) => {
      setActiveUsers(message.activeUsers);
    });

    const userLeftCleanup = onMessage<UserLeftBroadcast>('USER_LEFT', (message) => {
      setActiveUsers(message.activeUsers);
    });

    const messageEditedCleanup = onMessage<MessageEditedBroadcast>('MESSAGE_EDITED_BROADCAST', (message) => {
      setMessages(prev => prev.map(msg =>
          msg.id === message.messageId
              ? { ...msg, text: message.text, timestamp: message.timestamp }
              : msg
      ));
    });

    const messageDeletedCleanup = onMessage<MessageDeletedBroadcast>('MESSAGE_DELETED_BROADCAST', (message) => {
      setMessages(prev => prev.filter(msg => msg.id !== message.messageId));
    });

    return () => {
      newMessageCleanup();
      userJoinedCleanup();
      userLeftCleanup();
      messageEditedCleanup();
      messageDeletedCleanup();
    };
  }, [onMessage]);

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    try {
      const response = await sendRequest<JoinRoomRequest, JoinRoomResponse>({
        eventType: 'JOIN_ROOM',
        username: username.trim()
      });

      setActiveUsers(response.activeUsers);
      setMessages(response.messageHistory);
      setIsJoining(false);
    } catch (error) {
      alert('Failed to join: ' + (error as Error).message);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !username) return;

    try {
      if (editingMessageId) {
        const response = await sendRequest<EditMessageRequest, MessageEditedResponse>({
          eventType: 'EDIT_MESSAGE',
          messageId: editingMessageId,
          text: inputText.trim()
        });

        setMessages(prev => prev.map(msg =>
            msg.id === response.messageId
                ? { ...msg, text: response.text, timestamp: response.timestamp }
                : msg
        ));
        setEditingMessageId(null);
      } else {
        const response = await sendRequest<SendMessageRequest, MessageSentResponse>({
          eventType: 'SEND_MESSAGE',
          text: inputText.trim()
        });

        setMessages(prev => [...prev, {
          id: response.messageId,
          text: response.text,
          sender: response.sender,
          timestamp: response.timestamp
        }]);
      }

      setInputText('');
    } catch (error) {
      alert('Failed to send message: ' + (error as Error).message);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await sendRequest<DeleteMessageRequest, MessageDeletedResponse>({
        eventType: 'DELETE_MESSAGE',
        messageId
      });

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      alert('Failed to delete message: ' + (error as Error).message);
    }
  };

  const handleStartEdit = (message: Message) => {
    setEditingMessageId(message.id);
    setInputText(message.text);
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setInputText('');
  };

  if (isJoining) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <form onSubmit={handleJoinRoom} className="bg-white p-6 rounded-lg shadow-md w-96">
            <h2 className="text-xl font-semibold mb-4">Join Chat Room</h2>
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                type="submit"
                disabled={!username.trim() || readyState !== ReadyState.OPEN}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600
                     disabled:bg-gray-300 disabled:cursor-not-allowed
                     transition-colors duration-200"
            >
              Join Chat
            </button>
          </form>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="border-b p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Chat Room</span>
              <span className={`w-2 h-2 rounded-full ${
                  readyState === ReadyState.OPEN
                      ? 'bg-green-500'
                      : 'bg-red-500'
              }`} />
            </div>
            <div className="flex items-center gap-2">
              <UsersIcon />
              <span className="text-sm text-gray-500">
              {activeUsers.length} active {activeUsers.length === 1 ? 'user' : 'users'}
            </span>
            </div>
          </div>

          {/* Messages */}
          <div className="h-[calc(100vh-280px)] overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
                <div
                    key={message.id}
                    className={`flex flex-col ${
                        message.sender === username ? 'items-end' : 'items-start'
                    }`}
                >
                  <div className={`max-w-[70%] break-words rounded-lg p-3 ${
                      message.sender === username
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100'
                  }`}>
                    <div className="text-sm font-medium mb-1">{message.sender}</div>
                    <div>{message.text}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  {message.sender === username && (
                      <div className="flex gap-2 mt-1">
                        <button
                            onClick={() => handleStartEdit(message)}
                            className="text-gray-500 hover:text-blue-500 transition-colors"
                        >
                          <EditIcon />
                        </button>
                        <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                  )}
                </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="border-t p-4">
            <div className="flex gap-2">
              <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={editingMessageId ? "Edit message..." : "Type a message..."}
                  className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={readyState !== ReadyState.OPEN}
              />
              {editingMessageId && (
                  <button
                      type="button"
                      onClick={cancelEdit}
                      className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <CloseIcon />
                  </button>
              )}
              <button
                  type="submit"
                  disabled={!inputText.trim() || readyState !== ReadyState.OPEN}
                  className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600
                       disabled:bg-gray-300 disabled:cursor-not-allowed
                       transition-colors duration-200"
              >
                <SendIcon />
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}
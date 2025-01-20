import { useEffect, useRef, useCallback } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

// Base DTO types
export interface BaseDto {
    eventType: string;
}

// Example specific DTOs
export interface SendMessageDto extends BaseDto {
    eventType: 'SEND_MESSAGE';
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

// Union type of all possible DTOs
export type ServerDto = SendMessageDto | EditMessageDto | DeleteMessageDto;

// Response types mapped to each DTO
export type ServerResponses = {
    'SEND_MESSAGE': { messageId: string; timestamp: number };
    'EDIT_MESSAGE': { success: boolean };
    'DELETE_MESSAGE': { success: boolean };
}

// Helper type to extract response type based on DTO event type
export type ResponseType<T extends ServerDto> = ServerResponses[T['eventType']];

export function useWebSocketWithRequests(url: string) {
    const { sendMessage, lastMessage, readyState } = useWebSocket(url);
    const pendingRequests = useRef<Map<string, any>>(new Map());

    // Type-safe sendRequest function
    const sendRequest = useCallback(async <T extends ServerDto>(
        dto: T,
        timeoutMs: number = 5000
    ): Promise<ResponseType<T>> => {
        const requestId = crypto.randomUUID();

        const promise = new Promise<ResponseType<T>>((resolve, reject) => {
            const timeout = setTimeout(() => {
                pendingRequests.current.delete(requestId);
                reject(new Error('Request timed out'));
            }, timeoutMs);

            pendingRequests.current.set(requestId, { resolve, reject, timeout });
        });

        sendMessage(JSON.stringify({
            ...dto,
            requestId
        }));

        return promise;
    }, [sendMessage]);

    useEffect(() => {
        if (lastMessage) {
            try {
                const message = JSON.parse(lastMessage.data);
                if (message.requestId && pendingRequests.current.has(message.requestId)) {
                    const { resolve, reject, timeout } = pendingRequests.current.get(message.requestId);
                    clearTimeout(timeout);

                    if (message.error) {
                        reject(new Error(message.error));
                    } else {
                        resolve(message.data);
                    }

                    pendingRequests.current.delete(message.requestId);
                }
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        }
    }, [lastMessage]);

    return {
        sendRequest,
        readyState
    };
}

// Example usage in a component:
export default function ChatRoom() {
    const { sendRequest, readyState } = useWebSocketWithRequests('ws://localhost:8080');

    const handleSendMessage = async (text: string) => {
        try {
            // TypeScript will ensure the DTO is correct
            const response = await sendRequest({
                eventType: 'SEND_MESSAGE',
                text
            });

            // response is typed as { messageId: string; timestamp: number }
            console.log('Message sent with ID:', response.messageId);
        } catch (error) {
            console.error('Failed to send:', error);
        }
    };

    const handleEditMessage = async (messageId: string, text: string) => {
        try {
            const response = await sendRequest({
                eventType: 'EDIT_MESSAGE',
                messageId,
                text
            });

            // response is typed as { success: boolean }
            if (response.success) {
                console.log('Message edited successfully');
            }
        } catch (error) {
            console.error('Failed to edit:', error);
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        try {
            const response = await sendRequest({
                eventType: 'DELETE_MESSAGE',
                messageId
            });

            // response is typed as { success: boolean }
            if (response.success) {
                console.log('Message deleted successfully');
            }
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    return (
        <div>
            {/* Component JSX */}
        </div>
    );
}
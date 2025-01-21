import { useEffect, useRef, useCallback, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

// Base DTO that only enforces eventType exists
export interface BaseDto {
    eventType: string;
    [key: string]: any;
}

type MessageHandler<T extends BaseDto> = (message: T) => void;

export function useWebSocketWithRequests(url: string) {
    const { sendMessage, lastMessage, readyState } = useWebSocket(url);
    const pendingRequests = useRef<Map<string, {
        resolve: (value: any) => void;
        reject: (error: Error) => void;
        timeout: NodeJS.Timeout;
    }>>(new Map());

    // Store message handlers for different event types
    const messageHandlers = useRef<Map<string, MessageHandler<any>>>(new Map());

    const sendRequest = useCallback(async <
        TRequest extends BaseDto,
        TResponse extends BaseDto
    >(
        dto: TRequest,
        timeoutMs: number = 5000
    ): Promise<TResponse> => {
        const requestId = crypto.randomUUID();

        const promise = new Promise<TResponse>((resolve, reject) => {
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

    // Register handler for specific event type
    const onMessage = useCallback(<T extends BaseDto>(
        eventType: string,
        handler: MessageHandler<T>
    ) => {
        messageHandlers.current.set(eventType, handler);

        // Return cleanup function
        return () => {
            messageHandlers.current.delete(eventType);
        };
    }, []);

    useEffect(() => {
        if (lastMessage) {
            try {
                const message = JSON.parse(lastMessage.data);

                // Handle request-response pattern
                if (message.requestId && pendingRequests.current.has(message.requestId)) {
                    const { resolve, reject, timeout } = pendingRequests.current.get(message.requestId)!;
                    clearTimeout(timeout);

                    if (message.error) {
                        reject(new Error(message.error));
                    } else {
                        resolve(message);
                    }

                    pendingRequests.current.delete(message.requestId);
                    return;
                }

                // Handle server-push messages
                if (message.eventType && messageHandlers.current.has(message.eventType)) {
                    const handler = messageHandlers.current.get(message.eventType)!;
                    handler(message);
                }
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        }
    }, [lastMessage]);

    return {
        sendRequest,
        onMessage,
        readyState
    };
}

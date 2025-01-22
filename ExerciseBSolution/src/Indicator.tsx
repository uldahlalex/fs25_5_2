import React, { useEffect } from 'react';
import { useWebSocketWithRequests, ReadyState } from 'ws-request-hook';

// The connection indicator is not part of the assignment / solution, but i just think it's nice to see the connection state
export default function ConnectionIndicator() {
    const { readyState } = useWebSocketWithRequests('ws://localhost:8181');

    useEffect(() => {
        switch (readyState) {
            case ReadyState.OPEN:
                console.log('Connected');
                break;
            case ReadyState.CLOSED:
                console.log('Disconnected');
                break;
        }
    }, [readyState]);

    return (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-full bg-white shadow-md px-3 py-1.5">
            {readyState === ReadyState.OPEN ? (
                <>

                    <span className="text-sm text-green-500">Connected</span>
                </>
            ) : (
                <>
                    <span className="text-sm text-red-500">Disconnected</span>
                </>
            )}
        </div>
    );
}
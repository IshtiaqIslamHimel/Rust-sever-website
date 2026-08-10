import React, { createContext, useContext, useEffect, useState } from 'react';
import { RustServer, KillEvent, WsMessage } from '../types';
import { getWebSocketUrl } from '../config/runtime';

interface WebSocketContextType {
  isConnected: boolean;
  servers: RustServer[];
  totalPlayers: number;
  liveKillfeed: KillEvent[];
  latestKill: KillEvent | null;
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  servers: [],
  totalPlayers: 92660,
  liveKillfeed: [],
  latestKill: null
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [servers, setServers] = useState<RustServer[]>([]);
  const [totalPlayers, setTotalPlayers] = useState(92660);
  const [liveKillfeed, setLiveKillfeed] = useState<KillEvent[]>([]);
  const [latestKill, setLatestKill] = useState<KillEvent | null>(null);

  useEffect(() => {
    const wsUrl = getWebSocketUrl();

    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data: WsMessage = JSON.parse(event.data);
            if (data.type === 'INIT_STATS') {
              setServers(data.servers);
              setTotalPlayers(data.totalPlayers);
              if (data.liveKill) {
                setLatestKill(data.liveKill);
                setLiveKillfeed([data.liveKill]);
              }
            } else if (data.type === 'SERVER_UPDATE') {
              setServers(prev =>
                prev.map(srv =>
                  srv.id === data.serverId
                    ? { ...srv, currentPlayers: data.currentPlayers, pingMs: data.pingMs }
                    : srv
                )
              );
              setTotalPlayers(data.totalPlayers);
            } else if (data.type === 'KILL_EVENT') {
              setLatestKill(data.kill);
              setLiveKillfeed(prev => [data.kill, ...prev.slice(0, 15)]);
            }
          } catch (err) {
            console.error('Failed to parse WS message', err);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimer = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          setIsConnected(false);
        };
      } catch (err) {
        setIsConnected(false);
        reconnectTimer = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimer);
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ isConnected, servers, totalPlayers, liveKillfeed, latestKill }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);

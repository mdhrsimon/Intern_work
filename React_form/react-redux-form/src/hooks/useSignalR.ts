import { createContext, useContext } from "react";
import type { HubConnection } from "@microsoft/signalr";

export interface SignalRContextType {
  connection: HubConnection | null;
  isConnected: boolean;
}

export const SignalRContext = createContext<SignalRContextType>({
  connection: null,
  isConnected: false,
});

export const useSignalR = () => useContext(SignalRContext);

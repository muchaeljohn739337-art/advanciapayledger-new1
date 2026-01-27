import { Socket } from "socket.io";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  isAuthenticated: boolean;
}

declare module "socket.io" {
  interface Socket {
    userId?: string;
    userEmail?: string;
    userRole?: string;
    isAuthenticated: boolean;
  }
}

export { AuthenticatedSocket };

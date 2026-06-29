import jwt from "jsonwebtoken";
import { Socket } from "socket.io";

export const socketAuth = (socket: Socket, next: any) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
    if (!token) return next(new Error("No token provided"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    socket.data.user = decoded; // ✅ Lưu user info vào socket.data
    next();
 } catch (err: any) {
  console.error("Socket auth failed:", err.message);
  next(new Error("Unauthorized"));
}
};

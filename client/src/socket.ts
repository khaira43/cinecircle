// type Listener<T = unknown> = (payload: T) => void;

// type EventMap = {
//     connect: void;
//     "viewer-count": number;
// };

// class MockSocket {
//     private listeners = new Map<keyof EventMap, Set<Listener>>();
//     private activeMediaId: string | null = null;
//     private timerId: number | null = null;
//     connected = false;

//     connect() {
//         if (this.connected) return;
//         this.connected = true;
//         this.emitToListeners("connect", undefined);
//     }

//     disconnect() {
//         if (!this.connected) return;
//         this.connected = false;
//         if (this.timerId) {
//             window.clearInterval(this.timerId);
//             this.timerId = null;
//         }
//         this.activeMediaId = null;
//     }

//     emit(event: string, payload?: string) {
//         if (event === "join-media" && payload) {
//             this.activeMediaId = payload;
//             const seed = Array.from(payload).reduce(
//                 (sum, character) => sum + character.charCodeAt(0),
//                 0
//             );
//             let currentCount = (seed % 18) + 3;
//             this.emitToListeners("viewer-count", currentCount);

//             if (this.timerId) {
//                 window.clearInterval(this.timerId);
//             }

//             this.timerId = window.setInterval(() => {
//                 const delta = Math.floor(Math.random() * 3) - 1;
//                 currentCount = Math.max(1, currentCount + delta);
//                 this.emitToListeners("viewer-count", currentCount);
//             }, 4000);
//         }

//         if (event === "leave-media" && payload && payload === this.activeMediaId) {
//             this.activeMediaId = null;
//             if (this.timerId) {
//                 window.clearInterval(this.timerId);
//                 this.timerId = null;
//             }
//         }
//     }

//     on<T extends keyof EventMap>(event: T, listener: Listener<EventMap[T]>) {
//         const currentListeners = this.listeners.get(event) ?? new Set();
//         currentListeners.add(listener as Listener);
//         this.listeners.set(event, currentListeners);
//     }

//     off<T extends keyof EventMap>(event: T, listener?: Listener<EventMap[T]>) {
//         if (!listener) {
//             this.listeners.delete(event);
//             return;
//         }

//         const currentListeners = this.listeners.get(event);
//         currentListeners?.delete(listener as Listener);

//         if (!currentListeners?.size) {
//             this.listeners.delete(event);
//         }
//     }

//     private emitToListeners<T extends keyof EventMap>(
//         event: T,
//         payload: EventMap[T]
//     ) {
//         const currentListeners = this.listeners.get(event);
//         currentListeners?.forEach((listener) => {
//             (listener as Listener<EventMap[T]>)(payload);
//         });
//     }
// }

// export const socket = new MockSocket();
import { io } from "socket.io-client";
export const socket = io(import.meta.env.VITE_API_BASE_URL);

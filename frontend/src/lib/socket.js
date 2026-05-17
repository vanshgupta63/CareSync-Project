import { io } from 'socket.io-client';

const socket = io('https://caresync-project.onrender.com', { autoConnect: false });

export default socket;

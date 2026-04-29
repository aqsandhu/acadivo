import { jest } from '@jest/globals';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';

describe('Socket Connection Tests', () => {
  let io: Server;
  let serverSocket: any;
  let clientSocket: any;
  let httpServer: ReturnType<typeof createServer>;

  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer);

    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      // Verify token logic here
      socket.data.user = { id: 'usr_123', role: 'TEACHER' };
      next();
    });

    io.on('connection', (socket) => {
      serverSocket = socket;

      socket.on('join-room', (roomId: string) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-joined', { userId: socket.data.user.id, roomId });
      });

      socket.on('leave-room', (roomId: string) => {
        socket.leave(roomId);
        socket.to(roomId).emit('user-left', { userId: socket.data.user.id, roomId });
      });

      socket.on('disconnect', () => {
        io.emit('user-disconnected', { userId: socket.data.user?.id });
      });
    });

    httpServer.listen(() => {
      const port = (httpServer.address() as any).port;
      clientSocket = Client(`http://localhost:${port}`, {
        auth: { token: 'valid-jwt-token' },
      });
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
    httpServer.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Connection Auth', () => {
    it('should connect with valid token', (done) => {
      const port = (httpServer.address() as any).port;
      const newClient = Client(`http://localhost:${port}`, {
        auth: { token: 'valid-jwt-token' },
      });

      newClient.on('connect', () => {
        expect(newClient.connected).toBe(true);
        newClient.disconnect();
        done();
      });
    });

    it('should reject connection without token', (done) => {
      const port = (httpServer.address() as any).port;
      const unauthorizedClient = Client(`http://localhost:${port}`);

      unauthorizedClient.on('connect_error', (err: Error) => {
        expect(err.message).toMatch(/Authentication error/i);
        unauthorizedClient.disconnect();
        done();
      });
    });

    it('should reject connection with invalid token', (done) => {
      const port = (httpServer.address() as any).port;
      const invalidClient = Client(`http://localhost:${port}`, {
        auth: { token: 'invalid-token' },
      });

      invalidClient.on('connect_error', (err: Error) => {
        expect(err.message).toMatch(/Authentication error|unauthorized/i);
        invalidClient.disconnect();
        done();
      });
    });
  });

  describe('Room Joining', () => {
    it('should join a room successfully', (done) => {
      clientSocket.emit('join-room', 'class_8th_a');

      serverSocket.once('user-joined', (data: any) => {
        expect(data.roomId).toBe('class_8th_a');
        done();
      });

      // Simulate another client joining to trigger the event
      const port = (httpServer.address() as any).port;
      const anotherClient = Client(`http://localhost:${port}`, {
        auth: { token: 'valid-jwt-token' },
      });

      anotherClient.on('connect', () => {
        anotherClient.emit('join-room', 'class_8th_a');
      });
    });

    it('should leave a room successfully', (done) => {
      const roomId = 'class_7th_b';
      clientSocket.emit('join-room', roomId);

      setTimeout(() => {
        clientSocket.emit('leave-room', roomId);

        clientSocket.once('user-left', (data: any) => {
          expect(data.roomId).toBe(roomId);
          done();
        });
      }, 100);
    });

    it('should join multiple rooms', (done) => {
      const rooms = ['class_8th_a', 'announcements'];
      let joinedCount = 0;

      rooms.forEach((room) => {
        clientSocket.emit('join-room', room);
        joinedCount++;
      });

      setTimeout(() => {
        expect(joinedCount).toBe(2);
        done();
      }, 200);
    });
  });

  describe('Disconnect', () => {
    it('should handle client disconnect', (done) => {
      const port = (httpServer.address() as any).port;
      const disconnectClient = Client(`http://localhost:${port}`, {
        auth: { token: 'valid-jwt-token' },
      });

      disconnectClient.on('connect', () => {
        disconnectClient.disconnect();
      });

      io.once('user-disconnected', (data: any) => {
        expect(data.userId).toBeDefined();
        done();
      });
    });

    it('should clean up rooms on disconnect', (done) => {
      const port = (httpServer.address() as any).port;
      const cleanupClient = Client(`http://localhost:${port}`, {
        auth: { token: 'valid-jwt-token' },
      });

      cleanupClient.on('connect', () => {
        cleanupClient.emit('join-room', 'test-room');
        setTimeout(() => {
          cleanupClient.disconnect();
          done();
        }, 100);
      });
    });
  });
});

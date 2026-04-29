import { jest } from '@jest/globals';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';

describe('Socket Presence Tests', () => {
  let io: Server;
  let httpServer: ReturnType<typeof createServer>;
  let clientA: any;
  let clientB: any;
  const onlineUsers = new Set<string>();

  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer);

    io.on('connection', (socket) => {
      const userId = socket.handshake.auth.userId || 'usr_' + socket.id;
      socket.data.user = { id: userId };

      // User comes online
      onlineUsers.add(userId);
      socket.broadcast.emit('user-online', { userId, timestamp: new Date().toISOString() });
      socket.emit('online-users', Array.from(onlineUsers));

      // Handle status update
      socket.on('update-status', (data: { status: string }) => {
        socket.broadcast.emit('status-update', {
          userId,
          status: data.status,
          timestamp: new Date().toISOString(),
        });
      });

      // User goes offline
      socket.on('disconnect', () => {
        onlineUsers.delete(userId);
        io.emit('user-offline', { userId, timestamp: new Date().toISOString() });
      });
    });

    httpServer.listen(() => {
      const port = (httpServer.address() as any).port;
      clientA = Client(`http://localhost:${port}`, { auth: { userId: 'usr_teacher_001' } });

      clientA.on('connect', () => {
        clientB = Client(`http://localhost:${port}`, { auth: { userId: 'usr_student_001' } });
        clientB.on('connect', done);
      });
    });
  });

  afterAll(() => {
    io.close();
    clientA.close();
    clientB.close();
    httpServer.close();
  });

  afterEach(() => {
    onlineUsers.clear();
  });

  describe('Online Status', () => {
    it('should notify when user comes online', (done) => {
      const port = (httpServer.address() as any).port;
      const newClient = Client(`http://localhost:${port}`, { auth: { userId: 'usr_parent_001' } });

      clientA.on('user-online', (data: any) => {
        if (data.userId === 'usr_parent_001') {
          expect(data.timestamp).toBeDefined();
          newClient.close();
          done();
        }
      });
    });

    it('should receive list of online users', (done) => {
      const port = (httpServer.address() as any).port;
      const newClient = Client(`http://localhost:${port}`, { auth: { userId: 'usr_admin_001' } });

      newClient.on('online-users', (users: string[]) => {
        expect(Array.isArray(users)).toBe(true);
        expect(users.length).toBeGreaterThan(0);
        newClient.close();
        done();
      });
    });
  });

  describe('Offline Status', () => {
    it('should notify when user goes offline', (done) => {
      const port = (httpServer.address() as any).port;
      const disconnectClient = Client(`http://localhost:${port}`, { auth: { userId: 'usr_temp_001' } });

      disconnectClient.on('connect', () => {
        disconnectClient.close();
      });

      clientA.on('user-offline', (data: any) => {
        if (data.userId === 'usr_temp_001') {
          expect(data.timestamp).toBeDefined();
          done();
        }
      });
    });
  });

  describe('Status Updates', () => {
    it('should broadcast status update', (done) => {
      clientB.on('status-update', (data: any) => {
        if (data.userId === 'usr_teacher_001') {
          expect(data.status).toBe('in_class');
          expect(data.timestamp).toBeDefined();
          done();
        }
      });

      clientA.emit('update-status', { status: 'in_class' });
    });

    it('should handle multiple status changes', (done) => {
      const statuses: string[] = [];

      clientB.on('status-update', (data: any) => {
        if (data.userId === 'usr_teacher_001') {
          statuses.push(data.status);
          if (statuses.length === 3) {
            expect(statuses).toEqual(['in_class', 'break', 'available']);
            done();
          }
        }
      });

      clientA.emit('update-status', { status: 'in_class' });
      setTimeout(() => clientA.emit('update-status', { status: 'break' }), 100);
      setTimeout(() => clientA.emit('update-status', { status: 'available' }), 200);
    });
  });

  describe('Bulk Presence', () => {
    it('should track multiple users going online and offline', (done) => {
      const port = (httpServer.address() as any).port;
      const events: any[] = [];

      clientA.on('user-online', (data: any) => events.push({ type: 'online', ...data }));
      clientA.on('user-offline', (data: any) => events.push({ type: 'offline', ...data }));

      const tempClient1 = Client(`http://localhost:${port}`, { auth: { userId: 'usr_bulk_1' } });
      const tempClient2 = Client(`http://localhost:${port}`, { auth: { userId: 'usr_bulk_2' } });

      tempClient1.on('connect', () => {
        tempClient2.on('connect', () => {
          setTimeout(() => {
            tempClient1.close();
            tempClient2.close();

            setTimeout(() => {
              const onlineEvents = events.filter((e) => e.type === 'online');
              const offlineEvents = events.filter((e) => e.type === 'offline');
              expect(onlineEvents.length).toBeGreaterThanOrEqual(2);
              expect(offlineEvents.length).toBeGreaterThanOrEqual(2);
              done();
            }, 300);
          }, 200);
        });
      });
    });
  });
});

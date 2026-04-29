import { jest } from '@jest/globals';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';

describe('Socket Notification Tests', () => {
  let io: Server;
  let httpServer: ReturnType<typeof createServer>;
  let clientA: any;
  let clientB: any;

  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer);

    io.on('connection', (socket) => {
      socket.data.user = { id: socket.handshake.auth.userId || 'usr_' + socket.id };

      // Subscribe to notifications
      socket.on('subscribe-notifications', () => {
        socket.join(`notifications:${socket.data.user.id}`);
        socket.emit('subscribed', { userId: socket.data.user.id });
      });

      // Send notification to specific user
      socket.on('send-notification', (data: { userId: string; notification: any }) => {
        io.to(`notifications:${data.userId}`).emit('notification', {
          ...data.notification,
          deliveredAt: new Date().toISOString(),
        });
      });

      // Broadcast notification to multiple users
      socket.on('broadcast-notification', (data: { userIds: string[]; notification: any }) => {
        data.userIds.forEach((userId) => {
          io.to(`notifications:${userId}`).emit('notification', {
            ...data.notification,
            deliveredAt: new Date().toISOString(),
          });
        });
        socket.emit('broadcast-complete', { sent: data.userIds.length });
      });

      // Mark notification as read
      socket.on('mark-read', (data: { notificationId: string }) => {
        socket.emit('notification-read', {
          notificationId: data.notificationId,
          readAt: new Date().toISOString(),
        });
      });
    });

    httpServer.listen(() => {
      const port = (httpServer.address() as any).port;
      clientA = Client(`http://localhost:${port}`, { auth: { userId: 'usr_student_001' } });
      clientB = Client(`http://localhost:${port}`, { auth: { userId: 'usr_parent_001' } });

      let connected = 0;
      const checkDone = () => {
        connected++;
        if (connected === 2) done();
      };
      clientA.on('connect', checkDone);
      clientB.on('connect', checkDone);
    });
  });

  afterAll(() => {
    io.close();
    clientA.close();
    clientB.close();
    httpServer.close();
  });

  describe('Notification Delivery', () => {
    it('should deliver notification to subscribed user', (done) => {
      clientA.emit('subscribe-notifications');

      clientA.on('subscribed', () => {
        const notification = {
          id: 'notif_001',
          title: 'New Homework',
          body: 'Math homework assigned.',
          type: 'HOMEWORK',
        };

        clientA.on('notification', (data: any) => {
          expect(data.id).toBe('notif_001');
          expect(data.title).toBe('New Homework');
          expect(data.deliveredAt).toBeDefined();
          done();
        });

        // Simulate server sending notification
        clientA.emit('send-notification', {
          userId: 'usr_student_001',
          notification,
        });
      });
    });

    it('should not deliver notification to unsubscribed users', (done) => {
      let receivedByB = false;

      clientB.on('notification', () => {
        receivedByB = true;
      });

      clientA.emit('subscribe-notifications');
      clientA.on('subscribed', () => {
        clientA.emit('send-notification', {
          userId: 'usr_student_001',
          notification: { id: 'notif_002', title: 'Test' },
        });

        setTimeout(() => {
          expect(receivedByB).toBe(false);
          done();
        }, 500);
      });
    });

    it('should broadcast notification to multiple users', (done) => {
      clientA.emit('subscribe-notifications');
      clientB.emit('subscribe-notifications');

      let receivedCount = 0;

      clientA.on('notification', () => { receivedCount++; });
      clientB.on('notification', () => { receivedCount++; });

      clientA.on('broadcast-complete', () => {
        setTimeout(() => {
          expect(receivedCount).toBe(2);
          done();
        }, 200);
      });

      setTimeout(() => {
        clientA.emit('broadcast-notification', {
          userIds: ['usr_student_001', 'usr_parent_001'],
          notification: {
            id: 'notif_003',
            title: 'School Event',
            body: 'Sports day tomorrow!',
          },
        });
      }, 100);
    });
  });

  describe('Push Triggers', () => {
    it('should trigger push notification event', (done) => {
      clientA.on('push-trigger', (data: any) => {
        expect(data.userId).toBe('usr_student_001');
        expect(data.notification.title).toBe('Fee Due');
        expect(data.pushToken).toBeDefined();
        done();
      });

      // Simulate push trigger from server
      io.to(`notifications:usr_student_001`).emit('push-trigger', {
        userId: 'usr_student_001',
        pushToken: 'expo-token-123',
        notification: {
          title: 'Fee Due',
          body: 'Your fee is due tomorrow.',
        },
      });
    });
  });

  describe('Mark as Read', () => {
    it('should confirm notification marked as read', (done) => {
      clientA.on('notification-read', (data: any) => {
        expect(data.notificationId).toBe('notif_001');
        expect(data.readAt).toBeDefined();
        done();
      });

      clientA.emit('mark-read', { notificationId: 'notif_001' });
    });
  });
});

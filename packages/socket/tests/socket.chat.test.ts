import { jest } from '@jest/globals';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';

describe('Socket Chat Tests', () => {
  let io: Server;
  let httpServer: ReturnType<typeof createServer>;
  let clientA: any;
  let clientB: any;
  let clientC: any;

  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer);

    io.on('connection', (socket) => {
      socket.data.user = { id: socket.handshake.auth.userId || 'usr_' + socket.id };

      // Private message
      socket.on('private-message', (data: { to: string; content: string }) => {
        io.to(data.to).emit('private-message', {
          from: socket.data.user.id,
          content: data.content,
          timestamp: new Date().toISOString(),
          messageId: `msg_${Date.now()}`,
        });
      });

      // Group message
      socket.on('group-message', (data: { groupId: string; content: string }) => {
        socket.to(data.groupId).emit('group-message', {
          from: socket.data.user.id,
          groupId: data.groupId,
          content: data.content,
          timestamp: new Date().toISOString(),
          messageId: `msg_${Date.now()}`,
        });
      });

      // Read receipt
      socket.on('read-receipt', (data: { messageId: string; userId: string }) => {
        io.emit('read-receipt', {
          messageId: data.messageId,
          readBy: data.userId,
          readAt: new Date().toISOString(),
        });
      });
    });

    httpServer.listen(() => {
      const port = (httpServer.address() as any).port;
      clientA = Client(`http://localhost:${port}`, { auth: { userId: 'usr_teacher_001' } });
      clientB = Client(`http://localhost:${port}`, { auth: { userId: 'usr_parent_001' } });
      clientC = Client(`http://localhost:${port}`, { auth: { userId: 'usr_student_001' } });

      let connected = 0;
      const checkDone = () => {
        connected++;
        if (connected === 3) done();
      };
      clientA.on('connect', checkDone);
      clientB.on('connect', checkDone);
      clientC.on('connect', checkDone);
    });
  });

  afterAll(() => {
    io.close();
    clientA.close();
    clientB.close();
    clientC.close();
    httpServer.close();
  });

  describe('Private Messages', () => {
    it('should send and receive private messages', (done) => {
      const messageContent = 'Assalam-o-Alaikum, how is Ahmad doing?';

      clientB.on('private-message', (data: any) => {
        expect(data.from).toBe('usr_teacher_001');
        expect(data.content).toBe(messageContent);
        expect(data.messageId).toBeDefined();
        expect(data.timestamp).toBeDefined();
        done();
      });

      clientA.emit('private-message', {
        to: 'usr_parent_001',
        content: messageContent,
      });
    });

    it('should not deliver private message to wrong recipient', (done) => {
      let receivedByC = false;

      clientC.on('private-message', () => {
        receivedByC = true;
      });

      clientA.emit('private-message', {
        to: 'usr_parent_001',
        content: 'Test message',
      });

      setTimeout(() => {
        expect(receivedByC).toBe(false);
        done();
      }, 500);
    });

    it('should handle multiple private messages', (done) => {
      const messages = ['Message 1', 'Message 2', 'Message 3'];
      let received = 0;

      clientB.on('private-message', (data: any) => {
        expect(messages).toContain(data.content);
        received++;
        if (received === 3) done();
      });

      messages.forEach((msg) => {
        clientA.emit('private-message', {
          to: 'usr_parent_001',
          content: msg,
        });
      });
    });
  });

  describe('Group Messages', () => {
    it('should send group message to all members', (done) => {
      let receivedCount = 0;

      clientB.on('group-message', (data: any) => {
        expect(data.groupId).toBe('class_8th_a');
        expect(data.content).toBe('Science project due tomorrow!');
        receivedCount++;
      });

      clientC.on('group-message', (data: any) => {
        expect(data.groupId).toBe('class_8th_a');
        receivedCount++;
        if (receivedCount === 2) done();
      });

      // Join group
      clientB.emit('join-room', 'class_8th_a');
      clientC.emit('join-room', 'class_8th_a');

      setTimeout(() => {
        clientA.emit('group-message', {
          groupId: 'class_8th_a',
          content: 'Science project due tomorrow!',
        });
      }, 100);
    });

    it('should include sender info in group message', (done) => {
      clientB.on('group-message', (data: any) => {
        expect(data.from).toBe('usr_teacher_001');
        expect(data.timestamp).toBeDefined();
        done();
      });

      clientB.emit('join-room', 'announcements');

      setTimeout(() => {
        clientA.emit('group-message', {
          groupId: 'announcements',
          content: 'School will remain closed on Friday.',
        });
      }, 100);
    });
  });

  describe('Read Receipts', () => {
    it('should emit read receipt for a message', (done) => {
      const messageId = 'msg_test_123';

      clientA.on('read-receipt', (data: any) => {
        expect(data.messageId).toBe(messageId);
        expect(data.readBy).toBe('usr_parent_001');
        expect(data.readAt).toBeDefined();
        done();
      });

      clientB.emit('read-receipt', {
        messageId,
        userId: 'usr_parent_001',
      });
    });

    it('should broadcast read receipt to all clients', (done) => {
      let receivedCount = 0;

      clientA.on('read-receipt', () => { receivedCount++; });
      clientC.on('read-receipt', () => {
        receivedCount++;
        if (receivedCount === 2) done();
      });

      clientB.emit('read-receipt', {
        messageId: 'msg_broadcast_456',
        userId: 'usr_parent_001',
      });
    });
  });
});

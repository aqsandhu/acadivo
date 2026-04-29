export interface AttendanceFactoryOptions {
  studentId: string;
  classId: string;
  date?: Date;
  status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'HALF_DAY';
  markedBy?: string;
  subjectId?: string;
  period?: number;
  remarks?: string;
}

let attendanceCounter = 0;

export async function createAttendanceRecord(options: AttendanceFactoryOptions, prisma: any) {
  attendanceCounter++;
  const date = options.date || new Date();
  const status = options.status || 'PRESENT';

  return prisma.attendance.create({
    data: {
      id: `att_test_${attendanceCounter}`,
      studentId: options.studentId,
      classId: options.classId,
      date,
      status,
      markedBy: options.markedBy,
      subjectId: options.subjectId,
      period: options.period,
      remarks: options.remarks || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function createBulkAttendance(
  records: Array<{
    studentId: string;
    classId: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'HALF_DAY';
    date?: Date;
    markedBy?: string;
  }>,
  prisma: any
) {
  const data = records.map((record, index) => ({
    id: `att_bulk_${Date.now()}_${index}`,
    studentId: record.studentId,
    classId: record.classId,
    date: record.date || new Date(),
    status: record.status,
    markedBy: record.markedBy,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  return prisma.attendance.createMany({
    data,
    skipDuplicates: true,
  });
}

export async function generateMonthAttendance(
  studentId: string,
  classId: string,
  year: number,
  month: number,
  markedBy: string,
  prisma: any
) {
  const records = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    if (date.getDay() === 0) continue; // Skip Sundays

    const rand = Math.random();
    let status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';
    if (rand < 0.85) status = 'PRESENT';
    else if (rand < 0.92) status = 'ABSENT';
    else if (rand < 0.97) status = 'LATE';
    else status = 'LEAVE';

    records.push({
      studentId,
      classId,
      date,
      status,
      markedBy,
    });
  }

  return createBulkAttendance(records, prisma);
}

export function resetAttendanceCounter() {
  attendanceCounter = 0;
}

export interface HomeworkFactoryOptions {
  title?: string;
  description?: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  schoolId: string;
  dueDate?: Date;
  maxMarks?: number;
  attachmentUrl?: string;
  status?: string;
}

export interface HomeworkSubmissionFactoryOptions {
  homeworkId: string;
  studentId: string;
  submissionText?: string;
  attachmentUrl?: string;
  status?: 'SUBMITTED' | 'GRADED' | 'LATE' | 'PENDING';
  marks?: number;
  feedback?: string;
}

let homeworkCounter = 0;
let submissionCounter = 0;

export async function createHomework(options: HomeworkFactoryOptions, prisma: any) {
  homeworkCounter++;
  return prisma.homework.create({
    data: {
      id: `hw_test_${homeworkCounter}`,
      title: options.title || `Homework Assignment #${homeworkCounter}`,
      description: options.description || 'Complete the assigned exercises.',
      subjectId: options.subjectId,
      classId: options.classId,
      teacherId: options.teacherId,
      schoolId: options.schoolId,
      dueDate: options.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      maxMarks: options.maxMarks || 20,
      attachmentUrl: options.attachmentUrl || null,
      status: options.status || 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function createHomeworkSubmission(options: HomeworkSubmissionFactoryOptions, prisma: any) {
  submissionCounter++;
  return prisma.homeworkSubmission.create({
    data: {
      id: `sub_test_${submissionCounter}`,
      homeworkId: options.homeworkId,
      studentId: options.studentId,
      submissionText: options.submissionText || 'Completed all problems.',
      attachmentUrl: options.attachmentUrl || null,
      status: options.status || 'SUBMITTED',
      marks: options.marks || null,
      feedback: options.feedback || null,
      submittedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function gradeHomeworkSubmission(
  submissionId: string,
  marks: number,
  feedback: string,
  prisma: any
) {
  return prisma.homeworkSubmission.update({
    where: { id: submissionId },
    data: {
      marks,
      feedback,
      status: 'GRADED',
      gradedAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function createHomeworkWithSubmissions(
  homeworkOptions: HomeworkFactoryOptions,
  studentIds: string[],
  prisma: any
) {
  const homework = await createHomework(homeworkOptions, prisma);
  const submissions = [];

  for (const studentId of studentIds) {
    const submission = await createHomeworkSubmission(
      {
        homeworkId: homework.id,
        studentId,
        submissionText: `Submission from ${studentId}`,
      },
      prisma
    );
    submissions.push(submission);
  }

  return { homework, submissions };
}

export function resetHomeworkCounter() {
  homeworkCounter = 0;
  submissionCounter = 0;
}

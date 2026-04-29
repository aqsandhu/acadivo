export interface ClassFactoryOptions {
  name?: string;
  section?: string;
  schoolId: string;
  roomNumber?: string;
  capacity?: number;
  subjects?: Array<{ name: string; code: string; teacherId?: string }>;
}

const gradeNames = [
  'Playgroup', 'Nursery', 'Prep',
  '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade',
  '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade',
  '1st Year', '2nd Year',
];

const sectionNames = ['A', 'B', 'C', 'D', 'E'];

let classCounter = 0;
let subjectCounter = 0;

export async function createClass(options: ClassFactoryOptions, prisma: any) {
  classCounter++;
  const name = options.name || gradeNames[Math.floor(Math.random() * gradeNames.length)];
  const section = options.section || sectionNames[Math.floor(Math.random() * sectionNames.length)];

  const schoolClass = await prisma.class.create({
    data: {
      id: `cls_test_${classCounter}`,
      name,
      schoolId: options.schoolId,
      roomNumber: options.roomNumber || `Room ${100 + classCounter}`,
      capacity: options.capacity || 35,
      academicYear: '2024-2025',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const classSection = await prisma.classSection.create({
    data: {
      id: `sec_test_${classCounter}`,
      classId: schoolClass.id,
      name: section,
      roomNumber: options.roomNumber || `Room ${100 + classCounter}`,
      capacity: options.capacity || 35,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return { class: schoolClass, section: classSection };
}

export async function createSubject(options: { name: string; code: string; schoolId: string }, prisma: any) {
  subjectCounter++;
  return prisma.subject.create({
    data: {
      id: `sub_test_${subjectCounter}`,
      name: options.name,
      code: options.code,
      schoolId: options.schoolId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function createClassWithSubjectsAndSections(options: ClassFactoryOptions, prisma: any) {
  const { class: schoolClass, section } = await createClass(options, prisma);

  const subjects = options.subjects || [
    { name: 'Mathematics', code: 'MATH' },
    { name: 'English', code: 'ENG' },
    { name: 'Science', code: 'SCI' },
    { name: 'Urdu', code: 'URD' },
    { name: 'Social Studies', code: 'SS' },
    { name: 'Islamiyat', code: 'ISL' },
    { name: 'Computer Science', code: 'CS' },
    { name: 'Pakistan Studies', code: 'PKS' },
  ];

  const createdSubjects = [];
  for (const subj of subjects) {
    const subject = await createSubject(
      { name: subj.name, code: `${subj.code}-${schoolClass.name.split(' ')[0]}`, schoolId: options.schoolId },
      prisma
    );
    createdSubjects.push(subject);

    if (subj.teacherId) {
      await prisma.classSubject.create({
        data: {
          id: `cs_test_${subjectCounter}_${subj.code}`,
          classId: schoolClass.id,
          subjectId: subject.id,
          teacherId: subj.teacherId,
          academicYear: '2024-2025',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  }

  return { class: schoolClass, section, subjects: createdSubjects };
}

export async function createTimetableEntry(options: {
  classId: string;
  sectionId: string;
  subjectId: string;
  teacherId: string;
  day: string;
  period: number;
  startTime: string;
  endTime: string;
  roomNumber?: string;
}, prisma: any) {
  return prisma.timetable.create({
    data: {
      id: `tt_${options.classId}_${options.day}_${options.period}`,
      classId: options.classId,
      sectionId: options.sectionId,
      subjectId: options.subjectId,
      teacherId: options.teacherId,
      day: options.day,
      period: options.period,
      startTime: options.startTime,
      endTime: options.endTime,
      roomNumber: options.roomNumber,
      academicYear: '2024-2025',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export function resetClassCounter() {
  classCounter = 0;
  subjectCounter = 0;
}

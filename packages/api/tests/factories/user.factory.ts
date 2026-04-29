import bcrypt from 'bcryptjs';

export interface UserFactoryOptions {
  email?: string;
  password?: string;
  role?: string;
  name?: string;
  schoolId?: string;
  isActive?: boolean;
  phone?: string;
  avatar?: string;
}

const firstNames = [
  'Ahmad', 'Fatima', 'Ali', 'Ayesha', 'Muhammad', 'Sana', 'Bilal', 'Zainab',
  'Hassan', 'Khadija', 'Umar', 'Rabia', 'Omar', 'Nida', 'Kashif', 'Mariam',
  'Tariq', 'Sadia', 'Asif', 'Hira', 'Imran', 'Amina', 'Faisal', 'Farah',
  'Junaid', 'Saba', 'Rizwan', 'Sumaira', 'Waqar', 'Noreen',
];

const lastNames = [
  'Khan', 'Ahmed', 'Raza', 'Malik', 'Hussain', 'Siddiqui', 'Sheikh', 'Qureshi',
  'Chaudhry', 'Butt', 'Iqbal', 'Mirza', 'Baig', 'Lone', 'Ansari', 'Jutt',
  'Mehmood', 'Rehman', 'Gill', 'Bhatti', 'Khokhar', 'Lashari', 'Bizenjo',
  'Ranjha', 'Bajwa', 'Gujjar',
];

function generateName(): string {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${last}`;
}

function generateEmail(name: string, role: string, schoolId?: string): string {
  const normalized = name.toLowerCase().replace(/\s+/g, '.');
  const domain = schoolId ? `${schoolId}.edu.pk` : 'acadivo.edu.pk';

  switch (role) {
    case 'STUDENT':
      return `${normalized}.student@${domain}`;
    case 'PARENT':
      return `${normalized}.parent@${domain}`;
    case 'TEACHER':
      return `${normalized}@${domain}`;
    default:
      return `${normalized}.${role.toLowerCase()}@${domain}`;
  }
}

let userCounter = 0;

export async function createUser(options: UserFactoryOptions = {}, prisma: any) {
  userCounter++;
  const name = options.name || generateName();
  const role = options.role || 'STUDENT';
  const email = options.email || generateEmail(name, role, options.schoolId);
  const password = options.password || 'SecurePass123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      id: `usr_test_${userCounter}`,
      email,
      password: hashedPassword,
      name,
      role,
      schoolId: options.schoolId,
      isActive: options.isActive !== false,
      phone: options.phone || `+92-300-${String(1000000 + Math.floor(Math.random() * 8999999)).slice(0, 7)}`,
      avatar: options.avatar || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function createStudentUser(prisma: any, options: UserFactoryOptions = {}) {
  const user = await createUser({ ...options, role: 'STUDENT' }, prisma);
  const rollNumber = options.email?.split('@')[0]?.replace(/\./g, '-') || `R-${Date.now()}-${userCounter}`;

  const student = await prisma.student.create({
    data: {
      id: `std_test_${userCounter}`,
      userId: user.id,
      rollNumber,
      admissionDate: new Date('2024-04-01'),
      dateOfBirth: new Date('2010-05-15'),
      gender: Math.random() > 0.5 ? 'MALE' : 'FEMALE',
      address: '45 Model Town, Lahore',
      classId: options.schoolId ? 'cls_default' : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return { user, student };
}

export async function createTeacherUser(prisma: any, options: UserFactoryOptions = {}) {
  const user = await createUser({ ...options, role: 'TEACHER' }, prisma);

  const teacher = await prisma.teacher.create({
    data: {
      id: `tch_test_${userCounter}`,
      userId: user.id,
      employeeId: `EMP-${new Date().getFullYear()}-${String(userCounter).padStart(3, '0')}`,
      qualification: options.schoolId ? 'MSc Mathematics' : 'MA English',
      specialization: 'Mathematics',
      joinDate: new Date('2024-03-01'),
      salary: 75000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return { user, teacher };
}

export async function createParentUser(prisma: any, options: UserFactoryOptions = {}) {
  const user = await createUser({ ...options, role: 'PARENT' }, prisma);

  const parent = await prisma.parent.create({
    data: {
      id: `prt_test_${userCounter}`,
      userId: user.id,
      occupation: 'Business',
      income: 120000,
      cnic: '35201-1234567-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return { user, parent };
}

export async function createPrincipalUser(prisma: any, options: UserFactoryOptions = {}) {
  return createUser({ ...options, role: 'PRINCIPAL', name: options.name || 'Dr. Aslam Mehmood' }, prisma);
}

export async function createAdminUser(prisma: any, options: UserFactoryOptions = {}) {
  return createUser({ ...options, role: 'ADMIN', name: options.name || 'System Administrator' }, prisma);
}

export function resetUserCounter() {
  userCounter = 0;
}

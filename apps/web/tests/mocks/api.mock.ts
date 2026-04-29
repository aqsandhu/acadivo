export const mockUsers = {
  teacher: {
    id: 'usr_teacher_001',
    email: 'fatima.zahra@govtpilot.edu.pk',
    name: 'Fatima Zahra',
    role: 'TEACHER',
    schoolId: 'sch_govt_pilot_lhr',
    avatar: null,
    isActive: true,
  },
  student: {
    id: 'usr_student_001',
    email: 'ahmad.raza.student@example.com',
    name: 'Ahmad Raza',
    role: 'STUDENT',
    schoolId: 'sch_govt_pilot_lhr',
    avatar: null,
    isActive: true,
  },
  parent: {
    id: 'usr_parent_001',
    email: 'raza.ahmed@example.com',
    name: 'Raza Ahmed',
    role: 'PARENT',
    schoolId: 'sch_govt_pilot_lhr',
    avatar: null,
    isActive: true,
  },
  principal: {
    id: 'usr_principal_001',
    email: 'principal@govtpilot.edu.pk',
    name: 'Dr. Aslam Mehmood',
    role: 'PRINCIPAL',
    schoolId: 'sch_govt_pilot_lhr',
    avatar: null,
    isActive: true,
  },
  admin: {
    id: 'usr_admin_001',
    email: 'admin@acadivo.edu.pk',
    name: 'System Administrator',
    role: 'ADMIN',
    schoolId: null,
    avatar: null,
    isActive: true,
  },
};

export const mockAuthResponse = {
  accessToken: 'mock_access_token_12345',
  refreshToken: 'mock_refresh_token_67890',
  user: mockUsers.teacher,
};

export const mockSchools = [
  {
    id: 'sch_govt_pilot_lhr',
    name: 'Govt. Pilot Secondary School Lahore',
    city: 'Lahore',
    province: 'Punjab',
    status: 'ACTIVE',
    studentCount: 450,
    teacherCount: 28,
  },
  {
    id: 'sch_allama_iqbal_fsd',
    name: 'Allama Iqbal Public School Faisalabad',
    city: 'Faisalabad',
    province: 'Punjab',
    status: 'ACTIVE',
    studentCount: 320,
    teacherCount: 20,
  },
];

export const mockStudents = [
  {
    id: 'std_001',
    rollNumber: 'R-2024-008-A',
    name: 'Ahmad Raza',
    class: '8th Grade',
    section: 'A',
    gender: 'MALE',
    attendance: 92,
  },
  {
    id: 'std_002',
    rollNumber: 'R-2024-008-B',
    name: 'Sana Malik',
    class: '8th Grade',
    section: 'A',
    gender: 'FEMALE',
    attendance: 95,
  },
  {
    id: 'std_003',
    rollNumber: 'R-2024-007-A',
    name: 'Bilal Khan',
    class: '7th Grade',
    section: 'A',
    gender: 'MALE',
    attendance: 88,
  },
];

export const mockHomework = [
  {
    id: 'hw_001',
    title: 'Quadratic Equations - Exercise 5.2',
    subject: 'Mathematics',
    dueDate: '2024-03-22',
    maxMarks: 20,
    status: 'ACTIVE',
  },
  {
    id: 'hw_002',
    title: 'Essay: My Favorite Festival',
    subject: 'English',
    dueDate: '2024-03-25',
    maxMarks: 15,
    status: 'ACTIVE',
  },
];

export const mockFeeRecords = [
  {
    id: 'fr_001',
    month: 'March',
    amount: 5000,
    dueDate: '2024-03-05',
    status: 'PAID',
    paidAmount: 5000,
  },
  {
    id: 'fr_002',
    month: 'April',
    amount: 5000,
    dueDate: '2024-04-05',
    status: 'OVERDUE',
    paidAmount: 0,
  },
];

export const mockNotifications = [
  {
    id: 'notif_001',
    title: 'Homework Assigned',
    body: 'New Mathematics homework assigned.',
    type: 'HOMEWORK',
    isRead: false,
    createdAt: '2024-03-15T10:00:00Z',
  },
  {
    id: 'notif_002',
    title: 'Fee Due',
    body: 'Monthly fee of PKR 5,000 is due.',
    type: 'FEE',
    isRead: true,
    createdAt: '2024-03-10T09:00:00Z',
  },
];

export const mockApiResponse = <T>(data: T, status = 200) => {
  return {
    status,
    data,
    headers: { 'content-type': 'application/json' },
  };
};

export const mockApiError = (message: string, status = 400) => {
  return {
    status,
    response: {
      data: {
        message,
        errors: [message],
      },
    },
  };
};

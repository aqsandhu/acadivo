export interface SchoolFactoryOptions {
  name?: string;
  subdomain?: string;
  address?: string;
  city?: string;
  province?: string;
  phone?: string;
  email?: string;
  status?: string;
}

const schoolNames = [
  'Govt. Pilot Secondary School',
  'Allama Iqbal Public School',
  'The City School',
  'Beaconhouse School System',
  'Roots Millennium School',
  'Lahore Grammar School',
  'Aitchison College',
  'Divisional Public School',
  'Cadet College',
  'Army Public School',
];

const cities = ['Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Multan', 'Peshawar', 'Quetta'];
const provinces = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Gilgit-Baltistan'];

let schoolCounter = 0;

export async function createSchool(options: SchoolFactoryOptions = {}, prisma: any) {
  schoolCounter++;
  const city = options.city || cities[Math.floor(Math.random() * cities.length)];
  const name = options.name || `${schoolNames[Math.floor(Math.random() * schoolNames.length)]} ${city}`;
  const subdomain = options.subdomain || `test-school-${schoolCounter}-${Date.now()}`;

  return prisma.school.create({
    data: {
      id: `sch_test_${schoolCounter}`,
      name,
      subdomain,
      address: options.address || `123 Education Road, ${city}`,
      city,
      province: options.province || provinces[Math.floor(Math.random() * provinces.length)],
      phone: options.phone || `+92-42-${String(1000000 + Math.floor(Math.random() * 8999999))}`,
      email: options.email || `info@${subdomain}.edu.pk`,
      status: options.status || 'ACTIVE',
      logo: null,
      theme: 'default',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}

export async function createSchoolWithDefaults(prisma: any, options: SchoolFactoryOptions = {}) {
  const school = await createSchool(options, prisma);

  // Create default fee structures for the school
  await prisma.feeStructure.createMany({
    data: [
      {
        id: `fs_${school.id}_tuition`,
        name: 'Monthly Tuition Fee',
        amount: 5000,
        frequency: 'MONTHLY',
        category: 'TUITION',
        academicYear: '2024-2025',
        schoolId: school.id,
        dueDay: 5,
        lateFee: 200,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `fs_${school.id}_exam`,
        name: 'Annual Exam Fee',
        amount: 2500,
        frequency: 'ANNUAL',
        category: 'EXAM',
        academicYear: '2024-2025',
        schoolId: school.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: `fs_${school.id}_library`,
        name: 'Library Fee',
        amount: 500,
        frequency: 'ANNUAL',
        category: 'LIBRARY',
        academicYear: '2024-2025',
        schoolId: school.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    skipDuplicates: true,
  });

  return school;
}

export function resetSchoolCounter() {
  schoolCounter = 0;
}

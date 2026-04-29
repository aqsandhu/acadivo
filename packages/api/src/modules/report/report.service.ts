import { ReportRequestStatus, ReportRequestType } from "@prisma/client";
import { prisma } from "../../config/database";
import { ApiError } from "../../utils/ApiError";
import puppeteer from "puppeteer-core";

// ──────────────────────────────────────────────
// Report Request Service
// ──────────────────────────────────────────────

export async function createReportRequest(
  tenantId: string,
  parentId: string,
  data: {
    studentId: string;
    teacherId: string;
    reportType: ReportRequestType;
  }
) {
  return prisma.reportRequest.create({
    data: {
      tenantId,
      parentId,
      studentId: data.studentId,
      teacherId: data.teacherId,
      reportType: data.reportType,
      status: "PENDING",
    },
    include: {
      parent: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
      student: {
        include: {
          user: { select: { firstName: true, lastName: true, avatar: true } },
          class: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } },
        },
      },
      teacher: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });
}

export async function getReportRequests(
  tenantId: string,
  userId: string,
  userRole: string,
  filters: { status?: ReportRequestStatus; page?: number; pageSize?: number }
) {
  const { status, page = 1, pageSize = 20 } = filters;
  const where: Record<string, unknown> = { tenantId };

  if (userRole === "PARENT") {
    where.parentId = userId;
  } else if (userRole === "TEACHER") {
    where.teacherId = userId;
  }
  // PRINCIPAL/ADMIN see all

  if (status) where.status = status;

  const [requests, totalCount] = await Promise.all([
    prisma.reportRequest.findMany({
      where,
      orderBy: { requestedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        parent: { include: { user: { select: { firstName: true, lastName: true } } } },
        student: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            class: { select: { id: true, name: true } },
            section: { select: { id: true, name: true } },
          },
        },
        teacher: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.reportRequest.count({ where }),
  ]);

  return { requests, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
}

export async function getReportRequestById(id: string, tenantId: string) {
  const request = await prisma.reportRequest.findFirst({
    where: { id, tenantId },
    include: {
      parent: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
      student: {
        include: {
          user: { select: { firstName: true, lastName: true, avatar: true } },
          class: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } },
          parentLinks: {
            include: {
              parent: { include: { user: { select: { firstName: true, lastName: true } } } },
            },
          },
          attendances: true,
        },
      },
      teacher: { select: { id: true, firstName: true, lastName: true } },
    },
  });
  if (!request) throw ApiError.notFound("Report request not found");
  return request;
}

// ──────────────────────────────────────────────
// Report Generation Service (PDF)
// ──────────────────────────────────────────────

export async function generateReport(
  requestId: string,
  tenantId: string,
  teacherId: string,
  data: { teacherRemarks?: string; principalRemarks?: string }
) {
  const request = await prisma.reportRequest.findFirst({
    where: { id: requestId, tenantId, teacherId },
    include: {
      student: {
        include: {
          user: { select: { firstName: true, lastName: true, avatar: true } },
          class: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } },
          attendances: true,
        },
      },
      teacher: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!request) throw ApiError.notFound("Report request not found");
  if (request.status === "COMPLETED") {
    throw ApiError.conflict("Report has already been generated", "ALREADY_COMPLETED");
  }

  // Gather student data
  const student = request.student;
  const attendances = student.attendances || [];
  const presentCount = attendances.filter((a) => a.status === "PRESENT").length;
  const absentCount = attendances.filter((a) => a.status === "ABSENT").length;
  const lateCount = attendances.filter((a) => a.status === "LATE").length;
  const leaveCount = attendances.filter((a) => a.status === "LEAVE").length;
  const totalDays = attendances.length;
  const attendancePercentage = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(1) : "0.0";

  // Get latest results
  const results = await prisma.result.findMany({
    where: { studentId: student.userId, tenantId },
    orderBy: { generatedAt: "desc" },
    take: 1,
    include: {
      resultDetails: {
        include: { subject: { select: { name: true, code: true } } },
      },
    },
  });

  const latestResult = results[0];

  // Get tenant (school) info
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { name: true, address: true, logo: true, city: true, phone: true },
  });

  // Generate HTML template
  const htmlTemplate = buildReportHtml({
    tenant,
    student,
    attendance: { presentCount, absentCount, lateCount, leaveCount, totalDays, attendancePercentage },
    result: latestResult,
    teacherRemarks: data.teacherRemarks || request.teacherRemarks || "",
    principalRemarks: data.principalRemarks || "",
  });

  // Generate actual PDF using puppeteer-core
  let pdfBuffer: Buffer;
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(htmlTemplate, { waitUntil: "networkidle0" });
    pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });
    await browser.close();
  } catch (err: any) {
    throw ApiError.internal(`PDF generation failed: ${err.message}`, "PDF_GENERATION_FAILED");
  }

  // Store PDF to a placeholder URL (in production, upload to cloud storage)
  const pdfUrl = `https://storage.acadivo.com/reports/${requestId}.pdf`;

  // Update request
  const updated = await prisma.reportRequest.update({
    where: { id: requestId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      teacherRemarks: data.teacherRemarks || request.teacherRemarks,
      pdfUrl,
    },
    include: {
      parent: { include: { user: { select: { firstName: true, lastName: true } } } },
      student: { include: { user: { select: { firstName: true, lastName: true } } } },
      teacher: { select: { firstName: true, lastName: true } },
    },
  });

  return { request: updated, pdfUrl, htmlPreview: htmlTemplate, pdfBuffer };
}

export async function getGeneratedReports(
  tenantId: string,
  filters: { parentId?: string; studentId?: string; page?: number; pageSize?: number }
) {
  const { parentId, studentId, page = 1, pageSize = 20 } = filters;
  const where: Record<string, unknown> = { tenantId, status: "COMPLETED" };
  if (parentId) where.parentId = parentId;
  if (studentId) where.studentId = studentId;

  const [reports, totalCount] = await Promise.all([
    prisma.reportRequest.findMany({
      where,
      orderBy: { completedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        parent: { include: { user: { select: { firstName: true, lastName: true } } } },
        student: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            class: { select: { name: true } },
          },
        },
        teacher: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.reportRequest.count({ where }),
  ]);

  return { reports, totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
}

// ──────────────────────────────────────────────
// Report Templates
// ──────────────────────────────────────────────

const defaultTemplates = [
  {
    id: "progress-default",
    name: "Progress Report",
    description: "Standard student progress report with academics, attendance, and behavior",
    type: "PROGRESS",
    isDefault: true,
  },
  {
    id: "attendance-default",
    name: "Attendance Report",
    description: "Detailed attendance summary and trends",
    type: "ATTENDANCE",
    isDefault: true,
  },
  {
    id: "behavior-default",
    name: "Behavior Assessment",
    description: "Student conduct and behavior evaluation",
    type: "BEHAVIOR",
    isDefault: true,
  },
  {
    id: "comprehensive-default",
    name: "Comprehensive Report",
    description: "Complete academic and behavioral overview",
    type: "COMPREHENSIVE",
    isDefault: true,
  },
];

export async function getReportTemplates(tenantId: string) {
  return { templates: defaultTemplates };
}

export async function createReportTemplate(
  _tenantId: string,
  data: { name: string; description?: string; type: ReportRequestType; sections: string[] }
) {
  const template = {
    id: `custom-${Date.now()}`,
    name: data.name,
    description: data.description || "",
    type: data.type,
    sections: data.sections,
    isDefault: false,
  };
  return template;
}

// ──────────────────────────────────────────────
// HTML Report Builder
// ──────────────────────────────────────────────

interface ReportData {
  tenant: { name: string; address: string | null; logo: string | null; city: string | null; phone: string } | null;
  student: {
    user: { firstName: string; lastName: string; avatar: string | null };
    rollNumber: string;
    class: { id: string; name: string } | null;
    section: { id: string; name: string } | null;
  };
  attendance: {
    presentCount: number;
    absentCount: number;
    lateCount: number;
    leaveCount: number;
    totalDays: number;
    attendancePercentage: string;
  };
  result: {
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    grade: string;
    status: string;
    resultDetails: Array<{
      subject: { name: string; code: string };
      totalMarks: number;
      obtainedMarks: number;
      grade: string;
    }>;
  } | null;
  teacherRemarks: string;
  principalRemarks: string;
}

function buildReportHtml(data: ReportData): string {
  const { tenant, student, attendance, result, teacherRemarks, principalRemarks } = data;

  const subjectRows =
    result?.resultDetails
      ?.map(
        (rd) => `
      <tr>
        <td style="padding:8px;border:1px solid #ddd;">${rd.subject.name} (${rd.subject.code})</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">${rd.totalMarks}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">${rd.obtainedMarks}</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;">${((rd.obtainedMarks / rd.totalMarks) * 100).toFixed(1)}%</td>
        <td style="padding:8px;border:1px solid #ddd;text-align:center;font-weight:bold;">${rd.grade}</td>
      </tr>`
      )
      .join("") || "";

  const behaviorRating = getBehaviorRating(attendance.attendancePercentage);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Student Report - ${student.user.firstName} ${student.user.lastName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap');
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
    .urdu { font-family: 'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif; }
    .container { max-width: 800px; margin: 0 auto; border: 1px solid #ccc; padding: 30px; }
    .header { text-align: center; border-bottom: 3px solid #2c3e50; padding-bottom: 15px; margin-bottom: 25px; }
    .header h1 { margin: 0; color: #2c3e50; font-size: 28px; }
    .header p { margin: 5px 0; color: #666; }
    .student-info { display: flex; gap: 20px; margin-bottom: 25px; }
    .student-photo { width: 100px; height: 120px; border: 1px solid #ddd; background: #f5f5f5; display: flex; align-items: center; justify-content: center; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; flex: 1; }
    .info-row { display: flex; }
    .info-label { font-weight: bold; width: 120px; color: #555; }
    .section-title { background: #2c3e50; color: white; padding: 8px 12px; margin: 20px 0 10px; font-size: 16px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th { background: #34495e; color: white; padding: 8px; border: 1px solid #ddd; }
    .attendance-box { display: flex; gap: 15px; margin-bottom: 15px; }
    .att-item { flex: 1; text-align: center; padding: 12px; border: 1px solid #ddd; border-radius: 4px; }
    .att-item .count { font-size: 24px; font-weight: bold; color: #2c3e50; }
    .att-item .label { font-size: 12px; color: #666; text-transform: uppercase; }
    .behavior-box { padding: 12px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px; }
    .comments-box { padding: 12px; border: 1px solid #ddd; border-radius: 4px; min-height: 60px; }
    .signature-area { margin-top: 40px; display: flex; justify-content: space-between; }
    .signature-box { text-align: center; width: 200px; }
    .signature-line { border-top: 1px solid #333; margin-top: 40px; padding-top: 5px; }
    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${tenant?.logo ? `<img src="${tenant.logo}" alt="School Logo" style="max-height:60px;margin-bottom:10px;" />` : ""}
      <h1>${tenant?.name || "School Name"}</h1>
      <p>${tenant?.address || ""}${tenant?.city ? `, ${tenant.city}` : ""}</p>
      <p>Phone: ${tenant?.phone || "N/A"}</p>
      <h2 style="margin-top:15px;color:#27ae60;">Student Progress Report</h2>
    </div>

    <div class="student-info">
      <div class="student-photo">
        ${student.user.avatar ? `<img src="${student.user.avatar}" style="width:100%;height:100%;object-fit:cover;" />` : "No Photo"}
      </div>
      <div class="info-grid">
        <div class="info-row"><span class="info-label">Name:</span> ${student.user.firstName} ${student.user.lastName}</div>
        <div class="info-row"><span class="info-label">Class:</span> ${student.class?.name || "N/A"}</div>
        <div class="info-row"><span class="info-label">Roll No:</span> ${student.rollNumber}</div>
        <div class="info-row"><span class="info-label">Section:</span> ${student.section?.name || "N/A"}</div>
      </div>
    </div>

    <div class="section-title">Academic Performance</div>
    <table>
      <thead>
        <tr>
          <th>Subject</th><th>Total Marks</th><th>Obtained</th><th>Percentage</th><th>Grade</th>
        </tr>
      </thead>
      <tbody>
        ${subjectRows}
        ${result ? `
        <tr style="font-weight:bold;background:#ecf0f1;">
          <td style="padding:8px;border:1px solid #ddd;">Overall</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${result.totalMarks}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${result.obtainedMarks}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${result.percentage}%</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${result.grade}</td>
        </tr>` : `<tr><td colspan="5" style="padding:8px;border:1px solid #ddd;text-align:center;">No result data available</td></tr>`}
      </tbody>
    </table>

    <div class="section-title">Attendance Summary</div>
    <div class="attendance-box">
      <div class="att-item"><div class="count">${attendance.presentCount}</div><div class="label">Present</div></div>
      <div class="att-item"><div class="count">${attendance.absentCount}</div><div class="label">Absent</div></div>
      <div class="att-item"><div class="count">${attendance.lateCount}</div><div class="label">Late</div></div>
      <div class="att-item"><div class="count">${attendance.leaveCount}</div><div class="label">Leave</div></div>
      <div class="att-item"><div class="count">${attendance.attendancePercentage}%</div><div class="label">Rate</div></div>
    </div>

    <div class="section-title">Behavior Assessment</div>
    <div class="behavior-box">
      <p><strong>Rating:</strong> ${behaviorRating}</p>
      <p><strong>Attendance Impact:</strong> ${attendance.attendancePercentage}% attendance rate</p>
    </div>

    <div class="section-title">Teacher Comments</div>
    <div class="comments-box">${teacherRemarks || "No comments provided."}</div>

    <div class="section-title">Principal Comments</div>
    <div class="comments-box">${principalRemarks || "No comments provided."}</div>

    <div class="signature-area">
      <div class="signature-box">
        <div class="signature-line">Class Teacher</div>
      </div>
      <div class="signature-box">
        <div class="signature-line">Principal</div>
      </div>
    </div>

    <div class="footer">
      Report generated on ${new Date().toLocaleDateString("en-PK")} via Acadivo
    </div>
  </div>
</body>
</html>`;
}

function getBehaviorRating(attendancePercentage: string): string {
  const pct = parseFloat(attendancePercentage);
  if (pct >= 95) return "Excellent";
  if (pct >= 85) return "Good";
  if (pct >= 75) return "Satisfactory";
  return "Needs Improvement";
}

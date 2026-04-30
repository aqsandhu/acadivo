// ═══════════════════════════════════════════════
// Cron Jobs — Scheduled background tasks for Acadivo
// ═══════════════════════════════════════════════

import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { logger } from "../utils/logger";
import { sendFeeReminderSMS, sendAttendanceAlertSMS } from "../services/sms.service";
import { sendFeeReminderEmail, sendAttendanceAlertEmail } from "../utils/email";
import { sendPushNotification } from "../services/push.service";

// ═══════════════════════════════════════════════
// 1. Fee Due Reminders (Daily at 9:00 AM)
// ═══════════════════════════════════════════════

export function scheduleFeeDueReminders() {
  cron.schedule("0 9 * * *", async () => {
    logger.info("[Cron] Running daily fee due reminder job...");
    try {
      await processFeeDueReminders();
    } catch (err: any) {
      logger.error(`[Cron] Fee reminder job failed: ${err.message}`);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Karachi",
  });

  logger.info("[Cron] Fee due reminder job scheduled (daily at 09:00 PK)");
}

async function processFeeDueReminders() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 3); // Notify 3 days before due
  tomorrow.setHours(23, 59, 59, 999);

  const feeRecords = await prisma.feeRecord.findMany({
    where: {
      status: { in: ["UNPAID", "PARTIAL"] },
      dueDate: { lte: tomorrow },
      notifiedAt: null,
    },
    include: {
      student: {
        include: {
          user: { select: { firstName: true, lastName: true } },
          parentLinks: {
            include: {
              parent: {
                include: {
                  user: { select: { id: true, phone: true, email: true, firstName: true, lastName: true } },
                },
              },
            },
          },
        },
      },
      feeStructure: true,
    },
    take: 500,
  });

  for (const record of feeRecords) {
    const studentName = `${record.student.user.firstName} ${record.student.user.lastName}`;
    const amountDue = Number(record.finalAmount) - Number(record.paidAmount);
    const dueDate = record.dueDate.toLocaleDateString("en-PK");

    for (const link of record.student.parentLinks) {
      const parentUser = link.parent.user;

      // Send push notification
      try {
        await sendPushNotification(parentUser.id, {
          title: "Fee Due Reminder",
          body: `Fee of PKR ${amountDue.toFixed(2)} is due for ${studentName}. Due: ${dueDate}`,
          data: { type: "FEE_DUE", feeRecordId: record.id, studentId: record.studentId },
        });
      } catch (err: any) {
        logger.error(`[Cron] Push notification failed: ${err.message}`);
      }

      // Send SMS
      try {
        if (parentUser.phone) {
          await sendFeeReminderSMS(parentUser.phone, studentName, amountDue, dueDate);
        }
      } catch (err: any) {
        logger.error(`[Cron] SMS failed: ${err.message}`);
      }

      // Send Email
      try {
        if (parentUser.email) {
          await sendFeeReminderEmail(
            parentUser.email,
            `${parentUser.firstName} ${parentUser.lastName}`,
            studentName,
            amountDue,
            dueDate,
            record.feeStructure.feeType
          );
        }
      } catch (err: any) {
        logger.error(`[Cron] Email failed: ${err.message}`);
      }
    }

    // Mark as notified
    await prisma.feeRecord.update({
      where: { id: record.id },
      data: { notifiedAt: now },
    });
  }

  logger.info(`[Cron] Sent ${feeRecords.length} fee due reminders`);
}

// ═══════════════════════════════════════════════
// 2. Attendance Alerts (Daily at 6:00 PM)
// ═══════════════════════════════════════════════

export function scheduleAttendanceAlerts() {
  cron.schedule("0 18 * * *", async () => {
    logger.info("[Cron] Running daily attendance alert job...");
    try {
      await processAttendanceAlerts();
    } catch (err: any) {
      logger.error(`[Cron] Attendance alert job failed: ${err.message}`);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Karachi",
  });

  logger.info("[Cron] Attendance alert job scheduled (daily at 18:00 PK)");
}

async function processAttendanceAlerts() {
  // Find students with 3+ consecutive absences
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const allStudents = await prisma.student.findMany({
    where: { status: "ACTIVE" },
    include: {
      user: { select: { firstName: true, lastName: true } },
      parentLinks: {
        include: {
          parent: {
            include: {
              user: { select: { id: true, phone: true, email: true, firstName: true, lastName: true } },
            },
          },
        },
      },
      class: { select: { name: true } },
    },
  });

  let alertCount = 0;

  for (const student of allStudents) {
    // Get last 5 attendance records ordered by date desc
    const recentAttendance = await prisma.attendance.findMany({
      where: {
        studentId: student.userId,
        date: { gte: threeDaysAgo },
      },
      orderBy: { date: "desc" },
      take: 5,
    });

    // Count consecutive absences from the most recent
    let consecutiveAbsences = 0;
    const absentDates: string[] = [];

    for (const record of recentAttendance) {
      if (record.status === "ABSENT") {
        consecutiveAbsences++;
        absentDates.push(new Date(record.date).toLocaleDateString("en-PK"));
      } else {
        break;
      }
    }

    // Alert if 3+ consecutive absences
    if (consecutiveAbsences >= 3) {
      const studentName = `${student.user.firstName} ${student.user.lastName}`;
      alertCount++;

      for (const link of student.parentLinks) {
        const parentUser = link.parent.user;

        // Push notification
        try {
          await sendPushNotification(parentUser.id, {
            title: "Attendance Alert",
            body: `${studentName} has been absent for ${consecutiveAbsences} consecutive days`,
            data: { type: "ATTENDANCE_ALERT", studentId: student.userId, days: consecutiveAbsences },
          });
        } catch (err: any) {
          logger.error(`[Cron] Push notification failed: ${err.message}`);
        }

        // SMS alert
        try {
          if (parentUser.phone) {
            await sendAttendanceAlertSMS(parentUser.phone, studentName, consecutiveAbsences);
          }
        } catch (err: any) {
          logger.error(`[Cron] SMS failed: ${err.message}`);
        }

        // Email alert
        try {
          if (parentUser.email) {
            await sendAttendanceAlertEmail(
              parentUser.email,
              `${parentUser.firstName} ${parentUser.lastName}`,
              studentName,
              consecutiveAbsences,
              absentDates
            );
          }
        } catch (err: any) {
          logger.error(`[Cron] Email failed: ${err.message}`);
        }
      }

      // Create notification in-app
      try {
        await prisma.notification.createMany({
          data: student.parentLinks.map((link) => ({
            tenantId: student.tenantId,
            userId: link.parent.userId,
            title: "Attendance Alert",
            body: `${studentName} has been absent for ${consecutiveAbsences} consecutive days (${absentDates.join(", ")})`,
            type: "ATTENDANCE_ALERT" as any,
            data: { studentId: student.userId, days: consecutiveAbsences },
          })),
        });
      } catch (err: any) {
        logger.error(`[Cron] In-app notification failed: ${err.message}`);
      }
    }
  }

  logger.info(`[Cron] Sent ${alertCount} attendance alerts`);
}

// ═══════════════════════════════════════════════
// 3. Subscription Expiry Checks (Daily at 8:00 AM)
// ═══════════════════════════════════════════════

export function scheduleSubscriptionExpiryChecks() {
  cron.schedule("0 8 * * *", async () => {
    logger.info("[Cron] Running subscription expiry check...");
    try {
      await processSubscriptionExpiryChecks();
    } catch (err: any) {
      logger.error(`[Cron] Subscription expiry check failed: ${err.message}`);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Karachi",
  });

  logger.info("[Cron] Subscription expiry check scheduled (daily at 08:00 PK)");
}

async function processSubscriptionExpiryChecks() {
  const now = new Date();
  const warningDate = new Date(now);
  warningDate.setDate(warningDate.getDate() + 7); // Warn 7 days before expiry

  // Find subscriptions expiring within 7 days
  const expiringSoon = await prisma.schoolSubscription.findMany({
    where: {
      status: { in: ["ACTIVE", "TRIAL"] },
      endDate: { lte: warningDate, gte: now },
    },
    include: {
      tenant: true,
      plan: true,
    },
  });

  for (const sub of expiringSoon) {
    logger.warn(`[Cron] Subscription expiring soon: ${sub.tenant.name} (ends: ${sub.endDate.toISOString()})`);

    // Notify tenant admin
    const admins = await prisma.user.findMany({
      where: {
        tenantId: sub.tenantId,
        role: { in: ["PRINCIPAL", "ADMIN"] },
      },
    });

    for (const admin of admins) {
      try {
        await sendPushNotification(admin.id, {
          title: "Subscription Expiring Soon",
          body: `Your ${sub.plan.name} plan expires on ${sub.endDate.toLocaleDateString("en-PK")}. Renew to avoid service interruption.`,
          data: { type: "SUBSCRIPTION_EXPIRY", subscriptionId: sub.id },
        });
      } catch (err: any) {
        logger.error(`[Cron] Subscription push failed: ${err.message}`);
      }
    }
  }

  // Mark expired subscriptions
  const expired = await prisma.schoolSubscription.updateMany({
    where: {
      status: { in: ["ACTIVE", "TRIAL"] },
      endDate: { lt: now },
    },
    data: { status: "EXPIRED" },
  });

  if (expired.count > 0) {
    logger.info(`[Cron] Marked ${expired.count} subscriptions as EXPIRED`);
  }

  logger.info(`[Cron] Subscription check complete: ${expiringSoon.length} expiring soon, ${expired.count} expired`);
}

// ═══════════════════════════════════════════════
// 4. Inactive User Cleanup (Weekly - Sunday at 2:00 AM)
// ═══════════════════════════════════════════════

export function scheduleInactiveUserCleanup() {
  cron.schedule("0 2 * * 0", async () => {
    logger.info("[Cron] Running weekly inactive user cleanup...");
    try {
      await processInactiveUserCleanup();
    } catch (err: any) {
      logger.error(`[Cron] Inactive user cleanup failed: ${err.message}`);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Karachi",
  });

  logger.info("[Cron] Inactive user cleanup scheduled (weekly on Sunday at 02:00 PK)");
}

async function processInactiveUserCleanup() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Find users who haven't logged in for 6+ months
  const inactiveUsers = await prisma.user.findMany({
    where: {
      isActive: true,
      lastLoginAt: { lt: sixMonthsAgo },
      role: { not: "SUPER_ADMIN" },
    },
    select: { id: true, firstName: true, lastName: true, email: true, role: true, tenantId: true, lastLoginAt: true },
    take: 500,
  });

  // Deactivate inactive users
  let deactivatedCount = 0;
  for (const user of inactiveUsers) {
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { isActive: false },
      });
      deactivatedCount++;

      // Audit log
      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          action: "USER_DEACTIVATED",
          entityType: "User",
          entityId: user.id,
          oldValues: { isActive: true, lastLoginAt: user.lastLoginAt },
          newValues: { isActive: false, reason: "Inactive for 6+ months" },
        },
      });
    } catch (err: any) {
      logger.error(`[Cron] Failed to deactivate user ${user.id}: ${err.message}`);
    }
  }

  logger.info(`[Cron] Deactivated ${deactivatedCount} inactive users (out of ${inactiveUsers.length} found)`);
}

// ═══════════════════════════════════════════════
// 5. Daily Attendance Summary for Admins (Daily at 7:00 PM)
// ═══════════════════════════════════════════════

export function scheduleDailyAttendanceSummary() {
  cron.schedule("0 19 * * *", async () => {
    logger.info("[Cron] Running daily attendance summary...");
    try {
      await processDailyAttendanceSummary();
    } catch (err: any) {
      logger.error(`[Cron] Attendance summary failed: ${err.message}`);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Karachi",
  });

  logger.info("[Cron] Daily attendance summary scheduled (daily at 19:00 PK)");
}

async function processDailyAttendanceSummary() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get attendance stats per tenant
  const tenants = await prisma.tenant.findMany({
    where: { status: "ACTIVE" },
  });

  for (const tenant of tenants) {
    const stats = await prisma.attendance.groupBy({
      by: ["status"],
      where: {
        tenantId: tenant.id,
        date: { gte: today },
      },
      _count: { status: true },
    });

    const total = stats.reduce((sum, s) => sum + s._count.status, 0);
    if (total === 0) continue;

    const present = stats.find((s) => s.status === "PRESENT")?._count.status || 0;
    const absent = stats.find((s) => s.status === "ABSENT")?._count.status || 0;
    const late = stats.find((s) => s.status === "LATE")?._count.status || 0;
    const leave = stats.find((s) => s.status === "LEAVE")?._count.status || 0;

    logger.info(`[Cron] Attendance summary for ${tenant.name}: Total=${total}, Present=${present}, Absent=${absent}, Late=${late}, Leave=${leave}`);

    // Notify principals
    const principals = await prisma.user.findMany({
      where: {
        tenantId: tenant.id,
        role: "PRINCIPAL",
        isActive: true,
      },
    });

    for (const principal of principals) {
      try {
        await sendPushNotification(principal.id, {
          title: "Daily Attendance Summary",
          body: `Today: ${present} present, ${absent} absent, ${late} late out of ${total} students`,
          data: { type: "ATTENDANCE_SUMMARY", date: today.toISOString() },
        });
      } catch (err: any) {
        logger.error(`[Cron] Attendance summary push failed: ${err.message}`);
      }
    }
  }
}

// ═══════════════════════════════════════════════
// Initialize All Cron Jobs
// ═══════════════════════════════════════════════

export function initializeAllCronJobs() {
  scheduleFeeDueReminders();
  scheduleAttendanceAlerts();
  scheduleSubscriptionExpiryChecks();
  scheduleInactiveUserCleanup();
  scheduleDailyAttendanceSummary();
  logger.info("[Cron] All cron jobs initialized successfully");
}

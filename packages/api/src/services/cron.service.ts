/**
 * @file src/services/cron.service.ts
 * @description Fee auto-reminder cron jobs using node-cron.
 */

import cron from "node-cron";
import { prisma } from "../config/database";
import { redis } from "../config/redis";
import { sendPushNotification } from "./push.service";
import { logger } from "../utils/logger";

const CRON_LOCK_KEY = "cron:fee_reminder:lock";
const CRON_LOCK_TTL = 300; // 5 minutes in seconds

/**
 * Acquire a distributed lock via Redis to prevent cron race conditions.
 */
async function acquireCronLock(): Promise<boolean> {
  try {
    const result = await redis.set(CRON_LOCK_KEY, "1", "EX", CRON_LOCK_TTL, "NX");
    return result === "OK";
  } catch (err: any) {
    logger.error(`[Cron] Failed to acquire lock: ${err.message}`);
    return false;
  }
}

/**
 * Release the distributed lock.
 */
async function releaseCronLock(): Promise<void> {
  try {
    await redis.del(CRON_LOCK_KEY);
  } catch (err: any) {
    logger.error(`[Cron] Failed to release lock: ${err.message}`);
  }
}

/**
 * Initialize fee reminder cron job.
 * Runs daily at 9:00 AM to notify parents of upcoming fee dues.
 */
export function initFeeReminderCron() {
  // Run every day at 9:00 AM
  cron.schedule("0 9 * * *", async () => {
    const hasLock = await acquireCronLock();
    if (!hasLock) {
      logger.info("[Cron] Fee reminder job skipped — another instance is running");
      return;
    }

    logger.info("[Cron] Running daily fee reminder job...");
    try {
      await sendFeeDueReminders();
    } catch (err: any) {
      logger.error(`[Cron] Fee reminder job failed: ${err.message}`);
    } finally {
      await releaseCronLock();
    }
  }, {
    scheduled: true,
    timezone: "Asia/Karachi",
  });

  logger.info("[Cron] Fee reminder cron job initialized (daily at 09:00 PK)");
}

/**
 * Send fee due reminders to parents for unpaid/partial fee records.
 */
export async function sendFeeDueReminders() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  // Find fee records that are unpaid/partial and due within the next day
  const feeRecords = await prisma.feeRecord.findMany({
    where: {
      status: { in: ["UNPAID", "PARTIAL"] },
      dueDate: { lte: tomorrow },
      notifiedAt: null, // Only notify once
    },
    include: {
      student: {
        include: {
          user: { select: { firstName: true, lastName: true } },
          parentLinks: {
            include: {
              parent: {
                include: {
                  user: { select: { id: true, phone: true, email: true } },
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

    for (const link of record.student.parentLinks) {
      const parentUser = link.parent.user;

      // Send push notification if FCM token exists
      try {
        await sendPushNotification(parentUser.id, {
          title: "Fee Due Reminder",
          body: `Fee of PKR ${amountDue.toFixed(2)} is due for ${studentName}. Due date: ${record.dueDate.toLocaleDateString("en-PK")}`,
          data: {
            type: "FEE_DUE",
            feeRecordId: record.id,
            studentId: record.studentId,
          },
        });
      } catch (err: any) {
        logger.error(`[Cron] Push notification failed for parent ${parentUser.id}: ${err.message}`);
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

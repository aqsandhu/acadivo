/**
 * @file src/utils/sms.ts
 * @description Re-export from unified SMS service for backward compatibility.
 * All SMS logic now lives in src/services/sms.service.ts.
 */

export { sendSMS, sendOTPSMS } from "../services/sms.service";

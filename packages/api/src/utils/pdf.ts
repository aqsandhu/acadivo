// ═══════════════════════════════════════════════
// PDF Utility — HTML to PDF generation using puppeteer
// ═══════════════════════════════════════════════

import puppeteer from "puppeteer-core";
import { logger } from "./logger";

export interface PDFOptions {
  format?: "A4" | "A3" | "Letter" | "Legal";
  landscape?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
}

export async function generatePDF(htmlContent: string, options: PDFOptions = {}): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0", timeout: 30000 });

    const pdfBuffer = await page.pdf({
      format: options.format || "A4",
      landscape: options.landscape || false,
      printBackground: options.printBackground !== false,
      margin: {
        top: options.margin?.top || "20px",
        right: options.margin?.right || "20px",
        bottom: options.margin?.bottom || "20px",
        left: options.margin?.left || "20px",
      },
    });

    return Buffer.from(pdfBuffer);
  } catch (err: any) {
    logger.error(`[PDF] Generation failed: ${err.message}`);
    throw err;
  } finally {
    await browser.close();
  }
}

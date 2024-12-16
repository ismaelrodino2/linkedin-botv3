import { Browser, Page } from "puppeteer";
import { getStopProcessing } from "./apply-linkedin/scripts/stop";
import { Response } from "express";

export const sleep = (baseMs: number) => {
  const randomDelay = Math.random() * 296 - 148;
  const delay = Math.max(0, baseMs + randomDelay);
  return new Promise((res) => setTimeout(res, delay));
};

export async function scrollToBottomAndBackSmoothly(
  page: Page,
  containerSelector: string,
  browser: Browser | null,
  res: Response
) {
  const scrollStep = 100;
  const scrollDelay = 50;

  async function scroll(direction: "down" | "up") {
    let previousScrollTop = 0;

    while (true && (await browser?.pages())?.length) {
      if (getStopProcessing()) {
        res.status(200).send('Processamento interrompido.');
        await browser?.close()
        return;
      }
      const currentScrollTop = await page.evaluate(
        (containerSelector, scrollStep, direction) => {
          const container = document.querySelector(containerSelector);
          if (container) {
            if (direction === "down") {
              container.scrollTop += scrollStep;
            } else {
              container.scrollTop -= scrollStep;
            }
            return container.scrollTop;
          }
          return 0;
        },
        containerSelector,
        scrollStep,
        direction
      );

      await sleep(scrollDelay);

      const containerMaxScrollTop = await page.evaluate((containerSelector) => {
        const container = document.querySelector(containerSelector);
        if (container) {
          return container.scrollHeight - container.clientHeight;
        }
        return 0;
      }, containerSelector);

      if (
        (direction === "down" && currentScrollTop >= containerMaxScrollTop) ||
        (direction === "up" && currentScrollTop <= 0)
      ) {
        break;
      }

      if (currentScrollTop === previousScrollTop) break;
      previousScrollTop = currentScrollTop;
    }
  }

  await scroll("down");
  await scroll("up");
} 
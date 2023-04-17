import { Browser, executablePath } from 'puppeteer';
const fsp = require('fs/promises'); // For Async fs(file system)
const puppeteer = require('puppeteer-extra'); // For puppeteer stealth below
const StealthPlugin = require('puppeteer-extra-plugin-stealth'); // For browser evasion
const adminInfo = require('../config/adminInfo');

puppeteer.use(StealthPlugin());

const url = `${adminInfo.url}`; // Kdia

async function Crawler() {
  const browser: Browser = await puppeteer.launch({
    headless: true, // Does not show browser if true
    executablePath: executablePath(), // Chronium *Requires Chrome
  });
  const page = await browser.newPage();
  await page.goto(url);
  await page.type('#id', adminInfo.id);
  await page.type('#password', adminInfo.password);
  await page.click('#submit');
  await page.waitForSelector('frameset'); // Wait for frameset

  // Onclick Mailing
  await page
    .frames()[1]
    .waitForSelector('#mailing')
    .then((el) => el?.click());

  // Onclick SentMails
  await page
    .frames()[2]
    .waitForSelector('#sentMails')
    .then((el) => el?.click());

  // Onclick DailyNews
  await page
    .frames()[4]
    .waitForSelector('#dailyNews')
    .then((el) => el?.click());

  // Wait to target selectors inside frameset
  await page.frames()[4].waitForSelector('.MsoNormal');

  await page
    .frames()[4]
    .evaluate(() => {
      // Note that there are numerous of unusefull .MsoNormal elements
      const queryAll = Array.from(document.querySelectorAll('.MsoNormal'));
      const dataArray = queryAll
        .filter(
          // Filter if the element includes '[' & 'a' tag - the first condition needs to be improved
          (el: any) => el.textContent?.includes('[') && el.querySelector('a')
        )
        .map((el: any) => ({
          title: el.textContent,
          link: el.querySelector('a').href,
        }));
      return dataArray;
    })
    .then((dataArray) => fsp.writeFile('data.json', JSON.stringify(dataArray)));

  await browser.close();
}
Crawler();

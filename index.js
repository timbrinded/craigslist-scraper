const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const Listing = require("./model/Listing");

require("dotenv").config();

const URL = "https://sfbay.craigslist.org/search/sof?lang=en&cc=gb";

const results = [
  {
    title: "entry level engineer",
    datePosted: new Date("23 aug 2008 12:00:00"),
    neighbourhood: "palo alto",
    url: "http://www.google.com",
    description: "text text text",
    compensation: "upto a million dollars",
  },
];

async function connectToMongoDb() {
  await mongoose.connect(process.env.DB_CONN, { useNewUrlParser: true });
  console.log("Connected to MongoDB.");
}

async function scrapeListings(page) {
  await page.goto(URL);
  const html = await page.content();
  const $ = cheerio.load(html);

  const results = $(".result-info")
    .map((index, element) => {
      const titleElement = $(element).find(".result-title");
      const timeElement = $(element).find(".result-date");
      const hoodElement = $(element).find(".result-hood");
      const title = $(titleElement).text();
      const url = $(titleElement).attr("href").replace("?lang=en&cc=gb", "");
      const datePosted = new Date($(timeElement).attr("datetime"));
      const hood = $(hoodElement)
        .text()
        .trim()
        .replace("(", "")
        .replace(")", "")
        .toUpperCase();
      return { title, url, datePosted, hood };
    })
    .get();

  return results;
}

async function scrapeListingsWithJobDescriptions(listings, page) {
  for (var i = 0; i < listings.length; i++) {
    await page.goto(listings[i].url);
    const html = await page.content();
    const $ = cheerio.load(html);

    const jobDescription = $("#postingbody").text().replace("\n        \n            QR Code Link to This Post\n            \n        \n","")
    // Different selector styles:
    // const compensation = $(".attrgroup").text().trim().split("\n")[0].split("compensation: ")[1];
    // const compensation = $("body > section > section > section > div.mapAndAttrs > p > span:nth-child(1) > b").text();
    const compensation = $(".attrgroup > span:nth-child(1) > b").text();
    listings[i].jobDescription = jobDescription;
    listings[i].compensation = compensation;
    //console.log(listings[i]);
    const listingModel = new Listing(listings[i]);
    listingModel.save();

    await sleep(1000);
  }
}

async function sleep(milli) {
  return new Promise((resolve) => setTimeout(resolve, milli));
}

async function main() {
  await connectToMongoDb();
  const browser = await puppeteer.launch({ headless: false });
  var page = await browser.newPage();
  const listings = await scrapeListings(page);
  const listingsWithJobDescriptions = await scrapeListingsWithJobDescriptions(
    listings,
    page
  );

  console.log(listings);

  //await browser.close();
}

main();

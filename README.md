Very basic example of a web scraper for craigslist. 

This program will use puppeteer to navigate to craigslist, scrape iterate through pages and save the cleaned data onto a Mongoose DB.

# Instructions
1. Create an account at [Mongoose Cloud](https://cloud.mongodb.com/)
2. Create a `.env` file like `.env.example` with the mongoose connection string setup with a valid user
3. Run the following:
```
yarn
node index.js
```
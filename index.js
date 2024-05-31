// load the 'Puppeteer' and 'File Server' modules
const puppeteer = require('puppeteer');
const fs = require('fs');

// set the URL to the web page that will be scraped
const url = 'https://zimpricecheck.com/price-updates/zesa-tariffs/';

// retrieving the current date to create a string to use when appending the CSV file and naming the JSON file
function theDate() {
  const today = new Date();
  const year = today.getFullYear().toString();
  const month = ( today.getMonth() + 1 ).toString();
  // the date will be in the YYYY-MM-DD format
  return month.concat("-", year);
}

// getData set to IIFE
const getData = async () => {
  // launch Puppeteer
  const browser = await puppeteer.launch();
  // Puppeteer opens a new page 
  const page = await browser.newPage();
  // set the viewport of the page
  await page.setViewport({
    width: 1680,
    height: 1080,
  })
  // request the web page
  await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: 240000,
  })
  // take a screenshot of the page
  await page.screenshot({ 
    path: `c:\\Users\\Nelly Muzenda\\Downloads\\Data Bank\\Zim Price Check\\ZETDC Tariffs\\screenshot\\${theDate()}.png`,
    fullPage: true
  });  
    // retrieve html data of requested page
  const result = await page.evaluate( () => {
    // select the element with the date on the page
    const pageDate = document.querySelector('h4.fusion-responsive-typography-calculated:nth-child(5)');
    // select all rows from the table on the page
    const data = document.querySelectorAll('figure.wp-block-table:nth-child(6) > table:nth-child(1) > tbody:nth-child(2) tr');

    // set the date
    const currentMonth = pageDate.innerText.split(" ").slice(-2).join("-");
    // return the data from the each table row in an array of objects
    return Array.from(data).map( (el) => {
      const band = el.querySelector('td:nth-child(1)').innerText;
      const price = el.querySelector('td:nth-child(2)').innerText;

      return { 
        currentMonth,
        band,
        price,
      }
    });
  });

  // stop running Puppeteer
  await browser.close()
  // return the result of calling the function
  return result
}

getData().then ( value => {
  console.log('Data scrapped...');
  console.log(value);

  // save the scrapped data as to a JSON file
  fs.writeFile(`c:\\Users\\Nelly Muzenda\\Downloads\\Data Bank\\Zim Price Check\\ZETDC Tariffs\\json\\${value[0].currentMonth}_tariffs.json`, JSON.stringify(value), err => {
    if (err) throw err;
    console.log(`Tariffs for ${value[0].currentMonth} successfully saved to JSON...`)
  })

  // appending the date to the CSV file
  // append the date to the first column of the CSV file
  fs.appendFile('c:\\Users\\Nelly Muzenda\\Downloads\\Data Bank\\Zim Price Check\\ZETDC Tariffs\\tariffs.csv', `${value[0].currentMonth}`, err => {
    if (err) throw err;
    console.log('Adding date to CSV file')
  })

  // appending the data to each CSV file
  for ( let i = 0; i < value.length; i++) {
    fs.appendFile('c:\\Users\\Nelly Muzenda\\Downloads\\Data Bank\\Zim Price Check\\ZETDC Tariffs\\tariffs.csv', newLine(), err => {
      if (err) throw err;
    });
    // function adds a newline character to the last array element appended to the CSV file
    function newLine() {
      if ( i === value.length - 1 ) {
        return `,${value[i].price}\n`
      } else return `,${value[i].price}`
    }}
  console.log(`Tariffs for ${value[0].currentMonth} saved to CSV file...`)    
});
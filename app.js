const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const hbs = require('handlebars');
const path = require('path');

var app = express();
//const moment = require('moment');

const data = require('./data.json');


const compile = async function (template, data) {
    const filepath = path.join(process.cwd(), `${template}.html`);
    const html = await fs.readFile(filepath, 'utf-8');
    return hbs.compile(html)(data);
}; 

// hbs.registerHelper('dateFormat', function (value, format) {
//     return moment(value).format(format);
// });

const getPDF = async  () => {
    try {
        // create browser instance 
        const browser = await puppeteer.launch({headless:true});

        // create new page
        const page = await browser.newPage();

        // Getting content from html file
        const content = await compile('invoice', data);
       
        
        await page.setContent(content);
        

       // To reflect CSS used for screens instead of print
       // await page.emulateMediaType('screen');
        
        
        // generate the pdf file
        await page.pdf({
            path: `${__dirname}/download/datapdf.pdf`,
            format: 'A4',
            printBackground: true
        });

        console.log('done');

        //close the browser instance
        await browser.close();
        
    } catch (error) {
        console.log('######Error:', error);
        process.exit(1);
    }
    
};

app.get('/pdf', async function (req, res) {
    await getPDF();
    res.contentType("application/pdf");
    const fileStream = fs.createReadStream(`${__dirname}/download/datapdf.pdf`);
    console.log('############', __dirname);
    fileStream.on('open', () => {
        res.attachment('datapdf.pdf');
        fileStream.pipe(res);
    });
    fileStream.on('error', err => {
        console.log(err);
    })
        
});

app.listen(3002, function(){ console.log('Listening on 3002') });
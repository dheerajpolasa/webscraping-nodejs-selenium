const { json } = require('body-parser');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const path = require('path');
const rp = require('request-promise');
const puppeteer = require('puppeteer');
const {Builder, By, Key, util} = require('selenium-webdriver');
const {ServiceBuilder} = require('selenium-webdriver/chrome');

module.exports.home = function(req, res) {
    try {
        return res.render('home')
    } catch (err) {

    }
}

module.exports.search = async function(req, res) {
    // let o = new chrome.Options();
    // // o.addArguments('start-fullscreen');
    // o.addArguments('disable-infobars');
    // // o.addArguments('headless'); // running test on visual chrome browser
    // o.setUserPreferences({ credential_enable_service: false });
    const targetURL = "https://www.hamburgsud-line.com/liner/en/liner_services/ecommerce/track_trace/index.html"

    const chromeDriverPath = path.join(__dirname, "../", "chromedriver_86.exe"); 
    const serviceBuilder = new ServiceBuilder(chromeDriverPath);

    let driver = await new Builder().forBrowser('chrome').setChromeService(serviceBuilder).build();
    await driver.get(targetURL);

    // let input = await driver.findElement(By.id('tnt'));
    try {
        let closeSVG = await (await driver.findElement(By.css("#cmpbox > div.cmpclose > a > svg"))).click();
    } catch(err) {
        console.log(err);
    }
    await driver.sleep(3000);
    driver.executeScript('window.scrollTo(0,150);');

    driver.switchTo().frame(4);
    const inputvalue = req.body.input;

    let input = await driver.findElement(By.name('j_idt6\:searchForm\:j_idt8\:inputReferences'));

    input.sendKeys(inputvalue); 

    let findButton = await driver.findElement(By.id('j_idt6:searchForm:j_idt8:search-submit')).click();
    await driver.sleep(3000);
    let result = {};
    let inputType;
    try {
        let containerDetails = await driver.findElement(By.id('j_idt6:searchForm:j_idt39:containerDetails'));
        inputType = 'container';
    } catch(err) {

    }

    try {
        let containerOverview = await driver.findElement(By.id('j_idt6:searchForm:j_idt24:containerOverview_content'));
        inputType = 'overview';
    } catch(err) {

    }
    if(inputType === 'overview') {
        result[inputvalue] = {
            containers: {

            }
        }

        let rows = await driver.findElements(By.xpath('/html/body/main/div/div/form/div[3]/div/div/div[2]/div/div/table/tbody/tr'));
        console.log(rows);

        for(let i=1; i<=rows.length; i++) {
            let row = await driver.findElement(By.xpath('/html/body/main/div/div/form/div[3]/div/div/div[2]/div/div/table/tbody/tr['+i+']'))
            let button = await (await row.findElement(By.xpath('./child::td[2]/a'))).click();
            // console.log(container);
            await driver.sleep(4000)
            let containerBox = await driver.findElement(By.xpath('//*[@id="j_idt6:searchForm:j_idt39:j_idt43_content"]'));
            let containerName = await (await containerBox.findElement(By.xpath('./child::div[1]/div[1]'))).getText();
            console.log(containerName.split('\n'))
            containerName = containerName.split('\n')[2];
            let parsed_data  = []
        
            let tbody = await driver.findElements(By.xpath('/html/body/main/div/div/form/div[3]/div/div/div[5]/div[1]/div/table/tbody/tr'));
            for(let tr of tbody) {
                let location = await (await tr.findElement(By.xpath('./child::td[2]'))).getText();
                let event = await (await tr.findElement(By.xpath('./child::td[3]'))).getText();
                let planned_date = await (await tr.findElement(By.xpath('./child::td[1]/span[2]'))).getText();
                let actual_date = await (await tr.findElement(By.xpath('./child::td[1]/span[2]'))).getText();
                let mode = await (await tr.findElement(By.xpath('./child::td[4]'))).getText();
                let container_json = {
                    location,
                    event,
                    planned_date,
                    actual_date,
                    mode
                }
                // console.log(container_json)
                parsed_data.push(container_json);
            }
            console.log(parsed_data)
            result[inputvalue]['containers'][containerName] = {}
            result[inputvalue]['containers'][containerName]["parsed_data"] = parsed_data;
            console.log(result[inputvalue]['containers'][containerName]['parsed_data']);

            await (await driver.findElement(By.xpath('//*[@id="j_idt6:searchForm:j_idt39:contDetailsBackButton"]'))).click();
            await driver.sleep(4000);
        }
    } else if(inputType === 'container') {
        result[inputvalue] = {
            
        }
        await driver.sleep(4000)
        let containerBox = await driver.findElement(By.id('j_idt6:searchForm:j_idt39:j_idt43_content'));
        let containerName = await (await containerBox.findElement(By.xpath('./child::div[1]/div[1]'))).getText();
        console.log(containerName.split('\n'))
        containerName = containerName.split('\n')[2];
        let parsed_data  = []
        let tbody = await driver.findElements(By.xpath('/html/body/main/div/div/form/div[3]/div/div/div[5]/div[1]/div/table/tbody/tr'));
        for(let tr of tbody) {
            let location = await (await tr.findElement(By.xpath('./child::td[2]'))).getText();
            let event = await (await tr.findElement(By.xpath('./child::td[3]'))).getText();
            let planned_date = await (await tr.findElement(By.xpath('./child::td[1]/span[2]'))).getText();
            let actual_date = await (await tr.findElement(By.xpath('./child::td[1]/span[2]'))).getText();
            let mode = await (await tr.findElement(By.xpath('./child::td[4]'))).getText();
            let container_json = {
                location,
                event,
                planned_date,
                actual_date,
                mode
            }
            // console.log(container_json)
            parsed_data.push(container_json);
        }

        result[inputvalue]['parsed_data'] = parsed_data;
    }

    driver.quit();
    console.log(result);

    if(req.xhr) {
        return res.json(201, {
            data: result 
        })
    }

    return res.redirect('back');
}

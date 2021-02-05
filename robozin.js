const puppeteer = require('puppeteer');
const express = require('express');
const cors = require('cors');

async function getWeather(city) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080
    });

    await page.goto('https://lerolero.com');

    // await page.click('span:nth-child(3) > [href="#"]');
    await page.waitForSelector('.sentence.sentence-exited');

    const quote = await page.evaluate(() => {
        return document.querySelector('.sentence.sentence-exited').innerText;
    });

    await page.goto(`https://www.google.com/search?q=weather+${city}&oq=weather+${city}&aqs=chrome..69i57j0l4j46j69i60l2.9187j1j7&sourceid=chrome&ie=UTF-8`);
    // await page.screenshot({ path: 'weather.png' });

    let data = await page.evaluate(() => {
        let temperature = document.querySelector('#wob_tm').innerHTML;
        let weather = document.querySelector('#wob_dc').innerHTML;
        let rain = document.querySelector('#wob_pp').innerHTML;
        let date = document.querySelector('#wob_dts').innerHTML.split(', ');
        let day = date[0];
        let hour = Number(date[1].replace(':', ''));
        let location = document.querySelector('#wob_loc').innerHTML;
        let errorMessage = '';
        let img = document.querySelector('#wob_tci').src;

        return {
            temperature,
            weather,
            rain,
            day,
            hour,
            location,
            errorMessage,
            img
        }
    }).catch(() => {
        return { errorMessage: 'city not found or page doesn\'t exist' };
    });
    
    if (data.errorMessage === '') {
        let greeting = setGreeting(data.hour);
        data = { ...data, greeting, quote };
    }

    await browser.close();
    return data;
}

function setGreeting(hour) {
    let greeting = 'Saudações';
    if (hour < 600) {
        greeting = 'Boa madrugada!';
    } else if (hour < 1200) {
        greeting = 'Bom dia!';
    } else if (hour < 1800) {
        greeting = 'Boa tarde!';
    } else {
        greeting = 'Boa noite!';
    }
    return greeting;
}

// expondo a "API" na porta 6272
const app = express();
app.use(cors());

app.get('/:city', (req, res) => {
    getWeather(req.params.city).then(
        data => {
            return res.json(data);
        }
    ).catch(
        erro => {
            console.log(erro);
        }
    );
});

app.listen('6272');

const puppeteer = require('puppeteer');

async function start() {

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080
    });

    const city = 'São Paulo';

    await page.goto('https://lerolero.com');

    // await page.click('span:nth-child(3) > [href="#"]');
    await page.waitForSelector('.sentence.sentence-exited');

    const quote = await page.evaluate(() => {
        return document.querySelector('.sentence.sentence-exited').innerText;
    });

    await page.goto(`https://www.google.com/search?q=weather+${city}&oq=weather+${city}&aqs=chrome..69i57j0l4j46j69i60l2.9187j1j7&sourceid=chrome&ie=UTF-8`);
    await page.screenshot({ path: 'weather.png' });

    const data = await page.evaluate(() => {
        let temperature = document.querySelector('#wob_tm').innerHTML;
        let weather = document.querySelector('#wob_dc').innerHTML;
        let rain = document.querySelector('#wob_pp').innerHTML;
        let date = document.querySelector('#wob_dts').innerHTML.split(', ');
        let day = date[0];
        let hour = Number(date[1].replace(':', ''));
        let location = document.querySelector('#wob_loc').innerHTML;

        return {
            temperature,
            weather,
            rain,
            day,
            hour,
            location
        }
    });
    
    const greeting = setGreeting(data.hour);

    console.log(`\n${greeting}! Hoje é ${data.day} o tempo está ${data.weather} com a temperatura de ${data.temperature}°C e probabilidade de chuva de ${data.rain} em ${data.location}`);
    console.log(`A frase aleatória do dia é: "${quote}"`);
    console.log('Aproveite!');

    await browser.close();
}

function setGreeting(hour) {
    let greeting = 'Saudações';
    if (hour < 600) {
        greeting = 'Boa madrugada';
    } else if (hour < 1200) {
        greeting = 'Bom dia';
    } else if (hour < 1800) {
        greeting = 'Boa tarde';
    } else {
        greeting = 'Boa noite';
    }
    return greeting;
}

start();
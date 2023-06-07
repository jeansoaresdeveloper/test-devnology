import fetch from "node-fetch";
import * as fs from "fs";
import * as cheerio from "cheerio";
import * as path from "path";
import * as urlParser from "url";

// const response = await fetch('https://devgo.com.br/');
// const body = await response.text();


// console.log(body);
const seenUrls = {};

const getUrl = (link: string) => {
    if (link.includes('https')) {
        return link;
    } else if (link.startsWith('/')) {
        return `https://devgo.com.br${link}`
    }
    else {
        return `https://devgo.com.br/${link}`;
    }
}

const crawl = async ({ url }) => {
    if (seenUrls[url]) return;
    console.log('crawling', url);
    seenUrls[url] = true;

    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html)
    const links = $("a")
        .map((i, link) => link.attribs.href)
        .get();
    const imageURls = $("img")
        .map((i, link) => link.attribs.src)
        .get();

        imageURls.forEach(imageUrl => {
            fetch(getUrl(imageUrl)).then(response =>{
                const fileName = path.basename(imageUrl);
                const dest = fs.createWriteStream(`images/${fileName}.jpg`);
                response.body.pipe(dest);
            });
        });

        const parsedUrl = new URL(url);
        const host = parsedUrl.host;

    links
    .filter(link => link.includes(host))
    .forEach(link => {
        crawl({
            url: getUrl(link),
        });
    });
};

crawl({
    url: 'https://devgo.com.br/',
});

// const create = fs.writeFileSync('./src/informationPage.txt', body);
// console.log(create)
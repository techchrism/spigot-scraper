const cheerio = require('cheerio');
const cloudscraper = require('cloudscraper');
const fs = require('fs').promises;
const url = require('url');

function parseData(htmlString)
{
    const $ = cheerio.load(htmlString);
    let data = {};
    
    data.name = $('.resourceInfo h1').first().contents().filter((index, element) => element.type === 'text').text().trim();
    data.version = $('.resourceInfo h1 .muted').text();
    data.icon = url.resolve('https://www.spigotmc.org/', $('.resourceIcon').attr('src'));
    data.tagline = $('.tagLine').text();
    data.nativeMinecraftVersion = $('.customResourceFieldnative_mc_version dd').text();
    data.testedMinecraftVersions = $('.customResourceFieldmc_versions li').map((i, elem) => $(elem).text()).get();
    let author = $('.author a');
    data.author = {
        name: author.text(),
        url: url.resolve('https://www.spigotmc.org/', author.attr('href'))
    };
    data.downloads = Number($('.downloadCount dd').text());
    data.firstRelease = $('.firstRelease .DateTime').attr('title');
    data.category = $('.resourceCategory a').text();
    data.rating = Number($('#resourceInfo .ratings').attr('title'));
    data.ratingCount = Number($('#resourceInfo .rating .Hint').text().replace(/ ratings?/, ''));
    data.latestVersion = {
        released: $('.versionReleaseDate .DateTime').text(),
        downloads: Number($('.versionDownloadCount dd').text()),
        rating: Number($('#versionInfo .ratings').attr('title')),
        ratingCount: Number($('#versionInfo .rating .Hint').text().replace(/ ratings?/, ''))
    };
    data.reviews = $('.reviews>ol>li').map((i, elem) => {
        let poster = $('.messageContent .poster', elem);
        let review =  {
            poster: {
                name: poster.text(),
                url: url.resolve('https://www.spigotmc.org/', poster.attr('href'))
            },
            rating: Number($('.ratings', elem).attr('title')),
            version: $('.messageContent .muted', elem).text().slice(9)
        };
        let reply = $('.secondaryContent', elem);
        if(reply.length > 0)
        {
            review.reply = $('blockquote', reply).text();
        }
        
        return review;
    }).get();
    return data;
}

async function getResource(url)
{
    return parseData(await cloudscraper.get(url));
}

module.exports.getResource = getResource;

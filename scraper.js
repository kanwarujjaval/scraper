const request = require('request');
const cheerio = require('cheerio');
let scraper = function (seedLink, link) {
    console.log('here with', link)
    if (!link) {
        link = seedLink;
    }
    let links = []
    let obj = {
        link: link
    };
    request(link, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            try {
                const $ = cheerio.load(html);
                let pageTitle = $("title").text();
                $('img').map((i, e) => {
                    try {
                        let altTag = $(e).attr('alt');
                        let imageSource = $(e).attr('src');
                        if (altTag && altTag != '' && pageTitle.includes(altTag)) {
                            if (!imageSource.includes('base64')) {
                                obj.title = altTag;
                                obj.image = [imageSource];
                            }
                        }
                    } catch (e) {
                        // image fetch failure
                    }
                });
                if (obj.image) {
                    let prevImage = obj.image[0];
                    $('img').map((i, e) => {
                        try {
                            let src = $(e).attr('src');
                            let srcL = src.toLowerCase();
                            if (srcL.includes('http') && srcL.includes(prevImage.slice(prevImage.lastIndexOf('/'), prevImage.lastIndexOf('/') + 5))) {
                                obj.image.push(src);
                            }
                        } catch (e) {
                            // image failure
                        }
                    });
                }
                $('td').map(function (i, e) {
                    try {
                        if ($(e).text().toLowerCase().includes('price:')) {
                            obj.price = $(e).next().text().match(/\d+\W\d+/)[0];
                        };
                    } catch (e) {
                        // price fetch failure
                    }
                });
                $('h2').map(function (i, e) {
                    try {
                        if ($(e).text().toLowerCase().includes('product description')) {
                            obj.description = $(e).next().html().replace(/\s\s/g, '').replace(/\n/g, '').replace(/\t/g, '');
                        }
                    } catch (e) {
                        // description fetch failure
                    }
                });
                    $('a').map(function (i, e) {
                        try {
                            console.log("________________",$(e).attr('href'))
                            if ($(e).attr('href') && $(e).attr('href').includes('://amazon.in') && $(e).attr('href').includes('://www.amazon.in')) {
                                if ($(e).attr('href').startsWith('/')) {
                                    links.push({ path: 'https://www.amazon.in' + $(e).attr('href'), load: 0 })
                                } else {
                                    links.push({ path: $(e).attr('href'), load: 0 });
                                }
                            }
                        } catch (e) {
                            // link fetch failure
                        }
                    });

            } catch (e) {
                // failed on this page
            }
            console.log(obj)
            //save links to db
            if (obj.price) {
                console.log(require('./db').prods(obj).save());
            }
            console.log(require('./db').links.create(links));
            require('./db').links.find({}, {}, { lean: true }, function (err, data) {
                data.forEach((d) => {
                    scraper(seedLink, d.path);
                })

            });
        }
    });
}

module.exports = scraper;
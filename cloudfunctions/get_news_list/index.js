let superagent = require('superagent');
let charset = require('superagent-charset');
charset(superagent);
let cheerio = require('cheerio');
const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
    // API 调用都保持和云函数当前所在环境一致
    env: cloud.DYNAMIC_CURRENT_ENV
});


let baseUrl = 'https://blog.emptychan.xyz';
const successCode = 0,
    failCode = -1;

function uniqueArr(arr) {
    var rs = [];
    for (let i in arr) {
        if (rs.indexOf(arr[i]) != -1) {
            rs.push(arr[i]);
        }
    }
    return rs;
}

function inArr(v, arr) {
    let rs = false;
    for (let i in arr) {
        if (arr[i] == v) {
            rs = true;
            break;
        }
    }
    return rs;
}

exports.main = async (event, context) => {
    let page = event.p;
    console.log(`page=>${page}`);
    let route = page != 1 ? `${baseUrl}/page/${page}/` : baseUrl;
    return new Promise((resolve, reject) => {
        superagent.get(route)
        .buffer(true)
            .charset('utf-8')
            .end(function (err, sres) {
                let items = [];
                if (err) {
                    console.log('ERR: ' + err);
                    resolve({
                        code: failCode,
                        msg: err,
                        sets: items
                    });
                }
                let $ = cheerio.load(sres.text, {
                    decodeEntities: false
                });
                $('div.main-body div.article-summary-inner').each(function (idx, element) {
                    let $element = $(element);
                    let title = $element.find('h1 > a');
                    // console.log(`title=>${title.text()}`);
                    let url = `${baseUrl}${$element.children('a').attr('href')}`;
                    // console.log(`url=>${url}`);
                    let $subElement = $element.find('a > span');
                    var imageSrc = $subElement.attr('style');
                    let imageUrl = imageSrc.match(/background-image:url\((.*)\)/);
                    imageUrl = imageUrl.length == 0 ? "" : imageUrl[1];
                    // console.log(`image=>${imageUrl}`);
                    let description = $element.children('p');
                    items.push({
                        url: url,
                        title: title.text(),
                        imageSrc: imageUrl,
                        description: description.text().trim(),
                    });
                });
                resolve({
                    code: successCode,
                    msg: "",
                    data: items
                });
            });
    });
};
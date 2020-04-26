let superagent = require('superagent');
let charset = require('superagent-charset');
charset(superagent);
let cheerio = require('cheerio');

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
    let url = event.url;
    console.log(`request => ${url}`);
    url = encodeURI(url);
    return new Promise((resolve, reject) => {
        superagent.get(url)
        .buffer(true)
            .charset('utf-8')
            .end(function (err, sres) {
                if (err) {
                    console.log('ERR: ' + err);
                    resolve(err);
                }
                let $ = cheerio.load(sres.text, {
                    decodeEntities: false
                });
                let mainBody = $('div.article-entry');
                resolve({
                    code: successCode,
                    msg: "",
                    data: mainBody.html().trim()
                });
            });
    });
};
let WxParse = require('../../wxParse/wxParse.js');
const config = require('../../conf.js');
const util = require('../../utils/util.js');
const request = require('../../utils/request.js');
wx.cloud.init();
Page({
    data: {
        url: '',
        title: '',
        article: '',
        showLoading: true
    },
    copyToClipboard() {
        wx.setClipboardData({
            data: this.data.url,
            success(res) {
                wx.getClipboardData({
                    success(res) {
                        console.log(res.data) // data
                    }
                });
            }
        });
    },
    fetchNews(url) {
        // return request({
        //     method: 'POST',
        //     url: util.getUrl('/news'),
        //     data: {
        //         'url': url
        //     }
        // });
        return wx.cloud.callFunction({
            // 云函数名称
            name: 'get_news_detail',
            // 传给云函数的参数
            data: {
                url: this.data.url
            }
        });
    },
    loadNews() {
        const eventChannel = this.getOpenerEventChannel();
        let that = this;
        // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
        eventChannel.on('acceptDataFromOpenedPage', function (data) {
            that.setData({
                url: data.url,
                title: data.title
            });
            wx.setNavigationBarTitle({
                title: that.data.title
            });
            wx.getStorage({
                key: that.data.title,
                success: function (res) {
                    // success
                    console.log('from storage...');
                    that.newsRespHandler(res.data, that);
                    that.setData({
                        showLoading: false
                    });
                },
                fail: function () {
                    // fail
                    console.log('from network...');
                    that.fetchNews(that.data.url).then((result) => {
                        let resp = result.result;
                        that.newsRespHandler(resp, that);
                        that.setData({
                            showLoading: false
                        });
                    }).catch(err => {
                        console.log(err);
                    });
                }
            });
        });
        this.setData({
            showLoading: true
        });
    },
    newsRespHandler(resp, that) {
        if (resp.code != 0) {
            return;
        }
        if (util.isEmpty(resp.data)) {
            return;
        }
        that.setData({
            article: resp.data
        });
        wx.setStorage({
            key: that.data.title,
            data: resp
        });
        WxParse.wxParse('article', 'html', that.data.article, that, 8);
    },
    onLoad() {
        this.loadNews();
    },
    onUnload: function () {
        // 页面销毁时执行
        wx.setNavigationBarTitle({
            title: config.miniprogram
        });
    }
})
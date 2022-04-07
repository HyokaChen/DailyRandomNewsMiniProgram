//index.js
const util = require('../../utils/util.js');
const request = require('../../utils/request.js');
wx.cloud.init();
Page({
    data: {
        showLoading: false,
        newsList: [],
        previewing: false,
        hasMore: true,
        row: 3,
        page: 1,
        showLoadMore: false,
        isPulldown: false,
        rows:['100%','100%','100%','100%','100%','60%','100%','100%','100%','100%','100%','60%','100%','100%','100%','100%','100%','60%','100%','100%','100%','100%','100%','60%']
    },
    showLoading(message) {
        this.setData({
            showLoading: true,
            previewing: false
        });
    },
    hideLoading() {
        this.setData({
            showLoading: false,
            previewing: true
        });
    },
    fetchNewsList(show_loading_status) {
        if (show_loading_status) {
            this.showLoading('loading...');
        } else {
            this.hideLoading();
        }
        console.log('url: ' + util.getUrl('/lists', [{
            p: this.data.page
        }]));
        // return request({
        //     method: 'GET',
        //     url: util.getUrl('/lists', [{
        //         p: this.data.page
        //     }])
        // });
        return wx.cloud.callFunction({
            // 云函数名称
            name: 'get_news_list',
            // 传给云函数的参数
            data: {
                p: this.data.page
            }
        });
    },
    //监听用户下拉刷新事件
    onPullDownRefresh() {
        this.setData({
            showLoadMore: false,
            isPulldown: true,
            page: 1
        });
        this.loadNewsListData(true);
    },
    //监听用户上拉触底事件
    onReachBottom: function () {
        this.setData({
            showLoadMore: true,
            page: this.data.page + 1
        });
        this.loadNewsListData(false);
    },
    loadNewsDetail(event) {
        let index;
        if (!util.isEmpty(this.data.newsList)) {
            index = event.target.dataset.index;
            let item = this.data.newsList[index];
            wx.navigateTo({
                url: '/pages/news/news',
                success: function (res) {
                    // 通过eventChannel向被打开页面传送数据
                    res.eventChannel.emit('acceptDataFromOpenedPage', {
                        url: item.url,
                        title: item.title
                    });
                }
            });
        }
    },
    loadNewsListData(flush) {
        let that = this;
        this.fetchNewsList(flush).then((result) => {
            let resp = result.result;
            if (flush) {
                that.hideLoading();
            }
            if (resp.code !== 0) {
                wx.showToast({
                    title: '加载失败',
                    icon: 'none',
                    duration: 2000
                  });
                return;
            }
            if (resp.data.length == 0) {
                that.setData({
                    hasMore: false
                });
            }
            that.setData({
                newsList: flush ? resp.data : that.data.newsList.concat(resp.data),
            });
            if(that.data.isPulldown){
                wx.stopPullDownRefresh();
                wx.hideNavigationBarLoading();
            }
        }).catch(err => {
            console.log(err);
            that.setData({
                page: that.data.page == 1 ? 1 : that.data.page - 1
            });
        });
    },
    onLoad() {
        this.loadNewsListData(true);
    }
})
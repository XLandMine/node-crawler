var http = require("http");
var https = require("https");
var urlUtil = require("url");
var events = require('events');
var crawlEmitter = new events.EventEmitter();

//获得a标签的链接
var urlReg = /<a.*?href=['"]([^"']*)['"][^>]*>/gmi;

//将要抓取的url队列
var newUrlQueen = [];

//已经抓取完毕的url队列
var oldUrlQueen = [];

//几率抓取结果
var crawlCount = {
    total:0,
    success:0,
    failure:0
};

//注册爬取事件
crawlEmitter.on("crawl",function(c){
    if (newUrlQueen.length > 0) {
        //从队列中取出要爬取的url
        var url = newUrlQueen.shift();
        //填入爬取过的url
        oldUrlQueen.push(url);
        //开始爬取
        c.senReq(url)
    }else {
        console.log("抓取结束，此次抓取统计：");
        console.log(crawlCount);
    }
});

//注册html下载成功事件
crawlEmitter.on("success",function(c,url,data){
    console.log("请求成功url：",url);
    crawlCount.success++;
    //解析页面所有url
    var urlArr = Crawler.parseUrl(data);
    urlArr.forEach(function(v){
        //过滤不符合条件的url，符合条件的才会被加入待查询url队列
        if ( Crawler.filterUrl( v , c ) ) { newUrlQueen.push(v) };
    })

    //解析页面所需要的数据
    c.paresHtml(data);
    //继续抓取
    c.crawl();
})

//注册html下载出错事件
crawlEmitter.on("error",function(c,url,err){
    console.log("请求失败url:",url);
    console.log("失败log：",err);
    // console.log(err);
    crawlCount.failure++;
    c.crawl();
})

var Crawler = function (opt){
    //抓取深度
    this.deepCount = ( opt.deepCount * 1 ) || 5;

    //抓取开始的第一个URL
    this.firstUrl = opt.firstUrl || '';

    //URL地址过滤 false不加入抓取队列
    this.filterUrl = typeof  opt.filterUrl == "function" ? opt.filterUrl : function(url){return true;};
    
    //对抓取的html字符串进行解析
    this.paresHtml = typeof opt.paresHtml == 'function' ? opt.paresHtml : function(html){};
    
    if (this.firstUrl) {
        newUrlQueen.push(this.firstUrl);
    }
}

//解析html文本中所有a链接的url
Crawler.parseUrl = function(html){
    var urlArr = [];
    var m = null;
    while( m = urlReg.exec(html) ){
        //利用正则将解析到的url保存到数组
        urlArr.push(m[1]);
    }
    return urlArr;
}

//url过滤规则
Crawler.filterUrl = function( url , c){
    var uObj , deep;
    //判断队列中是否有该url
    if (oldUrlQueen.indexOf( url ) > -1 || newUrlQueen.indexOf( url ) > -1) { return false};
    
    uObj = urlUtil.parse(url);

    //判断是否是锚链接
    if (uObj.hash) { return false};
    if (uObj.path) {
        //只保留path的 / 字符串
        deep = uObj.path.replace(/[^//]/g,"").length;
        //判断是否超过设定的页面深度
        if ( deep >= c.deepCount ) { return false };
    }
    //调用对象自定义的filterUrl方法
    return c.filterUrl(url);
}

//开始爬取队列中的url
Crawler.prototype.crawl = function(){
    //触发crawl事件，将this当参数传入
    crawlEmitter.emit("crawl",this);
}

//发送请求
Crawler.prototype.senReq = function(url){
    var req = '';
    var oOptions = urlUtil.parse(url);
    oOptions.headers = {
        "User-Agent":"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.152 Safari/537.36",
    };
    if(url.indexOf("https") > -1){
        req = https.request(oOptions);
    } else if (url.indexOf("http") > -1) {
        req = http.request(oOptions);
    } else {
        //该url不是http或者https协议，放弃掉并开始下一次抓取
        this.crawl();
        return;
    }
    var self = this;
    req.on("response",function(res){
        var data = '';
        // res.headers["content-type"]
        res.setEncoding('utf8');
        res.on('data', function(chunk){
            data += chunk;
        });
        res.on('end', function(){
            //html文本下载完成，进行处理
            crawlEmitter.emit("success",self,url,data)

            data = null;
        })
    });

    req.on("error",function(err){
        crawlEmitter.emit("error",self,url,err)
    });

    req.on("finish",function(){
        console.log("开始请求地址",url)
        crawlCount.total++;
    });

    req.end();
}


module.exports = Crawler;
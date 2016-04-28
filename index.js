var Crawler = require('./modules/crawler');

var opt = {
    paresHtml:function(html){
        
    },
    filterUrl:function(url){
        return true;
    },
    deepCount:5,
    firstUrl:"http://www.lagou.com"
};

var c = new Crawler(opt);
c.crawl();
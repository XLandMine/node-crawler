var Crawler = require('./modules/crawler');

var opt = {
    paresHtml:function(html){
        console.log(html);
    },
    filterUrl:function(url){
    	//如果url不是www.example.com网站下的，则舍弃
        if( url.indexOf("www.example.com") == -1 ) return false;
        //否则保留
        return true;
    },
    deepCount:5,
    firstUrl:"http://www.example.com"
};

var c = new Crawler(opt);
c.crawl();
这是一个简单的node爬虫，index为程序入口

主要的爬虫模块在modules/crawler.js中

具体使用方法可以在index中看到一个例子。

###使用方法说明

先加载crawler模块

`var Crawler = require('./modules/crawler');`

在实例化crawler的时候接受一个object的参数

```
var opt = {
    paresHtml:function(html){
        console.log(html);
    },
    filterUrl:function(url){
    	if( url.indexOf("http") == -1 ) return false;
        return true;
    },
    deepCount:4,
    firstUrl:"http://www.example.com"
};

var c = new Crawler(opt);

c.crawl();
```

调用crawl方法将开始爬取。

paresHtml方法将在爬取玩html后调用  参数html为爬取的字符串格式的网页，

filterUrl方法是过滤url的方法，每次爬取到url都将调用这个方法，返回true的时候就会将该url加入爬取队列，返回false将跳过该url。

firstUrl表示第一个爬取的网页。

deepCount表示爬取url目录的深度，默认为5。

###关于目录深度

事先约定url的path中出现几次‘/’即为几层深度。
例如：“www.example.com/1/2/3”，此时url的path为“/1/2/3”，目录深度为3。

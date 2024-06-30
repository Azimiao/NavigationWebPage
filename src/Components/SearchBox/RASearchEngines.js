import fetchJsonp from 'fetch-jsonp';
import baiduIcon from "./icon/baidu_favicon.ico";
import googleIcon from "./icon/google_favicon.ico";

const RASearchEngines = [
    {
        "name":"Baidu",
        "placeholder":"使用百度搜索",
        "icon": baiduIcon,
        "suggester": function(keyword){
            console.log(baiduIcon);
            const url = `//suggestion.baidu.com/su?wd=${keyword}&cb=window.baidu.sug`;
            return (fetchJsonp(url, { jsonpCallback: "cb"}).then((res) => {
                return res.json();
            }).catch(e => {
                return Promise.reject(e);
            })).then(jsonObj=>{
                return Promise.resolve(jsonObj && jsonObj.s ? jsonObj.s : []);
            }).catch(e=>{
                return Promise.reject(e);
            });
        },
        "searcher":function(keyword){
            return `https://www.baidu.com/s?wd=${keyword}`;
        }
    },
    {
        "name":"Google",
        "icon":googleIcon,
        "placeholder":"使用Google搜索",
        "suggester": function(keyword){
            const url = `//suggestqueries.google.com/complete/search?client=firefox&q=${keyword}&callback=searchHandler`;
            return (fetchJsonp(url, { jsonpCallback: "callback"}).then((res) => {
                return res.json();
            }).catch(e => {
                return Promise.reject(e);
            })).then(jsonObj=>{
                return Promise.resolve(jsonObj && Array.isArray(jsonObj) &&jsonObj.length >= 1 ? jsonObj[1] : []);
            }).catch(e=>{
                return Promise.reject(e);
            });
        },
        "searcher":function(keyword){
            return `https://www.google.com/search?q=${keyword}`;
        }
    },
];

export default RASearchEngines;
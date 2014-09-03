/*
 * Javascript Internationalization (i18n) v1.0
 * easy way to perform i18n to javascript project.
 *
 * Modify: Wed, 15 June 2011 11:36:10 GMT
 * Author: essoduke.org <essoduke@gmail.com>
 * URL:    http://app.essoduke.org/i18n
 *
 * [configure]
 *  i18.set({
 *    lang: 'en-us, zh-tw...', //valid ISO 639-1, ISO 3166-1 language code
 *    path: '', //language file's path; default is empty (same level as i18n js core)
 *  });
 *
 * [Language file]
 *   filename must be the same as language code(ISO 639-1, ISO 3166-1) in JSON format,
 *   example: en-us.js, zh-tw.js, zh-cn.js
 */


var i18n = (function () {
		
    'use strict';

    /*
     * Check the client timezone to adjust DST
     */
    var DST = function () {
        var rightNow = new Date(), temp = '',
            date1 = new Date(rightNow.getFullYear(), 0, 1, 0, 0, 0, 0),
            date2 = new Date(rightNow.getFullYear(), 6, 1, 0, 0, 0, 0),
            date3, date4, hoursDiffStdTime = 0, hoursDiffDaylightTime = 0;
        temp = date1.toGMTString();
        date3 = new Date(temp.substring(0, temp.lastIndexOf(" ") - 1));
        temp = date2.toGMTString();
        date4 = new Date(temp.substring(0, temp.lastIndexOf(" ") - 1));
        hoursDiffStdTime = (date1 - date3) / (1000 * 60 * 60);
        hoursDiffDaylightTime = (date2 - date4) / (1000 * 60 * 60);
        return (hoursDiffDaylightTime !== hoursDiffStdTime) ? true : false;
    };

    var UrlExists = function(url){
        try {
            var http = new XMLHttpRequest();
            http.open('HEAD', url, false);
            http.send();
    
            return http.status != 404;
        }
        catch(e) {
            return false;
        }
    };

    var jsonConcat = function(o1, o2) {

        for (var key in o2) {
            if(typeof(o1[key]) == 'undefined' || key.substring(0, 1) == '_') {
                o1[key] = o2[key];
            }
        }
        return o1;
    };
    
    //language code
    var lang = '';

    // language file's path
    var path = '';
    
    //localize object
    var localize = new Array();

    //default setting
    var setting = { 
        "DST" : -4,
        "format": "D, d F Y H:i:s",
        "AM" : "AM",
        "PM": "PM"
    };
    
    //fetch lauguage string in JSON object
    var locale = function (langcode) {

        var result = {}, xmlhttp;
        var url = (0 !== path.length ? path.replace(/\/$/, '') + '/' : '') + langcode + '.txt';
        
        //jQuery ajax
        if (window.jQuery) {
			if(UrlExists(url)) {
			jQuery.ajax({
                url: url,
                async: false,
                dataType: 'json',
                error: function (xhr, status, error) { result = {}; },
                success: function (resp) { result = resp; }
            });
			}
        }
        //XMLHttpRequest
        else {
            var callback = function () {
                if (xmlhttp.readyState === 4) {
                    if (xmlhttp.status === 200) {
                        try {
                            if ('function' === typeof JSON.parse) {
                                result = JSON.parse(xmlhttp.responseText);
                            }
                        } catch (e) {
                        }
                    }
                }
            };
            if (window.XMLHttpRequest) {
                xmlhttp = new XMLHttpRequest();
                if (xmlhttp.overrideMimeType) {
                    xmlhttp.overrideMimeType('text/xml');
                }
            } else if (window.ActiveXObject) {
                var activexName = ['MSXML2.XMLHTTP', 'Microsoft.XMLHTTP'];
                for (var i = 0; i < activexName.length; i++) {
                    try {
                        xmlhttp = new ActiveXObject(activexName[i]);
                        break;
                    } catch (e) {
                    }
                }
            }
            xmlhttp.onreadystatechange = callback;
            xmlhttp.open('GET', url, false);
            xmlhttp.send(null);
        }

        return result;
    };
    
    /*
     * datetime format
     */
    Date.prototype.format=function(format){var returnStr='',replace=Date.replaceChars,curChar='';replace.reload();for(var i=0;i<format.length;i++){curChar=format.charAt(i);returnStr+=(replace[curChar]?replace[curChar].call(this):curChar)}return returnStr};

    /*
     * datetime function object
     * Source: http://jacwright.com/projects/javascript/date_format (unavailable)
     * http://code.google.com/p/omeglelogger/source/browse/trunk/dateformat.js?spec=svn2&r=2
     */
    Date.replaceChars={reload:function(){Date.replaceChars.shortMonths=localize.hasOwnProperty('shortMonths')?localize.shortMonths:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];Date.replaceChars.longMonths=localize.hasOwnProperty('longMonths')?localize.longMonths:['January','February','March','April','May','June','July','August','September','October','November','December'];Date.replaceChars.shortDays=localize.hasOwnProperty('shortDays')?localize.shortDays:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];Date.replaceChars.longDays=localize.hasOwnProperty('longDays')?localize.longDays:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']},shortMonths:[],longMonths:[],shortDays:[],longDays:[],d:function(){return(this.getUTCDate()<10?'0':'')+this.getUTCDate()},D:function(){return Date.replaceChars.shortDays[this.getUTCDay()]},j:function(){return this.getUTCDate()},l:function(){return Date.replaceChars.longDays[this.getUTCDay()]},N:function(){return this.getDay()+1},S:function(){return(this.getUTCDate()%10===1&&this.getUTCDate()!==11?'st':(this.getUTCDate()%10===2&&this.getUTCDate()!==12?'nd':(this.getUTCDate()%10==3&&this.getUTCDate()!=13?'rd':'th')))},w:function(){return this.getUTCDay()},z:function(){return''},W:function(){return''},F:function(){return Date.replaceChars.longMonths[this.getUTCMonth()]},m:function(){return(this.getUTCMonth()<9?'0':'')+(this.getUTCMonth()+1)},M:function(){return Date.replaceChars.shortMonths[this.getUTCMonth()]},n:function(){return this.getUTCMonth()+1},t:function(){return''},L:function(){return''},o:function(){return''},Y:function(){return this.getUTCFullYear()},y:function(){return(''+this.getUTCFullYear()).substr(2)},a:function(){var set=localize.hasOwnProperty('setting')?localize.setting:setting;return this.getUTCHours()<12?set.AM:set.PM},A:function(){var set=localize.hasOwnProperty('setting')?localize.setting:setting;return this.getUTCHours()<12?set.AM:set.PM},B:function(){return''},g:function(){return this.getUTCHours()%12||12},G:function(){return this.getUTCHours()},h:function(){return((this.getUTCHours()%12||12)<10?'0':'')+(this.getUTCHours()%12||12)},H:function(){return(this.getUTCHours()<10?'0':'')+this.getUTCHours()},i:function(){return(this.getUTCMinutes()<10?'0':'')+this.getUTCMinutes()},s:function(){return(this.getUTCSeconds()<10?'0':'')+this.getUTCSeconds()},e:function(){return''},I:function(){return''},O:function(){return(-this.getTimezoneOffset()<0?'-':'+')+(Math.abs(this.getTimezoneOffset()/60)<10?'0':'')+(Math.abs(this.getTimezoneOffset()/60))+'00'},T:function(){var m=this.getUTCMonth();this.setMonth(0);var result=this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/,'$1');this.setMonth(m);return result},Z:function(){return-this.getTimezoneOffset()*60},c:function(){return''},r:function(){return this.toString()},U:function(){return this.getUTCTime()/1000}};

    /*
     * Similar the ASP Dateadd function
     */
    var DateAdd=function(interval,number,date){var d;number=parseInt(number,10);if('string'===typeof date){date=date.split(/\D/);--date[1];d=new Date(date.join(','))}d=('object'===typeof d)?d:date;switch(interval){case'y':d.setFullYear(d.getFullYear()+number);break;case'm':d.setMonth(d.getMonth()+number);break;case'd':d.setDate(d.getDate()+number);break;case'w':d.setDate(d.getDate()+7*number);break;case'h':d.setHours(d.getHours()+number);break;case'n':d.setMinutes(d.getMinutes()+number);break;case's':d.setSeconds(d.getSeconds()+number);break;case'l':d.setMilliseconds(d.getMilliseconds()+number);break}return d};

    /*
     * public functions
     */
    return {

        /*
         * i18n setting
         */
        set: function (options) {
            var reload = (lang != options.lang);

            if (null !== options && 'object' === typeof options) {
                lang = options.hasOwnProperty('lang') ? options.lang : null;
                path = options.hasOwnProperty('path') ? options.path : path;
            }

            if(reload) {
                localize = locale(lang || (navigator.browserLanguage || navigator.language).toLowerCase());
            }
            else {
                localize = jsonConcat(localize, locale(lang || (navigator.browserLanguage || navigator.language).toLowerCase()));
                // localize = jsonConcat(localize, locale(lang || (navigator.browserLanguage || navigator.language)));
            }
        },
        
        /*
         * Core of the datetime replace
         */
        datetime: function (d) {
            var set = localize.hasOwnProperty('setting') ? localize.setting : setting;
            var r = set.format ? DateAdd('h', set.DST, d ? new Date(d) : new Date()) : (d ? new Date(d) : new Date());
            
            return r.format(set.format);
        },

		//20121210 shine add 增加個檢查方法,檢查在language裡是否有對應的項目
        hasMapping:function(string){
        	if(typeof string == 'undefined') {
				string = '';
			}
            string = string.toString() || '';
            if(localize.hasOwnProperty(string))
            	return true;
            else
            	return false;        	
        },
		
        /*
         * Core of the strings replace
         */
        _: function (string) {
            try {
				if(string == null || typeof string == 'undefined') {
					string = '';
				}
                string = string.toString() || '';
                var args = arguments;
                var pattern = (args.length > 0) ? new RegExp('%([1-' + args.length.toString() + '])', 'g') : null;
                var str = localize.hasOwnProperty(string) ? localize[string] : string;
//                return String(str).replace(pattern, function (match, index) { return args[index]; });

                //20120528 shine add 增加參數定義在本身字串中時的處理
                var convStr = String(str).replace(pattern, function (match, index) { return args[index]; });;
                
                //拆出<|  |>裡的內容
                var pos0=0;
                var pos1=-1;
                var pos2=-1;
                args=[];
                var step =0;   
                var tokenIdx=1;
                str = convStr;
                var newStr = convStr;
                
                if( str.indexOf("<|") != -1){
	                while(step != -1){
	                		pos1 = str.indexOf("<|");
	                		if(pos1 != -1){
	                			pos2 = str.indexOf("|>", pos1);
	                			if(pos2 != -1){
	                				args[tokenIdx] = str.substring(pos1 + 2 , pos2);
	                				newStr = newStr.replace(args[tokenIdx],"%" + tokenIdx);
	//                				pos0 = pos2+2;
	                				str = str.substring(pos2+2);
	                				tokenIdx = tokenIdx + 1;
	                				step = 0;
	                			}
	                		}else{
	                			step = -1;
	                		}
	                	}
	                newStr = newStr.replace(/<\|/g,"").replace(/\|>/g,"");
					newStr = newStr.replace(/\n/g,"").replace(/\r/g,"");  //20120828 shine mod 拿掉換行符號後再去作比對,避免字串中有換行而造成比對不到
	                str = localize.hasOwnProperty(newStr) ? localize[newStr] : newStr;
	                
	                pattern = (args.length > 0) ? new RegExp('%([1-' + args.length.toString() + '])', 'g') : null;
	                convStr = String(str).replace(pattern, function (match, index) { return args[index]; });
                }
                
                return convStr;
            } catch (e) {
            	console.log("i18n Error: " + string);
            }
        }
    };
}());

/** Edit by Luphia 2012/02/13 */

/**
 * Check Is Array
 * @author Luphia
 * @version 1.0 2012/02/13
 * @param input Array or Not Array
 * @return Boolean
 */
 /*
function isArray(input) 
{
	return typeof(input) == 'object' && (input instanceof Array);
}
*/

/**
 * Concat Two Array 
 * If the key is exist in o1, it will not be copied.
 * But if the key is begin with '_', it will.
 * @author Luphia
 * @version 1.0 2012/02/13
 * @param o1 Array
 * @param o2 Array
 * @return Array
 */
/*
function jsonConcat(o1, o2) 
{

	for (var key in o2) {
alert(key.substring(0, 1) + ':' + '_');
		if(typeof(o1[key]) == 'undefined' || key.substring(0, 1) == '_') {
			o1[key] = o2[key];
		}
	}
	return o1;
}
*/
(function(a){a.fn.selectRange=function(c,b){return this.each(function(){if(this.setSelectionRange){this.focus();this.setSelectionRange(c,b)}else{if(this.createTextRange){var d=this.createTextRange();d.collapse(true);d.moveEnd("character",b);d.moveStart("character",c);d.select()}}})}})(jQuery);var gLang;var gHandle=0;var gBagdes={};var gGrades={};var gClipboard={flag:false,title:"",prefix:"",suffix:""};var gResult={time:0,words:0,right:0,wrong:0,rate:0,speed:0,highSpeed:0};var startTime=0,endTime=0;var timer=0;var counter=0;var inputCounter=0;var doc=[];var DOCS={CH:[],EN:[],CHEN:[]};$(function(){typeeasy()});function typeeasy(){init()}function init(){var e=$("#btnChinese");var a=$("#btnEnglish");var f=$("#btnChineseEnglish");e.click(function(){practice("chinese")});a.click(function(){practice("english")});f.click(function(){practice("chinese_english")});var g=$("#btnBack").hide();var d=$("#btnSubmit").hide();var b=$("#btnRestart").hide();g.click(function(){start()});d.click(function(){submit()});b.click(function(){start()});var c="docs.xml?"+new Date().getTime();$.get(c,function(i){var j=$(i);j.find("badge").each(function(){var m=$(this);var n=m.attr("id");var k=m.attr("name");var l=m.attr("icon");gBagdes[n]={name:k,icon:l}});j.find("grade").each(function(){var n=$(this);var o=n.attr("lang");var m=n.attr("speed1");var l=n.attr("speed2");var k=n.attr("speed3");gGrades[o]={speed1:m,speed2:l,speed3:k}});var h=j.find("clipboard");gClipboard.title=h.attr("title");gClipboard.prefix=h.attr("prefix");gClipboard.suffix=h.attr("suffix");j.find("CH").each(function(m){var n=$(this);var l=$.trim(n.attr("line1"));var k=$.trim(n.attr("line2"));var o=$.trim(n.attr("line3"));DOCS.CH.push([l,k,o])});j.find("EN").each(function(m){var n=$(this);var l=$.trim(n.attr("line1"));var k=$.trim(n.attr("line2"));var o=$.trim(n.attr("line3"));DOCS.EN.push([l,k,o])});j.find("CHEN").each(function(m){var n=$(this);var l=$.trim(n.attr("line1"));var k=$.trim(n.attr("line2"));var o=$.trim(n.attr("line3"));DOCS.CHEN.push([l,k,o])})})}function start(){timerStop();var d=$("#btnBack").hide();var b=$("#btnSubmit").hide();var a=$("#btnRestart").hide();var e=$("#start");var c=$("#practice");e.show();c.hide()}function practice(k){gHandle=0;gResult={time:0,words:0,right:0,wrong:0,rate:0,speed:0,highSpeed:0};timer=0;counter=0;inputCounter=0;startTime=0;endTime=0;var i=$("#btnBack");var l=$("#btnSubmit");var n=$("#btnRestart");var e=Math.random();var j=0;doc=[];switch(k){case"chinese":gLang=0;j=Math.round(e*DOCS.CH.length);doc=DOCS.CH[j];break;case"english":gLang=1;j=Math.round(e*DOCS.EN.length);doc=DOCS.EN[j];break;case"chinese_english":gLang=2;j=Math.round(e*DOCS.CHEN.length);doc=DOCS.CHEN[j];break;default:break}var d=doc[0].length;var c=doc[1].length;var b=doc[2].length;var f=d+c+b;var p=$("#line1, #line2, #line3");p.eq(0).html(doc[0]);p.eq(1).html(doc[1]);p.eq(2).html(doc[2]);var m=$("#text1, #text2, #text3");m.val("");m.unbind("keydown").bind("keydown",function(q){counter++;getResult()});m.unbind("textchange").bind("textchange",function(q,t){var w=$(this);var x=w.val();if(x.length>t.length){inputCounter=inputCounter+Math.abs(x.length-t.length)}var v=parseInt(w.attr("id").slice(-1));var y=check(doc[v-1],x);p.eq(v-1).html(y);var r=doc[v-1].length;if(x.length>=r){w.val(x.slice(0,r));if(v!=3){var s=m.eq(v);s.val(s.val()+x.slice(r));s.selectRange(s.val().length,s.val().length)}}if(getTextCount()>=f){i.hide();l.css("display","inline-block");n.hide();var u=getExamWordsRightWrongCount();if(u.words==u.right){l.click()}}getResult()});m.one("keydown",function(){timerStart()});getResult();var a=$("#start");var g=$("#practice");var o=$("#panelExam");var h=$("#panelFinish");a.hide();g.show();o.show();h.hide();i.css("display","inline-block");l.hide();n.hide();m.eq(0).focus()}function submit(){timerStop();var i=$("#panelExam");var c=$("#panelFinish");i.hide();c.show();var e=$("#btnBack");var g=$("#btnSubmit");var h=$("#btnRestart");e.hide();g.hide();h.css("display","inline-block");var f=getRightRate();gResult.rate=f;var b=getResultSpeed();gResult.speed=b;var d=getExamWordsRightWrongCount();gResult.words=inputCounter;gResult.right=d.right;gResult.wrong=gResult.words-d.right;c.find(".result").html(getExamResult());c.find(".clipboardText").text(getClipboardResult());$("#iconSina").attr("href",getWeiboUrl("sina"));$("#iconTencent").attr("href",getWeiboUrl("tencent"));if(!gClipboard.flag){var a=$("#btnClipboard");a.zclip({path:"js/ZeroClipboard.swf",copy:function(){var j=$(".clipboardText").val();var k=gClipboard.title+"\r\n"+gClipboard.prefix+"\r\n"+j.replace(/\n/g,"\r\n")+"\r\n"+gClipboard.suffix;return k}});gClipboard.flag=true}}function timerStart(){if(gHandle!=0){return}startTime=new Date().getTime();timer=1;getResult();gHandle=setInterval(function(){timer++;getResult()},1000)}function timerStop(){clearInterval(gHandle)}function resize(){var b=$(document).width();var a=$(document).height();window.resizeBy(540-b,335-a)}function getResult(){var h=getTime(timer);var f=getKPMSpeed();var e=getRightRate();var d=$("#panelResult .time");var c=$("#panelResult .speed");var a=$("#panelResult .rate");d.html(h);c.html(f+" kpm");a.html(e+"%");var g=getResultSpeed();var b=gResult.highSpeed;if(g>b){b=g}gResult.time=timer;gResult.speed=g;gResult.highSpeed=b}function getTime(){var a=timer%60;var c=parseInt(timer/60);if(a<10){a="0"+a}if(c<10){c="0"+c}var b=c+":"+a;return b}function getChineseTime(f){var b=f%60;var e=parseInt(f/60);var d="";var a="";if(e>0){d=e+"\u5206"}if(b!=0){a=b+"\u79d2"}if(f==0){a="0\u79d2"}var c=d+a;return c}function getKPMSpeed(){var a=new Date().getTime();var c=0;var b=a-startTime;if(b>300){c=parseInt(counter*1000*60/b)}return c}function getWPMSpeed(){var a=new Date().getTime();var c=0;var b=a-startTime;if(b>300){c=parseInt(inputCounter*1000*60/b)}return c}function getTextCount(){var c=0;var b=$("#text1, #text2, #text3");for(var a=0;a!=3;a++){var d=b.eq(a).val();c+=d.length}return c}function getResultSpeed(){var a=getRightRate();var c=0;if(a>=25){var b=getTextCount();c=Math.floor(Math.floor(b/timer*60*a/100).toFixed(1))}return c}function getRightRate(){var b=0;var c=getExamWordsRightWrongCount();var d=c.words;var e=c.right;var a=c.wrong;if(inputCounter!=0){b=parseInt(e*100/inputCounter)}if(isNaN(b)){}return b}function getExamWordsRightWrongCount(){var b=0;var a=0;var j=0;var g=$("#text1, #text2, #text3");for(var c=0;c!=3;c++){var f=doc[c];var d=g.eq(c).val();b+=d.length;var e=getRightWrongCount(f,d);a+=e.right;j+=e.wrong}var h={words:b,right:a,wrong:j};return h}function getRightWrongCount(f,e){var b=0;var j=0;var c=Math.min(f.length,e.length);for(var d=0;d!=c;d++){var g=f.slice(d,d+1);var a=e.slice(d,d+1);if(g==a){b++}else{j++}}var h={right:b,wrong:j};return h}function getWeiboUrl(g){var e={url:"http://v.t.sina.com.cn/share/share.php?",face:"[\u6293\u72c2]"};var b={url:"http://v.t.qq.com/share/share.php?",face:"/\u6293\u72c2"};var a,f;if(g=="sina"){a=e.url;f=e.face}else{a=b.url;f=b.face}var j;if(gLang==0){j="\u4e2d\u6587\u8f93\u5165"}else{if(gLang==1){j="\u82f1\u6587\u8f93\u5165"}else{j="\u4e2d\u82f1\u6df7\u8f93"}}var c=getResultSpeed();var i=getBadge(c,gLang);var k="\u521a\u521a\u7528#\u6253\u5b57\u901a2011#\u5728\u7ebf\u6d4b\u8bd5\u4e86\u6253\u5b57\u901f\u5ea6\uff0c\u6211\u7684"+j+"\u6210\u7ee9\u662f\u6bcf\u5206\u949f"+c+"\u4e2a\u5b57\uff0c\u5f97\u5230\u4e86\u6253\u5b57\u901a\u5fbd\u7ae0\u3010"+i.name+"\u3011\uff0c\u6c42\u8d85\u8d8a\uff01"+f+" \u6709\u6728\u6709\uff01\uff1f\u6709\u6728\u6709\uff1f\uff01"+f+" http://www.51dzt.com/test.html";var d={title:k,pic:i.icon};var h=$.param(d);return a+h}function getBadge(e,g){var c;var f=gGrades[g];var d=f.speed1;var b=f.speed2;var a=f.speed3;if(e<d){c=gBagdes[0]}else{if(e<b){c=gBagdes[1]}else{if(e<a){c=gBagdes[2]}else{c=gBagdes[3]}}}return c}function check(c,g){var a="";var e=Math.min(c.length,g.length);for(var d=0;d!=e;d++){var b=c.slice(d,d+1);var f=g.slice(d,d+1);if(b==f){a=a+'<font color="#808080">'+b+"</font>"}else{a=a+'<font color="#ff8080">'+b+"</font>"}}a=a+c.slice(e);return a}function getExamResult(){var c,b,a;if(gLang==0){c="\u4e2d\u6587\u6253\u5b57"}else{if(gLang==1){c="\u82f1\u6587\u6253\u5b57"}else{c="\u4e2d\u82f1\u6df7\u8f93"}}var d=getResultSpeed();if(d==0){a="\u6b63\u786e\u7387\u6709\u5f85\u63d0\u9ad8\u54e6\uff0c\u8d76\u5feb\u7ec3\u4e60\uff01"}else{if(d<50){a="\u4e0d\u7ed9\u529b\u5440\uff0c\u52a0\u628a\u52b2\uff01\uff01"}else{if(d<100){a="\u592a\u68d2\u4e86\uff0c\u7ee7\u7eed\u52a0\u6cb9\u54df\uff01\uff01\uff01"}else{if(d<150){a="\u5076\u6ef4\u795e\u554a\uff0c\u5d07\u62dc\uff01\uff01\uff01\uff01"}else{a="\u4f20\u8bf4\u7684\u6253\u5b57\u9ad8\u624b\u5c31\u662f\u4f60\u5440\uff01\uff01\uff01\uff01\uff01"}}}}b="\u60a8\u6700\u7ec8\u7684"+c+"\u6210\u7ee9\u662f\uff1a\u6bcf\u5206\u949f"+d+"\u4e2a\u5b57\u3002";return b+"<br>"+a}function getClipboardResult(){var f=gResult.time;var h=gResult.words;var c=gResult.right;var a=gResult.wrong;var d=gResult.rate;var e=gResult.speed;var b=gResult.highSpeed;var g="\u6d4b\u8bd5\u65f6\u95f4\uff1a"+getChineseTime(f)+"\r\u4e00\u5171\u6253\u4e86\uff1a"+h+"\u4e2a\u5b57\r\u6253\u5bf9\u4e86\uff1a"+c+"\u4e2a\u5b57\r\u6253\u9519\u4e86\uff1a"+a+"\u4e2a\u5b57\r\u6b63\u786e\u7387\uff1a"+d+"%\r\u901f\u5ea6\uff1a"+e+"\u5b57/\u5206\u949f\r\u6253\u5b57\u901f\u5ea6\u5cf0\u503c\uff1a"+b+"\u5b57/\u5206\u949f";return g};
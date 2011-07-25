(function($){
    $.fn.selectRange = function(start, end){
        return this.each(function(){
            if (this.setSelectionRange) {
                this.focus();
                this.setSelectionRange(start, end);
            } else if (this.createTextRange) {
                var range = this.createTextRange();
                range.collapse(true);
                range.moveEnd('character', end);
                range.moveStart('character', start);
                range.select();
            }
        });
    };
})(jQuery);

var gLang;
var gHandle = 0;
var gBagdes = {};
var gGrades = {};
var gClipboard = {
    flag: false,
    title: '',
    prefix: '',
    suffix: ''
}
var gResult = {
    time: 0,
    words: 0,
    right: 0,
    wrong: 0,
    rate: 0,
    speed: 0,
    highSpeed: 0
};
var startTime = 0, endTime = 0;
var timer = 0;
var counter = 0;
var inputCounter = 0; //总输入的字数
var doc = [];
var DOCS = {
    CH: [],
    EN: [],
    CHEN: []
};

$(function(){
    typeeasy();
});

function typeeasy(){
    init();
}

function init(){
    var $btnChinese = $('#btnChinese');
    var $btnEnglish = $('#btnEnglish');
    var $btnChineseEnglish = $('#btnChineseEnglish');
    
    $btnChinese.click(function(){
        practice('chinese');
    });
    
    $btnEnglish.click(function(){
        practice('english');
    });
    
    $btnChineseEnglish.click(function(){
        practice('chinese_english');
    });
    
    var $btnBack = $('#btnBack').hide();
    var $btnSubmit = $('#btnSubmit').hide();
    var $btnRestart = $('#btnRestart').hide();
    $btnBack.click(function(){
        start();
    });
    $btnSubmit.click(function(){
        submit();
    });
    $btnRestart.click(function(){
        start();
    });
    
    var url = 'docs.xml?' + new Date().getTime();
    $.get(url, function(xml){
        var $xml = $(xml);
        $xml.find('badge').each(function(){
            var $badge = $(this);
            var id = $badge.attr('id');
            var name = $badge.attr('name');
            var icon = $badge.attr('icon');
            gBagdes[id] = {
                name: name,
                icon: icon
            }
        });
        
        $xml.find('grade').each(function(){
            var $grade = $(this);
            var lang = $grade.attr('lang');
            var speed1 = $grade.attr('speed1');
            var speed2 = $grade.attr('speed2');
            var speed3 = $grade.attr('speed3');
            gGrades[lang] = {
                speed1: speed1,
                speed2: speed2,
                speed3: speed3
            }
        });
        
        var $clipboard = $xml.find('clipboard');
        gClipboard.title = $clipboard.attr('title');
        gClipboard.prefix = $clipboard.attr('prefix');
        gClipboard.suffix = $clipboard.attr('suffix');
        
        $xml.find('CH').each(function(i){
            var $line = $(this);
            var line1 = $.trim($line.attr('line1'));
            var line2 = $.trim($line.attr('line2'));
            var line3 = $.trim($line.attr('line3'));
            DOCS.CH.push([line1, line2, line3]);
        });
        $xml.find('EN').each(function(i){
            var $line = $(this);
            var line1 = $.trim($line.attr('line1'));
            var line2 = $.trim($line.attr('line2'));
            var line3 = $.trim($line.attr('line3'));
            DOCS.EN.push([line1, line2, line3]);
        });
        $xml.find('CHEN').each(function(i){
            var $line = $(this);
            var line1 = $.trim($line.attr('line1'));
            var line2 = $.trim($line.attr('line2'));
            var line3 = $.trim($line.attr('line3'));
            DOCS.CHEN.push([line1, line2, line3]);
        });
    });
}

function start(){
    timerStop();
    
    var $btnBack = $('#btnBack').hide();
    var $btnSubmit = $('#btnSubmit').hide();
    var $btnRestart = $('#btnRestart').hide();
    
    var $start = $('#start');
    var $practice = $('#practice');
    $start.show();
    $practice.hide();
}

function practice(subject){
    gHandle = 0;
    gResult = {
        time: 0,
        words: 0,
        right: 0,
        wrong: 0,
        rate: 0,
        speed: 0,
        highSpeed: 0
    };
    timer = 0;
    counter = 0;
    inputCounter = 0;
    startTime = 0;
    endTime = 0;
    
    var $btnBack = $('#btnBack');
    var $btnSubmit = $('#btnSubmit');
    var $btnRestart = $('#btnRestart');
    
    var random = Math.random();
    var index = 0;
    doc = [];
    switch (subject) {
        case 'chinese':
            gLang = 0;
            index = Math.round(random * DOCS.CH.length);
            doc = DOCS.CH[index];
            break;
        case 'english':
            gLang = 1;
            index = Math.round(random * DOCS.EN.length);
            doc = DOCS.EN[index];
            break;
        case 'chinese_english':
            gLang = 2;
            index = Math.round(random * DOCS.CHEN.length);
            doc = DOCS.CHEN[index];
            break;
        default:
            break;
    }
    var length1 = doc[0].length;
    var length2 = doc[1].length;
    var length3 = doc[2].length;
    var docLength = length1 + length2 + length3;
    
    var $line = $('#line1, #line2, #line3');
    $line.eq(0).html(doc[0]);
    $line.eq(1).html(doc[1]);
    $line.eq(2).html(doc[2]);
    
    var $text = $('#text1, #text2, #text3');
    $text.val('');
    
    $text.unbind('keydown').bind('keydown', function(event){
        counter++;
        getResult();
    });
    
    $text.unbind('textchange').bind('textchange', function(event, previousText){
        var $self = $(this);
        var text = $self.val();
        if (text.length > previousText.length) {
            inputCounter = inputCounter + Math.abs(text.length - previousText.length);
        }
        var index = parseInt($self.attr('id').slice(-1));
        var result = check(doc[index - 1], text);
        $line.eq(index - 1).html(result);
        var length = doc[index - 1].length;
        if (text.length >= length) {
            $self.val(text.slice(0, length));
            if (index != 3) {
                var $next = $text.eq(index);
                $next.val($next.val() + text.slice(length));
                $next.selectRange($next.val().length, $next.val().length);
            }
        }
        if (getTextCount() >= docLength) {
            $btnBack.hide();
            $btnSubmit.css('display', 'inline-block');
            $btnRestart.hide();
            
            var examCount = getExamWordsRightWrongCount();
            if (examCount.words == examCount.right) {
                $btnSubmit.click();
            }
        }
        getResult();
    });
    
    $text.one('keydown', function(){
        timerStart();
    });
    
    getResult();
    
    var $start = $('#start');
    var $practice = $('#practice');
    var $panelExam = $('#panelExam');
    var $panelFinish = $('#panelFinish');
    
    $start.hide();
    $practice.show();
    $panelExam.show();
    $panelFinish.hide();
    
    $btnBack.css('display', 'inline-block');
    $btnSubmit.hide();
    $btnRestart.hide();
    
    $text.eq(0).focus();
}

function submit(){
    timerStop();
    
    var $panelExam = $('#panelExam');
    var $panelFinish = $('#panelFinish');
    $panelExam.hide();
    $panelFinish.show();
    
    var $btnBack = $('#btnBack');
    var $btnSubmit = $('#btnSubmit');
    var $btnRestart = $('#btnRestart');
    
    $btnBack.hide();
    $btnSubmit.hide();
    $btnRestart.css('display', 'inline-block');
    
    var rate = getRightRate();
    gResult.rate = rate;
    var speed = getResultSpeed();
    gResult.speed = speed;
    var examCount = getExamWordsRightWrongCount();
    gResult.words = inputCounter;
    gResult.right = examCount.right;
    gResult.wrong = gResult.words - examCount.right;
    
    $panelFinish.find('.result').html(getExamResult());
    $panelFinish.find('.clipboardText').text(getClipboardResult());
    
    $('#iconSina').attr('href', getWeiboUrl('sina'));
    $('#iconTencent').attr('href', getWeiboUrl('tencent'));
    
    if (!gClipboard.flag) {
        var $btnClipboard = $('#btnClipboard')
        $btnClipboard.zclip({
            path: 'js/ZeroClipboard.swf',
            copy: function(){
                var result = $('.clipboardText').val();
                var text = gClipboard.title + '\r\n' + gClipboard.prefix + '\r\n' + result.replace(/\n/g, '\r\n') + '\r\n' + gClipboard.suffix;
                return text;
            }
        });
        gClipboard.flag = true;
    }
}

function timerStart(){
    if (gHandle != 0) {
        return;
    }
    startTime = new Date().getTime();
    timer = 1;
    getResult();
    
    gHandle = setInterval(function(){
        timer++;
        getResult();
    }, 1000);
}

function timerStop(){
    clearInterval(gHandle);
}

function resize(){
    var width = $(document).width();
    var height = $(document).height();
    window.resizeBy(540 - width, 335 - height)
}

function getResult(){
    var time = getTime(timer);
    var kpmSpeed = getKPMSpeed();
    var rate = getRightRate();
    var $time = $('#panelResult .time');
    var $speed = $('#panelResult .speed');
    var $rate = $('#panelResult .rate');
    
    $time.html(time);
    $speed.html(kpmSpeed + ' kpm');
    $rate.html(rate + '%');
    
    var speed = getResultSpeed();
    var highSpeed = gResult.highSpeed;
    if (speed > highSpeed) {
        highSpeed = speed;
    }
    
    gResult.time = timer;
    gResult.speed = speed;
    gResult.highSpeed = highSpeed;
}

function getTime(){
    var second = timer % 60;
    var minute = parseInt(timer / 60);
    if (second < 10) {
        second = '0' + second;
    }
    if (minute < 10) {
        minute = '0' + minute;
    }
    var time = minute + ':' + second;
    return time;
}

function getChineseTime(timer){
    var second = timer % 60;
    var minute = parseInt(timer / 60);
    var strMinute = '';
    var strSecond = '';
    if (minute > 0) {
        strMinute = minute + '分';
    }
    if (second != 0) {
        strSecond = second + '秒';
    }
    if (timer == 0) {
        strSecond = '0秒';
    }
    var time = strMinute + strSecond;
    return time;
}

//不考虑正确率，每分钟多少次击键
function getKPMSpeed(){
    var currentTime = new Date().getTime();
    var speed = 0;
    var timeSpan = currentTime - startTime
    if (timeSpan > 300) {
        speed = parseInt(counter * 1000 * 60 / timeSpan);
    }
    return speed;
}

//不考虑正确率，每分钟多少字
function getWPMSpeed(){
    var currentTime = new Date().getTime();
    var speed = 0;
    var timeSpan = currentTime - startTime
    if (timeSpan > 300) {
        speed = parseInt(inputCounter * 1000 * 60 / timeSpan);
    }
    return speed;
}

function getTextCount(){
    var count = 0;
    var $text = $('#text1, #text2, #text3');
    for (var i = 0; i != 3; i++) {
        var text = $text.eq(i).val();
        count += text.length;
    }
    return count;
}

//考虑正确率，计算打字速率，如果正确率小于25%，则速度为0
function getResultSpeed(){
    var rate = getRightRate();
    var speed = 0;
    if (rate >= 25) {
        var wordsCount = getTextCount();
        speed = Math.floor(Math.floor(wordsCount / timer * 60 * rate / 100).toFixed(1));
    }
    return speed;
}

function getRightRate(){
    var rate = 0;
    var count = getExamWordsRightWrongCount();
    var wordsCount = count.words;
    var rightCount = count.right;
    var wrongCount = count.wrong;
    if (inputCounter != 0) {
        rate = parseInt(rightCount * 100 / inputCounter);
    }
    if (isNaN(rate)) {
        //console.log('error');
    }
    return rate;
}

//获取全文输入的，正确的，错误的字数
function getExamWordsRightWrongCount(){
    var wordsCount = 0;
    var rightCount = 0;
    var wrongCount = 0;
    
    var $text = $('#text1, #text2, #text3');
    for (var i = 0; i != 3; i++) {
        var strExample = doc[i];
        var strText = $text.eq(i).val();
        wordsCount += strText.length;
        var count = getRightWrongCount(strExample, strText);
        rightCount += count.right;
        wrongCount += count.wrong;
    }
    var result = {
        words: wordsCount,
        right: rightCount,
        wrong: wrongCount
    }
    return result;
}

function getRightWrongCount(strExample, strText){
    var rightCount = 0;
    var wrongCount = 0;
    var length = Math.min(strExample.length, strText.length);
    for (var i = 0; i != length; i++) {
        var exampleChar = strExample.slice(i, i + 1);
        var textChar = strText.slice(i, i + 1);
        if (exampleChar == textChar) {
            rightCount++;
        } else {
            wrongCount++;
        }
    }
    var result = {
        right: rightCount,
        wrong: wrongCount
    }
    return result;
}

function getWeiboUrl(company){
    var sina = {
        url: 'http://v.t.sina.com.cn/share/share.php?',
        face: '[抓狂]'
    };
    var tencent = {
        url: 'http://v.t.qq.com/share/share.php?',
        face: '/抓狂'
    };
    
    var url, face;
    if (company == 'sina') {
        url = sina.url;
        face = sina.face;
    } else {
        url = tencent.url;
        face = tencent.face;
    }
    
    var strLang;
    if (gLang == 0) {
        strLang = "中文输入";
    } else if (gLang == 1) {
        strLang = "英文输入";
    } else {
        strLang = "中英混输";
    }
    
    var speed = getResultSpeed();
    var badge = getBadge(speed, gLang);
    var title = '刚刚用#打字通2011#在线测试了打字速度，我的' + strLang + '成绩是每分钟' + speed + '个字，得到了打字通徽章【' + badge.name + '】，求超越！' + face + ' 有木有！？有木有？！' + face + ' http://www.51dzt.com/test.html';
    var params = {
        title: title,
        pic: badge.icon
    };
    var str = $.param(params);
    return url + str;
}

function getBadge(speed, lang){
    var badge;
    var grade = gGrades[lang];
    var speed1 = grade.speed1;
    var speed2 = grade.speed2;
    var speed3 = grade.speed3;
    
    if (speed < speed1) {
        badge = gBagdes[0];
    } else if (speed < speed2) {
        badge = gBagdes[1];
    } else if (speed < speed3) {
        badge = gBagdes[2];
    } else {
        badge = gBagdes[3];
    }
    return badge;
}

function check(example, text){
    var result = '';
    var length = Math.min(example.length, text.length);
    for (var i = 0; i != length; i++) {
        var exampleChar = example.slice(i, i + 1);
        var textChar = text.slice(i, i + 1);
        if (exampleChar == textChar) {
            result = result + '<font color="#808080">' + exampleChar + '</font>';
        } else {
            result = result + '<font color="#ff8080">' + exampleChar + '</font>';
        }
    }
    result = result + example.slice(length);
    return result;
}

function getExamResult(){
    var strLang, strTitle, strResult;
    if (gLang == 0) {
        strLang = "中文打字";
    } else if (gLang == 1) {
        strLang = "英文打字";
    } else {
        strLang = "中英混输";
    }
    
    var speed = getResultSpeed();
    if (speed == 0) {
        strResult = "正确率有待提高哦，赶快练习！";
    } else if (speed < 50) {
        strResult = "不给力呀，加把劲！！";
    } else if (speed < 100) {
        strResult = "太棒了，继续加油哟！！！";
    } else if (speed < 150) {
        strResult = "偶滴神啊，崇拜！！！！";
    } else {
        strResult = "传说的打字高手就是你呀！！！！！";
    }
    
    strTitle = "您最终的" + strLang + "成绩是：每分钟" + speed + "个字。";
    
    return strTitle + '<br>' + strResult;
}

function getClipboardResult(){
    var time = gResult.time;
    var words = gResult.words;
    var right = gResult.right;
    var wrong = gResult.wrong;
    var rate = gResult.rate;
    var speed = gResult.speed;
    var highSpeed = gResult.highSpeed;
    var text = '测试时间：' + getChineseTime(time) + '\r一共打了：' + words + '个字\r打对了：' + right + '个字\r打错了：' + wrong + '个字\r正确率：' + rate + '%\r速度：' + speed + '字/分钟\r打字速度峰值：' + highSpeed + '字/分钟';
    return text;
}


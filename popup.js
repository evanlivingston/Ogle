

console.log('popup.js');

$("HTML").mousemove(function(e) {
    $("#tip").css({
        "top" : e.pageY - 10,
        "left" : e.pageX + 25
    });
});

function msToStr (milliseconds) {
    // TIP: to find current time in milliseconds, use:
    // var  current_time_milliseconds = new Date().getTime();

    // This function does not deal with leap years, however,
    // it should not be an issue because the output is aproximated.

    function numberEnding (number) { //todo: replace with a wiser code
        return (number > 1) ? 's' : '';
    }

    var temp = milliseconds / 1000;
    var years = Math.floor(temp / 31536000);
    if (years) {
        return years + ' year' + numberEnding(years);
    }
    var days = Math.floor((temp % 31536000) / 86400);
    if (days) {
        return days + ' day' + numberEnding(days);
    }
    var hours = Math.floor((temp % 86400) / 3600);
    if (hours) {
        return hours + ' hour' + numberEnding(hours);
    }
    var minutes = Math.floor((temp % 3600) / 60);
    if (minutes) {
        return minutes + ' minute' + numberEnding(minutes);
    }
    var seconds = temp % 60;
    if (seconds) {
        return seconds + ' second' + numberEnding(seconds);
    }
    return 'less then a second'; //'just now' //or other string you like;
}

function update_tip(image) {
    html = image.src + '</br>';
    html += (msToStr(image.getAttribute('time')));

    $("#tip").html(html);
}

function get_all(callback) {
    chrome.storage.local.get(null, function(data) {
        callback(data);
    })
}

function compare(a,b) {
    if (a.total_time_seen < b.total_time_seen)
        return -1;
    if (a.total_time_seen > b.total_time_seen)
        return 1;
    return 0;
}

var images = [];
var html = '';

window.onload = function () { 
    get_all(function(data_object) {
        for (var image in data_object) {
            images.push(data_object[image]);
        };
        images.sort(compare).reverse();
        console.log(images);
        for (var i=0; i<5; i++) {
            var img = document.createElement('img');
            img.src = images[i].src;
            img.setAttribute('alt', images[i].src);
            img.setAttribute('time', images[i].total_time_seen);
            img.className = 'top-image';
            document.body.appendChild(img);
        }

        $('.top-image').hover(
            function (e) {
                if(!$(e.relatedTarget).hasClass('top-image')) {
                    console.log('entering');
                    console.log(this);
                    update_tip(this);
                    $("#tip").show(); 
                }
            },
            function (e) {
                if(!$(e.relatedTarget).hasClass('top-image')) {
                    console.log('leaving');
                    $("#tip").hide(); 
                }
            }
        );
    });
}




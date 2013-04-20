// Code to be injected into any page the user accesses
//

var images = [];
var focused = true;
var last_action = (new Date()).getTime();

// Function to get all images on the page
function img_find() {

    var simpleImgs = {};
    var domImgs = document.getElementsByTagName("img");
    for(var i=0; i < domImgs.length; i++) {
        tmpImg = {};
        tmpImg.src = domImgs[i].src;
        key = encodeURIComponent(tmpImg.src).replace(/\./g, "").replace(/%/g, "");
        tmpImg.offsetTop = domImgs[i].offsetTop;
        tmpImg.offsetLeft = domImgs[i].offsetLeft;
        tmpImg.offsetWidth = domImgs[i].offsetWidth
        tmpImg.offsetHeight = domImgs[i].offsetHeight;
        simpleImgs[key] = tmpImg;
        tmpImg = null;
    }
    return simpleImgs;
}


function get_item(key, callback) {
    chrome.storage.local.get(key, function(data) {
        callback(key, data);
    })
}


// Check if the element is in the view port
function check_visible(el) {
    var top = el.offsetTop;
    var left = el.offsetLeft;
    var width = el.offsetWidth;
    var height = el.offsetHeight;

    if (focused) {
        while(el.offsetParent) {
            el = el.offsetParent;
            top += el.offsetTop;
            left += el.offsetLeft;
        }

        return (
                top >= window.pageYOffset &&
                left >= window.pageXOffset &&
                (top + height) <= (window.pageYOffset + window.innerHeight) &&
                (left + width) <= (window.pageXOffset + window.innerWidth)
            );
    } else {
        return false;
    }
}

function init_image(imageObj) {
    imageObj['total_time_seen'] = 0;
    if (check_visible(imageObj)) {
        imageObj['on_screen'] = true;
        imageObj['first_seen'] = (new Date()).getTime();
        //imageObj['last_seen'] = (new Date()).getTime();
    } else {
        imageObj['on_screen'] = false;
    }
    return imageObj;
}

function check_image(imageObj) {
    if (check_visible(imageObj)) {
        // if element has just become on screen
        if (imageObj['on_screen'] == false) {
            imageObj['first_seen'] = (new Date()).getTime();
            imageObj['on_screen'] = true;
            //console.log('image became visible');
        } else {
            console.log('image was visible, still is');
            imageObj['last_seen'] = (new Date()).getTime();
            imageObj['recent_time_seen'] = imageObj['last_seen'] - imageObj['first_seen'];
            imageObj['total_time_seen'] = imageObj['total_time_seen'] + imageObj['recent_time_seen'];
            imageObj['first_seen'] = (new Date()).getTime();
        }

    // if element is not visible
    } else {
        // if element has just gone off screen
        if (imageObj['on_screen'] == true) {
            imageObj['last_seen'] = (new Date()).getTime();
            imageObj['recent_time_seen'] = imageObj['last_seen'] - imageObj['first_seen'];
            imageObj['total_time_seen'] = imageObj['total_time_seen'] + imageObj['recent_time_seen'];
            imageObj['on_screen'] = false;
            //console.log('image was visible, now is not');
        }
    }
    return imageObj;
}

function user_action(e) {
    last_action = (new Date()).getTime();
    focused = true;
    //console.log(e);
}

function tab_is_active() {
    now = (new Date()).getTime();
    if (now - last_action < 10000 && focused) {
        return true;
    } else {
        return false
    }
}


window.onscroll = function (oEvent) {
    for (var key in images) {
        images[key] = check_image(images[key]);
    }
}


// Initialize everything here
window.onload = function () { 
    //$(document).bind("click keydown keyup mousemove", user_action);

    images = img_find();
    for (var key in images) {
        images[key] = init_image(images[key]);
        safe_key = encodeURIComponent(images[key].src).replace(/\./g, "").replace(/%/g, "");
        get_item(safe_key, function(used_key, x) {
            images[used_key].total_time_seen = images[used_key].total_time_seen + x[used_key].total_time_seen;
        });
    }
    // Loop to save data
    setInterval(function(){
        if (tab_is_active()) {
            for (var key in images) {
                images[key] = check_image(images[key]);

                var dataObj = {};
                safe_key = encodeURIComponent(images[key].src).replace(/\./g, "").replace(/%/g, "");
                dataObj[safe_key] = images[key];
                chrome.storage.local.set(dataObj, function() {
                });
            }
        }
    },1000);
}

window.addEventListener('focus', user_action);
window.addEventListener('mousemove', user_action);
window.addEventListener('click', user_action);
window.addEventListener('keyup', user_action);
window.addEventListener('keydown', user_action);

window.addEventListener('blur', function() {
    focused = false;
});

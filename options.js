

function clear_cache() {
    chrome.storage.local.clear();
    var status = document.getElementById("status");
    status.innerHTML = "Cache Cleared";
}

function dump_storage() {
    chrome.storage.local.get(null, function(data) {
        console.log(data);
    });
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
var html = '<ul>';

window.onload = function () { 
    get_all(function(data_object) {
        for (var image in data_object) {
            images.push(data_object[image]);
        };
        images.sort(compare).reverse();
        //console.log(unsorted_images);
        for (var i=0; i<5; i++) {
            html += "<li><img src='" + images[i].src + "'>" + images[i].src + "<li>";
        }
        html += '</ul>';
        $('#images').html(html);
    });
}

document.querySelector('#clear').addEventListener('click', clear_cache);
document.querySelector('#dump').addEventListener('click', dump_storage);

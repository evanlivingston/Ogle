

function clear_cache() {
    chrome.storage.local.clear();
    var status = document.getElementById("status");
    status.innerHTML = "Everything Cleared";
}

function dump_storage() {
    chrome.storage.local.get(null, function(data) {
        console.log(data);
    });
}


document.querySelector('#clear').addEventListener('click', clear_cache);
//document.querySelector('#dump').addEventListener('click', dump_storage);

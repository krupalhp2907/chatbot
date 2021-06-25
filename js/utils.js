function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function noop() { }


function createElementsFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    return div.childNodes;
}


function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    return div.firstChild;
}

function createHTMLFromElement(el) {
    if (el instanceof Array) {
        let htmlEl = "";
        el.forEach(e => {
            if (e instanceof Element) {
                htmlEl += e.parentElement.innerHTML;
            } else {
                console.warn(`Given object must be typeof Element given ${typeof e}`);
            }
        });
        return htmlEl;
    } else if (el instanceof Element) {
        return el.parentElement.innerHTML;
    } else {
        console.warn(`Given object must be typeof Element given ${typeof e}`);
        return undefined;
    }
}
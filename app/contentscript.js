var Nubtn = createButton();
let txtEl;
document.addEventListener('focusin', onFocusIn);

function onFocusIn(event) {
    el = event.target;
    if(el.type != "button" && el.type != "submit" ) {
        if (el.contentEditable ||
            el.matches('input textarea') && el.type.match(/email|number|text/))
        {
            appendButton(el);
            txtEl = el;
        }
    }
}

function createButton() {
    var btn = document.createElement('button');
    btn.textContent = 'NuCyp';
    btn.id = "NuCyBtn"
    btn.onclick = function(event) {
        console.log(txtEl.value);
        chrome.extension.sendMessage({raw_msg:txtEl.value});

        chrome.extension.onMessage.addListener(function(request, sender,
              sendResponse) {

            //console.log('contentscript.js: ' + JSON.stringify(request));



            if (request.action == "open_dialog_box") {
              console.log(txtEl);
              setKeywordText(txtEl,request.msg)
              //txtEl.innerHTML = request.msg;
              //txtEl.value = request.msg;
              //simulateKeyPress();
              sendResponse();
            }

            // allow async callback of sendResponse()
            return true;

          });

    }
    return btn;
}

function appendButton(textElement) {
    textElement.parentElement.insertBefore(Nubtn, textElement.nextElementSibling);
}

function setKeywordText(el,text) {
    el.value = text;
    el.innerHTML = text;
    //txtEl.value = request.msg;
    var evt = document.createEvent("Events");
    evt.initEvent("change", true, true);
    el.dispatchEvent(evt);
}


document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('NuCyBtn').addEventListener('click',function(e){
    console.log('binded');
  });
  console.log('Nu contentscript has been loaded!');
});

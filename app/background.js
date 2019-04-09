function read(key, callback) {

    if(key != null) {
        chrome.storage.local.get(key, function (obj) {
            callback(obj);
        });
    }
}
function encryptMessage(msg){
  //msg = document.getElementById('input-text').value;
  m2e = {"message":msg};
  mm = JSON.stringify(m2e);
  var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://127.0.0.1:5151/encrypt_message', true);
//  xhr.responseType = 'json';
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {

      var msgKit = JSON.parse(xhr.response);
      console.log(msgKit.result['message_kit'] );
      //encrypted_msg.push(msgKit.result['message_kit']);
      //callback(xhr.response);
      return msgKit.result['message_kit'];
    }
  }
  xhr.send(mm);
}
chrome.runtime.onMessage.addListener(function(res,sender,sendRes) {
  //alert("sender"+sender.id+" | "+res.invoke)
  console.log(sender);
  let enc_msg='pop';
/*
    read('contentTweetMsg', function(r){
      r.contentTweetMsg = res;
      r.contentTweetMsg['tabId'] = sender.tab.id;
      chrome.storage.local.set(r, function() {
      console.log(res)
    });
  });*/
  m2e = {"message":res.raw_msg};
  mm = JSON.stringify(m2e);
  var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://127.0.0.1:5151/encrypt_message', true);
//  xhr.responseType = 'json';
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {

      var msgKit = JSON.parse(xhr.response);
      console.log(msgKit.result );
      enc_msg = msgKit.result['message_kit'];
      //encrypted_msg.push(msgKit.result['message_kit']);
      //callback(xhr.response);
      //sendRes({res:JSON.stringify(msgKit.result['message_kit'])});

    }
  }
  xhr.onload = function () {
  console.log('DONE: ', xhr.status);
  //sendRes({'res':enc_msg});
  chrome.tabs.sendMessage(sender.tab.id, {action: "open_dialog_box",msg:enc_msg}, function(response) {
    console.log('successfully delivered');
  });
  };

  xhr.send(mm);
//  console.log(encryptMessage(res.raw_msg));


});

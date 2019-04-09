// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const Ursula = "http://52.14.207.225:9151";
const Alice = "http://127.0.0.1:8151";
const Enrico = "http://127.0.0.1:5151";
const Bob = "http://127.0.0.1:11151";
let avk =  "02abd72f89951f3d83ea3e4b5455477e36af65b7b815482a3306963960660a8ad4";
let bvk = "032757e0ddc98baaf4ad168378a1ed862023fad62c35acd7b9c1bff3a4c2ed9bb6";
let bek = "02a1d14bb7e2f0962f013f8acf82e7175bcfdd570ebb8044c416871985304a415e";
const labeler = 'Peerless';
let msgObj = {};
let AliceObject ={};
let BobObject ={};
var port = null;
let pek;
let encrypted_msg = new Array;
/*Initiate Config*/
function setInitConfig(){
  let Nu ={Alice:{avk:null},Bob:{bek:null,bvk:null},host:false,nuCli:false};
  chrome.storage.local.set({Nu},function(){console.log('Nu initialized!')});
}
/* Read chrome.storage */
function read(key, callback) {

    if(key != null) {
        chrome.storage.local.get(key, function (obj) {
            callback(obj);
        });
    }
}

var getKeys = function(obj){
   var keys = [];
   for(var key in obj){
      keys.push(key);
   }
   return keys;
}


function appendMessage(text) {
  console.log(text);
  //document.getElementById('response').innerHTML += "<p>" + text + "</p>";
}

function updateUiState() {
  read('Nu',function(res){
    if (port) {
      //document.getElementById('connect-button').style.display = 'none';
      //document.getElementById('input-text').style.display = 'block';
      //document.getElementById('send-message-button').style.display = 'block';
      res.Nu.host = true;
      sendNativeMessage('ping');
    } else {
      //document.getElementById('connect-button').style.display = 'block';
      //document.getElementById('input-text').style.display = 'none';
      res.Nu.host = false;
      document.getElementById('send-message-button').style.display = 'none';
    }

    chrome.storage.local.set(res,function(){console.log('Nu updated!')});
  });

}

function sendNativeMessage(message) {
  //message = document.getElementById('input-text').value;
  port.postMessage(message);
  appendMessage("Sent message: <b>" + JSON.stringify(message) + "</b>");
}

function onNativeMessage(message) {
  console.log(JSON.stringify(message));
  if((message.search('avk')>= 0) &&(message.search('bvk')>= 0) &&(message.search('bek')>= 0)){
  var alice = message.split(',')[0];
  var bvkey = message.split(',')[1];
  var bekey = message.split(',')[2];
  console.log(alice,bvkey,bekey);
  read('Nu',function(res){

    if(alice.split(':')[0] == 'avk'){
     AliceObject['avk'] = alice.split(':')[1];
     res.Nu.nuCli = true;
     res.Nu.Alice.avk = AliceObject.avk;
   }
   if((bekey.split(':')[0] =='bek')&&(bvkey.split(':')[0] =='bvk')){
     BobObject['bvk'] = bvkey.split(':')[1];
     BobObject['bek'] = bekey.split(':')[1];
     res.Nu.Bob.bvk = BobObject.bvk;
     res.Nu.Bob.bek = BobObject.bek;
   }
    console.log(res);
    chrome.storage.local.set(res,function(){console.log('Nu Alice,Bob,nuCli  initialized!')});
    /*Setup Enrico */
    createLabel(labeler);
  });

}


  appendMessage("Received message: <b>" + JSON.stringify(message) + "</b>");
}

function onDisconnected() {
  appendMessage("Failed to connect: " + chrome.runtime.lastError.message);
  port = null;
  updateUiState();
}
function callback(appender){

  appendMessage("policy_encrypting_key: <b>" + appender + "</b>");
}
function load(label) {
  console.log(label);
  var lab = {};
  var xhr = new XMLHttpRequest();
  xhr.responseType = 'json';
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      console.log(xhr.response);
      pek= xhr.response.result['policy_encrypting_key'];
      callback(pek);

    }
  }

  xhr.open('POST', Alice+'/derive_policy_encrypting_key/'+btoa(label), true);
  xhr.onload = function () {

    lab[label] = {pek:null};
    read('Nu',function(res){
      var vk = res.Nu.Alice.avk;
      var exist = res.Nu.Alice[vk];
        console.log(lab,typeof exist);
        //  console.log(lab);
          if(pek){
            lab[label].pek = pek;
            //console.log(typeof res.Nu.Alice[(vk)][label].pek);
            if(exist==undefined){
              res.Nu.Alice[(vk)] = lab;
            }else{
              res.Nu.Alice[(vk)].Peerless.pek = pek;
            }
            chrome.storage.local.set(res,function(){console.log('Nu.Alice.<avk>.<label>.pek updated!')});
        }

        document.getElementById('pek_mark').innerHTML = 'pek:'+pek.substring(0,10)+'....'+pek.substring(pek.length-15,pek.length);
        sendNativeMessage(pek+' '+vk);
    });

  };
  xhr.send(null);
}
function encryptMessage(){
  msg = document.getElementById('raw_message').value;
  msg_id = document.getElementById('message_id').value;
  if((msg_id != undefined && msg_id != '')&&(msg != undefined && msg != '')){
    console.log(msg);
  m2e = {"message":msg};
  mm = JSON.stringify(m2e);
  var xhr = new XMLHttpRequest();
    xhr.open('POST', Enrico+'/encrypt_message', true);
//  xhr.responseType = 'json';
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {

      var msgKit = JSON.parse(xhr.response);
      console.log(msgKit.result['message_kit'] );
      encrypted_msg.push(msgKit.result['message_kit']);
      msgObj[msg_id] = msgKit.result['message_kit'];
      callback(xhr.response);

    }
  }
  xhr.onload = function () {

    read('Nu',function(res){
      var vk = res.Nu.Alice.avk;
      var msgr = res.Nu.Alice[(vk)].Peerless.msg;
        console.log(typeof msgr);
        //  console.log(lab);
          if(msgObj[msg_id]){


            console.log(msgr);
            if( msgr == undefined)
              res.Nu.Alice[(vk)][labeler]['msg'] = msgObj;
            else{
               res.Nu.Alice[(vk)][labeler]['msg'][msg_id] = msgObj[msg_id];;

              console.log(res);
            }
        }
        //console.log(res);
        chrome.storage.local.set(res,function(){console.log('Nu.Alice.<avk>.<label>.<msg> updated!')});
        document.getElementById('en_msg').innerHTML = msgObj[msg_id];
        document.getElementById('en_msg').hidden = false;
        document.getElementById('raw_message').hidden = true;
        document.getElementById('message_id').disabled = true;
        document.getElementById('encrypt-new-message-button').hidden = false;
        document.getElementById('encrypt-message-button').hidden = true;
        document.getElementById('infoBarTxt').hidden = false;
        document.getElementById('infoBarTxt').value = "Msg Encrypted!";
        nothy();

        //sendNativeMessage(pek);
    });

  };
  xhr.send(mm);
  }else{
    console.log("raw_message EMPTY");
  }
}
function nothy(){
  window.setTimeout(function(){
  document.getElementById('infoBar').hidden = true;
  document.getElementById('infoBarTxt').value = '';
}, 3000);}
function clearEncrypt(){
  document.getElementById('en_msg').hidden = true;
  document.getElementById('raw_message').value ='';
  document.getElementById('raw_message').hidden = false;
  document.getElementById('message_id').value ='';
  document.getElementById('message_id').disabled = false;
  document.getElementById('encrypt-new-message-button').hidden = true;
  document.getElementById('encrypt-message-button').hidden = false;

}
function clearDecrypt(){

  document.getElementById('alice_vk').hidden = false;
  document.getElementById('alice_vk').value ='';
  document.getElementById('enc_mkit').hidden = false;
  document.getElementById('enc_mkit').value ='';
  document.getElementById('poEk').hidden = false;
  document.getElementById('poEk').value ='';
  document.getElementById('d_message').hidden = true;
  document.getElementById('decrypt-new-message-button').hidden = true;
  document.getElementById('retrieve-data').hidden = false;

}
function retriveData(){
  let Dmsg;
  var mkit = document.getElementById('enc_mkit');
  var acliceVk = document.getElementById('alice_vk');
  var poEk = document.getElementById('poEk');
  var d_msg = document.getElementById('d_message');
//  acliceVk = '02b1ac4d9d9d8938ac0d1046a5ee44ccb56cc82296f496cbc90294c486dcdfd769';
//  poEk = '0304246a19a92e5cdd3879180da28c914c72e1b4d63f57f873101b3e32eea5f334';
//  mkit ='AkEFFLt0OqCN7kRK7tv6F3cUv0rp4D7tucnZYVrYELQkAi44hBtXNq6dR3B8xxuTa7pYBWQG9QSCKi8WTez7Ai321+XDLK5eiCy3ki31ZiRcnCULnSq3QxxxLQ+f2WJVcsYC6cPwDLz1H9MtuJw34HFLFNnFELyEbk1BZMKxflzEbmdrrK7VDPFd5fLTOUi4qReSJ2dAhOZNiGtAzmQ3nBuCt5uDeWOZmInvxZoz+VMtRUqv2ErrdrXp+hVt9mXhXkBYV81pY7eh5FIYG43SLCt03bJZGW3fZydzkXVDHiCS/csjKLpGxqj5zLSHylc8';
    if((mkit != undefined && mkit != '')&&(acliceVk != undefined && acliceVk != '')&&(poEk != undefined && poEk != '')){
      var retrival = {};
      retrival['label'] =btoa('Peerless');
      retrival['policy_encrypting_key'] = poEk.value;
      retrival['alice_verifying_key'] = acliceVk.value;
      retrival['message_kit'] =mkit.value;
      var xhr = new XMLHttpRequest();
      xhr.open('POST', Bob+'/retrieve', true);
      //  xhr.responseType = 'json';
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {

          var msgKit = JSON.parse(xhr.response);
          console.log(msgKit);
          Dmsg = msgKit['result'].cleartexts;
          callback(msgKit['result'].cleartexts);
        }
      }
      xhr.onload = function () {
        d_msg.innerHTML = Dmsg;
        d_msg.hidden = false;
        mkit.hidden = true;
        document.getElementById('retrieve-data').hidden = true;
        document.getElementById('decrypt-new-message-button').hidden = false;
        poEk.disabled = true;
        acliceVk.disabled = true;
        document.getElementById('infoBarTxt').hidden = false;
        document.getElementById('infoBarTxt').value = "Msg Decrypted!";
        nothy();

      };
      xhr.send(JSON.stringify(retrival));
    }else{console.log('Incomplete Input');}
}
function grantAccess(){
  bobVk = document.getElementById('bobVk').value;
  bobEk = document.getElementById('bobEk').value;
  //bobVk = "0325baeb38c596f09688c1f6158ae0becbdaea903c7db4580536a804caf0dd7d6a";
  //bobEk ="03eb274207acba8081a146b13947780d1ebf3c5eb6fe707240a06974f204ad6641";
  if((bobVk != undefined && bobVk != '')&&(bobEk != undefined && bobEk != '')){
      var date = new Date();
      date.setDate(date.getDate() + 2);
      var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
      var ex = (new Date(date)).toISOString();
      var grant = {};
      grant['bob_verifying_key'] = bobVk;
      grant['bob_encrypting_key'] = bobEk;
      grant['m'] = 1;
      grant['n'] = 1;
      grant['label'] = btoa('Peerless');
      //grant['expiration'] = '2019-04-14T00:00:00.445418Z';
      grant['expiration'] = ex;
      //new Date(unix*1000).toISOString()
      //retrival['alice_verifying_key'] = btoa(avk);
      //retrival['message_kit'] = btoa(encrypted_msg[0]);

      var xhr = new XMLHttpRequest();
      xhr.open('PUT', Alice+'/grant', true);
      //  xhr.responseType = 'json';
      //xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {

          var msgKit = xhr.response;
          console.log(msgKit);
          //encrypted_msg.push(msgKit.result['message_kit']);
          //callback(xhr.response);
          document.getElementById('infoBarTxt').hidden = false;
          document.getElementById('infoBarTxt').value = "Acces Granted!";
          nothy();

        }
      }
      xhr.onload = function(){
        //document.getElementById('infoBarTxt').value = "Access Granted!"
      };
      xhr.send(JSON.stringify(grant));
  }else{console.log('Need Bob vk & ek');}
}
function connect() {
  var hostName = "com.google.chrome.example.echo";
  //appendMessage("Connecting to native messaging host <b>" + hostName + "</b>")
  port = chrome.runtime.connectNative(hostName);
  port.onMessage.addListener(onNativeMessage);
  port.onDisconnect.addListener(onDisconnected);
  updateUiState();

}
function createLabel(lab){
  console.log('clicked');
  var ek = load( lab);

  /*chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
  console.log(response);
});*/
}


document.addEventListener('DOMContentLoaded', function () {


  read('Nu', function(res){
  if(res.Nu == undefined){
    setInitConfig();}
    connect();
});

/*  document.getElementById('send-message-button').addEventListener(
      'click', sendNativeMessage);*/


  document.getElementById('encrypt-message-button').addEventListener(
      'click', encryptMessage);
  document.getElementById('retrieve-data').addEventListener(
      'click', retriveData);
  document.getElementById('grant-access').addEventListener(
      'click', grantAccess);
  document.getElementById('encrypt-new-message-button').addEventListener(
      'click',clearEncrypt);

  document.getElementById('decrypt-new-message-button').addEventListener(
      'click',clearDecrypt);

  //updateUiState();
  var btns = document.getElementsByClassName("nav-item");

// Loop through the buttons and add the active class to the current/clicked button
for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function() {
    var current = document.getElementsByClassName("active");

    // If there's no active class
    if (current.length > 0) {
      current[0].className = current[0].className.replace(" active", "");

    }
    if(this.id == 'E'){
      document.getElementById('EM').hidden =false;
      document.getElementById('GA').hidden = true;
      document.getElementById('DM').hidden =true;
    }else if(this.id == 'G'){
      document.getElementById('EM').hidden =true;
      document.getElementById('GA').hidden = false;
      document.getElementById('DM').hidden =true;
    }else{
      document.getElementById('EM').hidden =true;
      document.getElementById('GA').hidden = true;
      document.getElementById('DM').hidden =false;
    }
    // Add the active class to the current/clicked button
    this.className += " active";
    console.log(this.id);
  });
}
var topDock = document.getElementsByClassName("dock");
for (var i = 0; i < topDock.length; i++) {
  topDock[i].addEventListener("click", function() {
    document.getElementById('infoBar').hidden =false;
    if(this.id == 'avk'){
      document.getElementById('infoBarTxt').value =AliceObject.avk;}
    else if(this.id == 'bvk'){
      document.getElementById('infoBarTxt').value = BobObject.bvk;}
    else if(this.id == 'bek'){
      document.getElementById('infoBarTxt').value = BobObject.bek;}
    else{
      document.getElementById('infoBarTxt').value = pek;}

  });
}
});

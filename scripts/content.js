
// // This will check if jQuery has loaded. If not, it will add to <head>
// window.onload = function() {
//     if (!window.jQuery) {
//       var head = document.getElementsByTagName('head')[0];
//       var script = document.createElement('script');
//       script.type = 'text/javascript';
//       script.src = chrome.runtime.getURL("scripts/jquery/jquery.js")
//       head.appendChild(script);
//       console.log(`jquery added`)
//     }
// }
// var jquery_test_interval;
// function checkJquery(){
//     console.log(`Checking jquery`)
//     jquery_test_interval = setTimeout(function(){
//         console.log(`Checking jquery timer started`)
//         if (window.jQuery) {
//             console.log(`JQuery loaded successfully`)
//             try{
//                 clearInterval(jquery_test_interval);
//             }
//             catch{}
//             return true
//         }
//     },1000);
// }
// checkJquery();

function PopIt(event) {
    // Extension 2
    console.log("Reload Alert!.")
    const txt = String(document.documentElement.innerHTML);
    let find = txt.match(/no Qs are available in your queue/g) || [];
    let is_qna_page = String(location.href).includes('https://expert.chegg.com/qna/authoring/answer')
    if(find.length < 1 && is_qna_page){
        event.preventDefault();
        // // console.log("Are you sure you want to leave?")
        // // return "Are you sure you want to leave?";
        // let msg = `Are you sure you want to leave?\nYour solution will not save if you leave without submission.`
        // if(confirm(msg)){
        //     return true;
        // }
        // else{
        //     return false
        // }
        // // return false;
    }
}
window.addEventListener('beforeunload', PopIt);
// window.onunload = PopIt;
// window.onbeforeunload = PopIt;
// window.onpopstate = PopIt;
// window.onlocationchange = PopIt;
// window.onpushstate = PopIt;
// window.onhashchange = PopIt;
// window.onreplacestatee = PopIt;

Notification.requestPermission().then((result) => {
    console.log(result);
});

var start_interval;
var refresh_interval;
var sent_notification;
var alert_sound;
var question_notified = false;
var qna_url = "https://expert.chegg.com/qna/authoring/answer"

var ExtensionEnabled = false;
var NotificationEnabled = false;
var AlertSoundEnabled = false;
var AlertSound;
var AlertSoundVolume;
var refreshInterval = 10;
chrome.storage.sync.get(['ExtensionEnabled', 'NotificationEnabled', 'AlertSoundEnabled', 'AlertSound', 'AlertSoundVolume', 'refreshInterval'], function (result) {
    ExtensionEnabled = result.ExtensionEnabled;
    NotificationEnabled = result.NotificationEnabled;
    AlertSoundEnabled = result.AlertSoundEnabled;
    AlertSound = result.AlertSound['url'];
    AlertSoundVolume = result.AlertSoundVolume;
    refreshInterval = result.refreshInterval || 10;
});

// Listen for changes in storage and update
chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (changes.refreshInterval) {
        refreshInterval = changes.refreshInterval.newValue || 10;
        console.log("Chegg Question Notifier Rr-loaded...");
        notifyQuestion();
    }
    if(changes.ExtensionEnabled){
        ExtensionEnabled = changes.ExtensionEnabled.newValue;
        if(ExtensionEnabled == true){
            notifyQuestion();
        }
        else{
            stopExtension();
        }
    }
    if(changes.NotificationEnabled){
        NotificationEnabled = changes.NotificationEnabled.newValue;
    }
    if(changes.AlertSoundEnabled){
        AlertSoundEnabled = changes.AlertSoundEnabled.newValue;
    }
    if(changes.AlertSound){
        AlertSound = changes.AlertSound.newValue['url'];
    }
    if(changes.AlertSoundVolume){
        AlertSoundVolume = changes.AlertSoundVolume.newValue;
    }
});



function notifyQuestion(){
    // Extension 2
    stopExtension(reload=true);
    console.log("Checking Chegg Question Notifier...");
    if(ExtensionEnabled == true){
        console.log(`Chegg Question Notifier is activated. Will refresh page in every ${refreshInterval} seconds`);
        start_interval = setInterval(function(){
            if(location.href == qna_url){
                let ele = document.querySelectorAll('[data-test="no-question"]')[0];
                let alert_msg = document.getElementById('chegg_questioner_notifier_msg');
                if(!alert_msg){
                    try{
                        let msg = `<div style="text-align:center;">
                            <h4 id="chegg_questioner_notifier_msg" style="color:red;">Chegg Question Notifier is Activated.</h4>
                            <div style="font-size:14px; color:red;">Keep this page open. The page will refresh at every ${refreshInterval} seconds. You will get notification when question is avalibale.</div>
                        </div>`;
                        ele.insertAdjacentHTML("afterbegin", msg);
                    }
                    catch{

                    }
                }
            }
        },3000);
        refresh_interval = setInterval(function(){
            if(location.href == qna_url){
                const txt = String(document.documentElement.innerHTML);
                let find = txt.match(/no Qs are available in your queue/g) || [];
                if(find.length == 1){
                    // Refresh the page 
                    location.reload();
                }
                else{
                    if(!question_notified){
                        let title = `HURRAY!\nNew Question in Chegg!`;
                        console.log(title)
                        try{
                            // alert_sound.pause();
                        }
                        catch{}
                        try{
                            sent_notification.close();
                        }
                        catch{}
                        if(AlertSoundEnabled){
                            try{
                                // audio_file = chrome.runtime.getURL("assets/audio/audio-1.mp3")
                                alert_sound = new Audio(AlertSound);
                                alert_sound.volume = AlertSoundVolume;
                                alert_sound.loop = true;
                                alert_sound.play();
                            }
                            catch{}
                        }
                        if(NotificationEnabled){
                            sent_notification = new Notification(title, {
                                'body': "A Question available in your Chegg Live Expert Q&A Dashbord.",
                                'tag': 'chegg_question_live',
                                'badge': chrome.runtime.getURL("assets/images/notification_badge.png"),
                                'icon': chrome.runtime.getURL("assets/images/notification_icon.webp"),
                                'image': chrome.runtime.getURL("assets/images/notification_image.png"),
                                'vibrate': [2000],
                                'renotify': true,
                                'requireInteraction': true,
                                'silent': false
                            });
                        }
                        question_notified = true;
                    }
                }
            }
        }, refreshInterval*1000);
    }
    else{
        stopExtension();
    }
}

function stopExtension(reload=false){
    if(!reload){
        console.log("Chegg Question Notifier disabled...");
    }
    try{
        document.getElementById('chegg_questioner_notifier_msg').remove();
    }
    catch{}
    clearInterval(start_interval);
    clearInterval(refresh_interval);
    try{
        // alert_sound.pause();
    }
    catch{}
    try{
        sent_notification.close();
    }
    catch{}
}
window.addEventListener("load", function(){
    setTimeout(notifyQuestion, 2000);
});



document.addEventListener('pointerover', (event) => {
    try{
        sent_notification.close();
    }
    catch{}
    try{
        alert_sound.pause();
    }
    catch{}
});
// document.addEventListener("visibilitychange", () => {
//     // console.log(`visibilityState changed to ${document.visibilityState }`)
//     if (document.visibilityState === "visible") {
//         try{
//             sent_notification.close();
//         }
//         catch{}
//         try{
//             alert_sound.pause();
//         }
//         catch{}
//     }
// });

document.querySelectorAll(`button[data-test="submit-answer-button"]`).forEach(function(element){
    element.addEventListener("click", function(event){
        if(!this.disabled){
            let LastSubmission = new Date();
            chrome.storage.sync.set({ 'LastSubmission': LastSubmission }, function() {
                console.log('Chegg Q&A Solution Submitted.');
            });
        }
    });
});
document.querySelectorAll(`button[data-test="answer-submit-btn"]`).forEach(function(element){
    element.addEventListener("click", function(event){
        if(!this.disabled){
            let LastSubmission = new Date();
            chrome.storage.sync.set({ 'LastSubmission': LastSubmission }, function() {
                console.log('Chegg Q&A Solution Submitted.');
            });
        }
    });
});
document.querySelectorAll(`button[data-test="my-submission-btn"]`).forEach(function(element){
    element.addEventListener("click", function(event){
        if(!this.disabled){
            let LastSubmission = new Date();
            chrome.storage.sync.set({ 'LastSubmission': LastSubmission }, function() {
                console.log('Chegg Q&A Solution Submitted.');
            });
        }
    });
});
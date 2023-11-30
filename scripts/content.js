
var qna_url = "https://expert.chegg.com/qna/authoring/answer"
function PopIt(event) {
    // Extension 2
    console.log("Reload Alert!.")
    let no_question_div = document.querySelectorAll('[data-test="no-question"]');
    let question_div = document.querySelectorAll('[data-test="question"]');
    let is_qna_page = String(location.href).includes(qna_url)
    if(question_div.length >= 1 && is_qna_page){
        event.preventDefault();
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
var sent_notification;
var alert_sound;
var question_notified = false;
var other_notified = false;
var user_active = undefined;
var force_reload1 = false;
var force_reload2 = false;
var question_fetched = undefined;
var QnA_exited = undefined;

var ExtensionEnabled = false;
var NotificationEnabled = false;
var AlertSoundEnabled = false;
var AlertSound;
var AlertSoundVolume;
var refreshInterval = 30;

// Listen for changes in storage and update
chrome.storage.onChanged.addListener(function (changes, namespace) {
    if (changes.refreshInterval) {
        refreshInterval = changes.refreshInterval.newValue || 30;
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
    console.log("Checking Chegg Question Notifier...");
    stopExtension(reload=true);
    var wait_timer = 0;
    var wait_timer1 = 0;
    var reverse_timer = refreshInterval;
    if(ExtensionEnabled == true){
        console.log(`Chegg Question Notifier is activated. Will refresh page in every ${refreshInterval} seconds`);
        start_interval = setInterval(function(){
            let page_contents = String(document.documentElement.innerHTML).toLowerCase();
            let content_loads = document.querySelectorAll(`[data-test="braze-notifications-header-button"]`);

            if(question_fetched === false && location.href !== qna_url){
                if(QnA_exited === undefined){
                    QnA_exited = true;
                    setTimeout(function(){
                        if(user_active === undefined){
                            location.reload();
                        }
                    }, 1*60*1000) // 1 minutes
                }
            }

            question_fetched = false;
            if(location.href == qna_url && content_loads.length == 0){
                wait_timer1 += 1;
                if(wait_timer1 >= 60){
                    console.log('Page not completely loaded. Try refreshing.')
                    // Refresh the page 
                    location.reload();
                }
            }
            else if(location.href == qna_url && content_loads.length >= 1){
                chrome.storage.sync.set({ 'ErrorRedirected': false }, function() {
                    
                });
                wait_timer += 1;
                let no_question_div = document.querySelectorAll('[data-test="no-question"]');
                let question_div = document.querySelectorAll('[data-test="question"]');
                let error_notification = document.querySelectorAll('[data-test="notification"][type="error"]');
                let extension_alert_msg = document.getElementById('chegg_questioner_notifier_msg');
                if(!extension_alert_msg && no_question_div.length >= 1){
                    try{
                        let msg = `<div id="chegg_questioner_notifier_msg" style="text-align:center;">
                            <h4 style="color:red;">Chegg Question Notifier is Activated.</h4>
                            <div style="font-size:14px; color:red;">Keep this page open. The page will refresh at every ${refreshInterval} seconds. You will get notification when question is avalibale.</div>
                            <div style="font-size:14px; color:red;">Refresh in <span id="reverse_timer">${reverse_timer}</span> seconds</div>
                        </div>`;
                        no_question_div[0].insertAdjacentHTML("afterbegin", msg);
                    }
                    catch{}
                }
                else if(no_question_div.length >= 1){
                    try{
                        reverse_timer -= 1;
                        document.getElementById("reverse_timer").innerHTML = reverse_timer;
                    }catch{}
                }
            
                if(question_div.length >= 1){
                    question_fetched = true;
                    wait_timer = 0;
                    reverse_timer = refreshInterval;
                    // other_notified = false;
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
                                'body': "An Question is available in your Chegg Live Expert Q&A Dashbord.",
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
                    }
                    question_notified = true;
                }
                else if(force_reload1 && force_reload2){
                    console.log('Force Reload')
                    location.reload();
                }
                else if(no_question_div.length >= 1){
                    if(wait_timer > refreshInterval){
                        location.reload();
                    }
                }
                else if(error_notification.length >= 1){
                    if(wait_timer >= 10 && !question_fetched){
                        console.log('Error Notification Reload')
                        location.reload();
                    }
                }
                else if(page_contents.includes(`the page you are looking for is currently unavailable`)){
                    chrome.storage.sync.set({ 'ErrorRedirected': true }, function() {
                        console.log('Page Unavailable Reload')
                        location.reload();
                    });
                }
                else if(wait_timer >= 7 && !question_fetched){
                    console.log('something other happend')
                    if(!other_notified){
                        chrome.storage.sync.set({ 'ErrorRedirected': true }, function() {
                            console.log('ErrorRedirected set to ture')
                        });
                        try{
                            // alert_sound.pause();
                        }catch{}
                        try{
                            sent_notification.close();
                        }catch{}
                        try{
                            audio_file = chrome.runtime.getURL("assets/audio/other_notification.mp3")
                            alert_sound1 = new Audio(audio_file);
                            // alert_sound1.volume = AlertSoundVolume;
                            // alert_sound1.loop = true;
                            alert_sound1.play();
                        }
                        catch{}
                        let title = `ALERT!!\nSometing other displayed in Chegg Expert Q&A Page.`;
                        console.log(title);
                        if(NotificationEnabled){
                            sent_notification = new Notification(title, {
                                'body': "Chegg Expert Q&A page showing some message. Kindly go to the page.",
                                'tag': 'chegg_question_live',
                                'badge': chrome.runtime.getURL("assets/images/notification_badge.png"),
                                'icon': chrome.runtime.getURL("assets/images/notification_icon.webp"),
                                'image': chrome.runtime.getURL("assets/images/notification_image.png"),
                                'vibrate': [2000],
                                'renotify': true,
                                'requireInteraction': false,
                                'silent': false
                            });
                        }
                        force_reload1 = true;
                        setTimeout(function(){
                            console.log('something other happend - force reload')
                            force_reload2 = true;
                        }, 1*60*1000) // 1 minutes
                    }
                    other_notified = true;
                }
            }
            
        }, 1000);
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
    console.log("Chegg Question Notifier is ready as page loaded.");
    chrome.storage.sync.get(['ExtensionEnabled', 'NotificationEnabled', 'AlertSoundEnabled', 'AlertSound', 'AlertSoundVolume', 'refreshInterval', 'ErrorRedirected'], function (result) {
        ExtensionEnabled = result.ExtensionEnabled;
        NotificationEnabled = result.NotificationEnabled;
        AlertSoundEnabled = result.AlertSoundEnabled;
        AlertSound = result.AlertSound['url'];
        AlertSoundVolume = result.AlertSoundVolume;
        refreshInterval = result.refreshInterval || 30;
        console.log(result)
        console.log("Data for Chegg Question Notifier is read from storage.");
        if(result.ErrorRedirected && location.href != qna_url){
            console.log("Chegg Question Notifier found Error Redirection.");
            chrome.storage.sync.set({ 'ErrorRedirected': false }, function() {
                console.log('ErrorRedirected set to false. And redirecting to Expert QnA')
                location.replace(qna_url);
            });
        }
        else{
            notifyQuestion();
        }
    });
});



document.addEventListener('pointerover', (event) => {
    force_reload1 = false;
    force_reload2 = false;
    setTimeout(function(){
        try{
            sent_notification.close();
        }catch{}
        try{
            alert_sound.pause();
        }catch{}
    }, 3000);
    if(QnA_exited === true){
        user_active = true
    }
});

// document.querySelectorAll(`button[data-test="submit-answer-button"]`).forEach(element => {
//     element.addEventListener("click", function(event){
//         if(!this.disabled){
//             let LastSubmission = new Date();
//             chrome.storage.sync.set({ 'LastSubmission': LastSubmission }, function() {
//                 console.log('Chegg Q&A Solution Submitted.');
//             });
//         }
//     });
// });
// document.querySelectorAll(`button[data-test="answer-submit-btn"]`).forEach(element => {
//     element.addEventListener("click", function(event){
//         if(!this.disabled){
//             let LastSubmission = new Date();
//             chrome.storage.sync.set({ 'LastSubmission': LastSubmission }, function() {
//                 console.log('Chegg Q&A Solution Submitted.');
//             });
//         }
//     });
// });
// document.querySelectorAll(`button[data-test="my-submission-btn"]`).forEach(element => {
//     element.addEventListener("click", function(event){
//         if(!this.disabled){
//             let LastSubmission = new Date();
//             chrome.storage.sync.set({ 'LastSubmission': LastSubmission }, function() {
//                 console.log('Chegg Q&A Solution Submitted.');
//             });
//         }
//     });
// });
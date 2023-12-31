
var qna_url = "https://expert.chegg.com/qna/authoring/answer"

function getCookies(name){
    let cookie = {};
    document.cookie.split(';').forEach(function(el) {
        let [key,value] = el.split('=');
        cookie[key.trim()] = value;
    });
    return cookie[name];
}
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
var timer_sound;
var timer_sound_played = false;

var ExtensionEnabled = false;
var NotificationEnabled = false;
var AlertSoundEnabled = false;
var AlertSound;
var AlertSoundVolume;
var RefreshIntervalMin = 30;
var RefreshIntervalMax = 60;

// Listen for changes in storage and update
chrome.storage.onChanged.addListener(function (changes, namespace) {
    if(changes.RefreshIntervalMin) {
        RefreshIntervalMin = changes.RefreshIntervalMin.newValue || 30;
        console.log("Chegg Question Notifier Rr-loaded...");
        notifyQuestion();
    }
    if(changes.RefreshIntervalMax) {
        RefreshIntervalMax = changes.RefreshIntervalMax.newValue || 60;
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
    min = Math.ceil(RefreshIntervalMin);
    max = Math.floor(RefreshIntervalMax);
    var random_number;
    var random_diff;
    var prev_random_number = getCookies('prev_random_number');
    if(prev_random_number == undefined){
        prev_random_number = 0
    }
    prev_random_number = Number(prev_random_number)
    random_number = Math.floor(Math.random() * (max - min + 1) + min);
    // while(true){
    //     random_number = Math.floor(Math.random() * (max - min + 1) + min);
    //     random_diff = Math.abs(random_number - prev_random_number);
    //     if(random_diff > 5){
    //         break;
    //     }
    // }
    document.cookie = `prev_random_number=${random_number}; path=/`;
    var reverse_timer = random_number;
    if(ExtensionEnabled == true){
        console.log(`Chegg Question Notifier is activated. Will refresh page in every ${RefreshIntervalMin} to ${RefreshIntervalMax} seconds`);
        start_interval = setInterval(function(){
            let page_contents = String(document.documentElement.innerHTML).toLowerCase();
            let content_loads = document.querySelectorAll(`[data-test="braze-notifications-header-button"]`);

            if(question_fetched === false && location.href !== qna_url){
                if(QnA_exited === undefined){
                    console.log("User left QnA page");
                    QnA_exited = true;
                    setTimeout(function(){
                        if(user_active === undefined){
                            console.log("System left QnA page, so again redirect to QnA page.");
                            location.replace(qna_url);
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
                // let ErrorRedirected = browser.cookies.set({
                //     url: location.origin,
                //     name: 'ErrorRedirected',
                //     value: '0'
                // })
                document.cookie = "ErrorRedirected=0; path=/";
                try{
                    let start_solving_timer_hr = Number(document.querySelectorAll(`[data-test="expert-timer"] [data-test="hours"]`)[0].innerHTML);
                    let start_solving_timer_min = Number(document.querySelectorAll(`[data-test="expert-timer"] [data-test="mintues"]`)[0].innerHTML);
                    let start_solving_timer_sec = Number(document.querySelectorAll(`[data-test="expert-timer"] [data-test="seconds"]`)[0].innerHTML);
                    let start_solving_timer = start_solving_timer_hr*3600 + start_solving_timer_min*60 + start_solving_timer_sec;
                    if(start_solving_timer < 60 && !timer_sound_played){
                        console.log('Less than 1 minute remain.')
                        timer_sound_played = true;
                        time_ending_audio = chrome.runtime.getURL("assets/audio/time_ending.mp3")
                        timer_sound = new Audio(time_ending_audio);
                        timer_sound.volume = 1;
                        timer_sound.play();
                    }
                    if(start_solving_timer >= 60){
                        timer_sound_played = false;
                        timer_sound.pause();
                    }
                }catch(e){
                    timer_sound_played = false;
                    try{
                        timer_sound.pause();
                    }catch{}
                }
                wait_timer += 1;
                let no_question_div = document.querySelectorAll('[data-test="no-question"]');
                let question_div = document.querySelectorAll('[data-test="question"]');
                let error_notification = document.querySelectorAll('[data-test="notification"][type="error"]');
                let extension_alert_msg = document.getElementById('chegg_questioner_notifier_msg');
                if(!extension_alert_msg && no_question_div.length >= 1){
                    try{
                        let msg = `<div id="chegg_questioner_notifier_msg" style="text-align:center;">
                            <h4 style="color:red;">Chegg Question Notifier is Activated.</h4>
                            <div style="font-size:14px; color:red;">Keep this page open. The page will refresh at every ${RefreshIntervalMin} to ${RefreshIntervalMax} seconds. You will get notification when question is avalibale.</div>
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
                    reverse_timer = random_number;
                    // other_notified = false;
                    if(!question_notified){
                        let title = `HURRAY!\nNew Question in Chegg!`;
                        console.log(title)
                        try{
                            // alert_sound.pause();
                        }
                        catch{}
                        try{
                            // sent_notification.close();
                        }
                        catch{}
                        if(AlertSoundEnabled){
                            try{
                                // audio_file = chrome.runtime.getURL("assets/audio/audio-1.mp3")
                                alert_sound = new Audio(AlertSound);
                                alert_sound.volume = AlertSoundVolume;
                                alert_sound.loop = true;
                                alert_sound.play();
                                console.log('Alert Sound Played. ', alert_sound)
                            }
                            catch{}
                        }
                        if(NotificationEnabled){
                            unique_id = Math.random();
                            sent_notification = new Notification(title, {
                                'body': "An Question is available in your Chegg Live Expert Q&A Dashbord.",
                                'tag': `chegg_question_live-${unique_id}`,
                                'badge': chrome.runtime.getURL("assets/images/notification_badge.png"),
                                'icon': chrome.runtime.getURL("assets/images/notification_icon.webp"),
                                'image': chrome.runtime.getURL("assets/images/notification_image.png"),
                                'vibrate': [2000],
                                'renotify': true,
                                'requireInteraction': true,
                                'silent': false
                            });
                            console.log('Notification Sent. ', sent_notification);
                        }
                        
                        chrome.storage.sync.get(['TotalQuestions'], function(result){
                            if(result.TotalQuestions == null || result.TotalQuestions == undefined){
                                TotalQuestions = 1
                            }
                            else{
                                TotalQuestions = Number(result.TotalQuestions)+1
                            }
                            chrome.storage.sync.set({ 'TotalQuestions': TotalQuestions });
                            curr_time = new Date()
                            chrome.storage.sync.set({ 'LastQuetionTime': `${curr_time}` });
                        });
                    }
                    question_notified = true;
                }
                else if(force_reload1 && force_reload2){
                    console.log('Force Reload')
                    location.reload();
                }
                else if(no_question_div.length >= 1){
                    if(wait_timer > random_number){
                        location.reload();
                    }
                }
                else if(error_notification.length >= 1){
                    console.log('Error Notification Found')
                    if(wait_timer >= 5 && !question_fetched){
                        document.cookie = "ErrorRedirected=1; path=/";
                        console.log('Error Notification Reload')
                        location.reload();
                    }
                }
                else if(page_contents.includes(`the page you are looking for is currently unavailable`)){
                    console.log('The page you are looking for is currently unavailable')
                    // browser.cookies.set({
                    //     url: location.origin,
                    //     name: 'ErrorRedirected',
                    //     value: '1'
                    // }).then(function(){
                    //     console.log('Page Unavailable Reload')
                    //     location.reload();
                    // });
                    document.cookie = "ErrorRedirected=1; path=/";
                    console.log('Page Unavailable Reload')
                    location.reload();
                }
                else{
                    console.log('Something other appeared')
                    if(wait_timer >= 10 && !question_fetched){
                        console.log('something other is still appearing.')
                        document.cookie = "ErrorRedirected=1; path=/";
                        if(!other_notified){
                            // browser.cookies.set({
                            //     url: location.origin,
                            //     name: 'ErrorRedirected',
                            //     value: '1'
                            // }).then(function(){
                            //     console.log('ErrorRedirected set to ture')
                            // });
                            try{
                                // alert_sound.pause();
                            }catch{}
                            try{
                                // sent_notification.close();
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
    chrome.storage.sync.get(['ExtensionEnabled', 'NotificationEnabled', 'AlertSoundEnabled', 'AlertSound', 'AlertSoundVolume', 'RefreshIntervalMin', 'RefreshIntervalMax', 'LastQuetionTime'], function (result) {
        ExtensionEnabled = result.ExtensionEnabled;
        NotificationEnabled = result.NotificationEnabled;
        AlertSoundEnabled = result.AlertSoundEnabled;
        AlertSound = result.AlertSound['url'];
        AlertSoundVolume = result.AlertSoundVolume;
        RefreshIntervalMin = result.RefreshIntervalMin || 30;
        RefreshIntervalMax = result.RefreshIntervalMax || 60;
        console.log(`URL ${location.href} loaded fully.`);
        console.log(result)
        console.log("Data for Chegg Question Notifier is read from storage.");

        let ErrorRedirected = getCookies('ErrorRedirected');
        if(ErrorRedirected == '1' && location.href != qna_url){
            console.log("Chegg Question Notifier found Error Redirection.");
            location.replace(qna_url);
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
    }, 1000);
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
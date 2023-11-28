function formatDateTime(dt)
{
    
    // var dt = new Date(dateTime);
    var hours = dt.getHours();
    var minutes = dt.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM'; //AM or PM
    hours = hours % 12; //convert in 12-hour format;
    hours = hours ? hours : 12; //display 0 as 12
    var day = dt.toLocaleString('default', { day: 'numeric' });
    var month = dt.toLocaleString('default', { month: 'long' });
    var year = dt.toLocaleString('default', { year: 'numeric' });
    
    dt = `${(day <= 9) ? '0'+day : day} ${(month <= 9) ? '0'+month : month} ${(year <= 9) ? '0'+year : year}, ${(hours <= 9) ? '0'+hours : hours}:${(minutes <= 9) ? '0'+minutes : minutes} ${ampm}`;
    return dt;
    
}

// This event is triggered when the extension is installed, updated, or when Chrome is updated.
chrome.runtime.onInstalled.addListener(function(details) {
    // Check if the reason is 'install' or 'update'.
    if (details.reason === 'install' || details.reason === 'update') {
      // Perform activation tasks here.
      let option_page = chrome.runtime.getURL("options.html")
    //   let creating = browser.tabs.create(
    //     {
    //         'url': option_page,
    //         'active': true,
    //         'cookieStoreId': true,
    //         'discarded': false,
    //         'muted': false,
    //         'openInReaderMode': false,
    //         'pinned': false,
    //     }
    //   )
      
    }
    // Set default refresh interval to 10 seconds if not already set
    chrome.storage.sync.get(['ExtensionEnabled', 'NotificationEnabled', 'AlertSoundEnabled', 'AlertSound', 'AlertSoundVolume', 'refreshInterval', 'LastSubmission'], function(result) {
        if (!result.ExtensionEnabled) {
            chrome.storage.sync.set({ 'ExtensionEnabled': true });
        }
        if (!result.NotificationEnabled) {
            chrome.storage.sync.set({ 'NotificationEnabled': true });
        }
        if (!result.AlertSoundEnabled) {
            chrome.storage.sync.set({ 'AlertSoundEnabled': true });
        }
        if (!result.AlertSoundVolume) {
            chrome.storage.sync.set({ 'AlertSoundVolume': 1 });
        }
        if (!result.AlertSound) {
            let sound = {
                'name': 'audio-1',
                'url': chrome.runtime.getURL("assets/audio/audio-1.mp3")
            }
            chrome.storage.sync.set({ 'AlertSound': sound });
        }
        if (!result.refreshInterval) {
            chrome.storage.sync.set({ 'refreshInterval': 10 });
        }
        if (!result.LastSubmission) {
            chrome.storage.sync.set({ 'LastSubmission': null });
        }
        if (!result.InactiveAlert) {
            chrome.storage.sync.set({ 'InactiveAlert': true });
        }
    });
});

setInterval(function(){
    chrome.storage.sync.get(['LastSubmission', 'InactiveAlert'], function(result){
        var title = '';
        var body = ''
        if(result.InactiveAlert){
            if (result.LastSubmission) {
                let current = new Date();
                let diff = ((current - result.LastSubmission)/1000)/3600;
                if(diff >= 48){
                    title = 'You are inactive in Chegg Live Expert Q&A'
                    body = `Recently you've not solved any question in Chegg Expert Q&A.\nYou've last solved question at ${formatDateTime(result.LastSubmission)}.`
                }
            }
            else{
                title = 'No question solved in Chegg Live Expert Q&A'
                body = `You've not solved any question in Chegg Expert Q&A`
            }
            if(title != '' && body != ''){
                sent_notification = new Notification(title, {
                    'body': body,
                    'tag': 'chegg_user_inactive',
                    'badge': chrome.runtime.getURL("assets/images/notification_badge.png"),
                    'icon': chrome.runtime.getURL("assets/images/notification_icon.webp"),
                    'image': chrome.runtime.getURL("assets/images/notification_image.png"),
                    'vibrate': [2000],
                    'renotify': true,
                    'requireInteraction': false,
                    'silent': false
                });
            }
        }
    });
},6*3600*1000);
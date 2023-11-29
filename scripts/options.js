var alert_sound;
var notification_test = 'chegg_question_live'
function playAlertSound(){
    try{
        alert_sound.pause()
    }
    catch{}
    if($("#alert_audio_volume-test").prop('checked')){
        chrome.storage.sync.get(['AlertSound'], function (result) {
            chrome.storage.sync.get(['AlertSoundVolume'], function (result1) {
                let AlertSoundVolume = result1.AlertSoundVolume;
                AlertSound = result.AlertSound['url'];
                try{
                    console.log(`playing sound ${AlertSound}`)
                    // audio_file = chrome.runtime.getURL("assets/audio/audio-1.mp3")
                    alert_sound = new Audio(AlertSound);
                    alert_sound.volume = AlertSoundVolume;
                    alert_sound.loop = true;
                    alert_sound.play();
                }
                catch(e){
                    console.log(e)
                }
            });
        });
    }
}
window.addEventListener("load", function() {
    chrome.storage.sync.get(['ExtensionEnabled', 'NotificationEnabled', 'AlertSoundEnabled', 'AlertSound', 'AlertSoundVolume', 'InactiveAlert', 'refreshInterval'], function (result) {
        if (result.ExtensionEnabled == true) {
            $('#extension_enabled').prop('checked', true);
            $('#extension_enabled-label').html("Disable the Extension");
            $("#extension_enabled-info").html('The extension is enabled.');
        } else {
            $('#extension_enabled').prop('checked', false);
            $('#extension_enabled-label').html("Enable the Extension");
            $("#extension_enabled-info").html('The extension is disabled.');
        }
        
        if (result.NotificationEnabled == true) {
            $('#notification_enabled').prop('checked', true);
            $('#test-notification-btn').prop('disabled', false);
            $('#notification_enabled-label').html("Disable the Notification");
            $("#notification_enabled-info").html(`You'll be nitified when a question is available in your Chegg Live Expert Q&A.`);
        } else {
            $('#notification_enabled').prop('checked', false);
            $('#test-notification-btn').prop('disabled', true);
            $('#notification_enabled-label').html("Enable the Notification");
            $("#notification_enabled-info").html(`You'll not nitified when a question is available in your Chegg Live Expert Q&A.`);
        }

        if (result.InactiveAlert == true) {
            $('#inactive_alert_enabled').prop('checked', true);
            $('#inactive_alert_enabled-label').html("Disable the Inactive Alert");
            $("#inactive_alert_enabled-info").html('An alert will send to you if you not solved question in Chegg Expert Q&A in 48 hours.');
        } else {
            $('#inactive_alert_enabled').prop('checked', false);
            $('#inactive_alert_enabled-label').html("Enable the Inactive Alert");
            $("#inactive_alert_enabled-info").html('No in-active alert will be send to you.');
        }

        if (result.AlertSoundEnabled == true) {
            $('#alertsound_enabled').prop('checked', true);
            $('#alertsound_enabled-label').html("Disable the Alert Sound");
            $("#alertsound_enabled-info").html('A sound will be payed when a question is available in your Chegg Live Expert Q&A.');
        } else {
            $('#alertsound_enabled').prop('checked', false);
            $('#alertsound_enabled-label').html("Enable the Alert Sound");
            $("#alertsound_enabled-info").html('No sound will be payed when a question is available in your Chegg Live Expert Q&A.');
        }

        if (result.AlertSound) {
            $(`.alert_sound-dropdown-item[data-value='${result.AlertSound['name']}']`).addClass('selected');
            if(result.AlertSound['custom_audio'] == true){
                $("#alert_sound-input").val(result.AlertSound['url']);
                $("#alert_sound-input").prop('disabled', false);
                $("#alert_sound-btn").prop('disabled', false);
            }
            else{
                sound_selected = $(`.alert_sound-dropdown-item[data-value='${result.AlertSound['name']}']`).html();
                $("#alert_sound-input").val(sound_selected);
                $("#alert_sound-input").prop('disabled', true);
                $("#alert_sound-btn").prop('disabled', true);
            }
        } else {
            $("#alert_sound-input").val("");
            $("#alert_sound-input").prop('disabled', false);
            $("#alert_sound-btn").prop('disabled', false);
        }

        if (result.AlertSoundVolume) {
            $('#alert_audio_volume').val(result.AlertSoundVolume);
        } else {
            $('#alert_audio_volume').val(1);
        }

        if (result.refreshInterval) {
            $('#refresh_interval').val(result.refreshInterval);
            $("#refresh_interval-text").html(result.refreshInterval);
        } 
    });
    
    document.getElementById('extension_enabled').addEventListener('change', function(event){
        let ExtensionEnabled;
        if (event.currentTarget.checked) {
            ExtensionEnabled = true;
            $('#extension_enabled-label').html("Disable the Extension");
            $("#extension_enabled-info").html('The extension is enabled.');
        } else {
            ExtensionEnabled = false;
            $('#extension_enabled-label').html("Enable the Extension");
            $("#extension_enabled-info").html('The extension is disabled.');
        }
        chrome.storage.sync.set({ 'ExtensionEnabled': ExtensionEnabled }, function() {
            console.log('Settings saved!');
        });
    });

    document.getElementById('notification_enabled').addEventListener('change', function(event){
        let NotificationEnabled;
        if (event.currentTarget.checked) {
            NotificationEnabled = true;
            $('#test-notification-btn').prop('disabled', false);
            $('#notification_enabled-label').html("Disable the Notification");
            $("#notification_enabled-info").html(`You'll be nitified when a question is available in your Chegg Live Expert Q&A.`);
        } else {
            NotificationEnabled = false;
            $('#test-notification-btn').prop('disabled', true);
            $('#notification_enabled-label').html("Enable the Notification");
            $("#notification_enabled-info").html(`You'll not nitified when a question is available in your Chegg Live Expert Q&A.`);
        }
        chrome.storage.sync.set({ 'NotificationEnabled': NotificationEnabled }, function() {
            console.log('Settings saved!');
        });
    });

    document.getElementById('inactive_alert_enabled').addEventListener('change', function(event){
        let InactiveAlert;
        if (event.currentTarget.checked) {
            InactiveAlert = true;
            $('#inactive_alert_enabled-label').html("Disable the Inactive Alert");
            $("#inactive_alert_enabled-info").html('An alert will send to you if you not solved question in Chegg Expert Q&A in 48 hours.');
        } else {
            InactiveAlert = false;
            $('#inactive_alert_enabled-label').html("Enable the Inactive Alert");
            $("#inactive_alert_enabled-info").html('No in-active alert will be send to you.');
        }
        chrome.storage.sync.set({ 'InactiveAlert': InactiveAlert }, function() {
            console.log('Settings saved!');
        });
    });

    document.getElementById('alertsound_enabled').addEventListener('change', function(event){
        let AlertSoundEnabled;
        if (event.currentTarget.checked) {
            AlertSoundEnabled = true;
            $('#alertsound_enabled-label').html("Disable the Alert Sound");
            $("#alertsound_enabled-info").html(`A sound will be payed when a question is available in your Chegg Live Expert Q&A.`);
        } else {
            AlertSoundEnabled = false;
            $('#alertsound_enabled-label').html("Enable the Alert Sound");
            $("#alertsound_enabled-info").html(`No sound will be payed when a question is available in your Chegg Live Expert Q&A.`);
        }
        chrome.storage.sync.set({ 'AlertSoundEnabled': AlertSoundEnabled }, function() {
            console.log('Settings saved!');
        });
    });

    document.getElementById('refresh_interval-btn').addEventListener('click', function(event){
        let refreshInterval = $("#refresh_interval").val();
        if(Number(refreshInterval) < 10){
            refreshInterval = 10;
            $("#refresh_interval").val(refreshInterval);
        }
        $("#refresh_interval-text").html(refreshInterval);
        chrome.storage.sync.set({ 'refreshInterval': refreshInterval }, function() {
            console.log('Settings saved!');
        });
    });

    $('.alert_sound-dropdown-item').on('click', function(event){
        $('.alert_sound-dropdown-item').removeClass('selected');
        $(this).addClass('selected');
        let AlertSound = $(this).data('value');
        if(AlertSound != 'audio-custom'){
            $("#alert_sound-input").val($(this).html());
            $("#alert_sound-input").prop('disabled', true);
            $("#alert_sound-btn").prop('disabled', true);
            let sound = {
                'name': AlertSound,
                'url': chrome.runtime.getURL(`assets/audio/${AlertSound}.mp3`)
            }
            chrome.storage.sync.set({ 'AlertSound': sound }, function() {
                console.log('Settings saved!');
            });
            playAlertSound();
        }
        else{
            $("#alert_sound-input").val("");
            $("#alert_sound-input").prop('disabled', false);
            $("#alert_sound-btn").prop('disabled', false);
        }
    });
    document.getElementById('alert_sound-btn').addEventListener('click', function(event){
        let sound = {
            'name': $('.alert_sound-dropdown-item.selected').data('value'),
            'url': $("#alert_sound-input").val(),
            'custom_audio': true,
        }
        chrome.storage.sync.set({ 'AlertSound': sound }, function() {
            console.log('Settings saved!');
        });
        playAlertSound();
    });

    $('#alert_audio_volume').on('change', function(event){
        let AlertSoundVolume = $(this).val();
        chrome.storage.sync.set({ 'AlertSoundVolume': AlertSoundVolume }, function() {
            console.log('Settings saved!');
        });
        playAlertSound();
    });

    $("#alert_audio_volume-test").on('change', function(){
        playAlertSound();
    });

    $("#test-notification-btn").on('click', function(){
        if(notification_test == 'chegg_question_live'){
            notification_test = 'chegg_user_inactive';
            let title = `!!TEST NOTIFICATION!!\nHURRAY! New Question in Chegg!`;
            sent_notification = new Notification(title, {
                'body': "A Question available in your Chegg Live Expert Q&A Dashbord.",
                'tag': 'test_notification',
                'badge': chrome.runtime.getURL("assets/images/notification_badge.png"),
                'icon': chrome.runtime.getURL("assets/images/notification_icon.webp"),
                'image': chrome.runtime.getURL("assets/images/notification_image.png"),
                'vibrate': [2000],
                'renotify': true,
                'requireInteraction': true,
                'silent': false
            });
        }
        else{
            notification_test = 'chegg_question_live';
            chrome.storage.sync.get(['LastSubmission', 'InactiveAlert'], function(result){
                var title = '';
                var body = ''
                if (result.LastSubmission) {
                    let current = new Date();
                    let diff = ((current - result.LastSubmission)/1000)/3600;
                    if(diff >= 48){
                        title = '!!TEST NOTIFICATION!!\nALERT! You are inactive in Chegg Live Expert Q&A'
                        body = `Recently you've not solved any question in Chegg Expert Q&A.\nYou've last solved question at ${formatDateTime(result.LastSubmission)}.`
                    }
                }
                else{
                    title = '!!TEST NOTIFICATION!!\nALERT! No question solved in Chegg Live Expert Q&A'
                    body = `You've not solved any question in Chegg Expert Q&A`
                }
                if(title != '' && body != ''){
                    sent_notification = new Notification(title, {
                        'body': body,
                        'tag': 'test_notification',
                        'badge': chrome.runtime.getURL("assets/images/notification_badge.png"),
                        'icon': chrome.runtime.getURL("assets/images/notification_icon.webp"),
                        'image': chrome.runtime.getURL("assets/images/notification_image.png"),
                        'vibrate': [2000],
                        'renotify': true,
                        'requireInteraction': false,
                        'silent': false
                    });
                } 
            });
        }
    });
});
  
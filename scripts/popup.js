document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get(['ExtensionEnabled', 'NotificationEnabled', 'AlertSoundEnabled', 'refreshInterval'], function (result) {
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
            $('#notification_enabled-label').html("Disable the Notification");
            $("#notification_enabled-info").html(`You'll be nitified when a question is available in your Chegg Live Expert Q&A.`);
        } else {
            $('#notification_enabled').prop('checked', false);
            $('#notification_enabled-label').html("Enable the Notification");
            $("#notification_enabled-info").html(`You'll not nitified when a question is available in your Chegg Live Expert Q&A.`);
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
            $('#notification_enabled-label').html("Disable the Notification");
            $("#notification_enabled-info").html(`You'll be nitified when a question is available in your Chegg Live Expert Q&A.`);
        } else {
            NotificationEnabled = false;
            $('#notification_enabled-label').html("Enable the Notification");
            $("#notification_enabled-info").html(`You'll not nitified when a question is available in your Chegg Live Expert Q&A.`);
        }
        chrome.storage.sync.set({ 'NotificationEnabled': NotificationEnabled }, function() {
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

    document.getElementById('refresh_interval').addEventListener('keyup', function(event){
        let refreshInterval = $(this).val()
        $("#refresh_interval-text").html(refreshInterval);
        chrome.storage.sync.set({ 'refreshInterval': refreshInterval }, function() {
            console.log('Settings saved!');
        });
    });
});
  

function formatDateTime(dateTime)
{
    if(dateTime == '' || dateTime == undefined || dateTime == null || dateTime == 'None'){
        return `N/A`
    }
    else{
        var dt = new Date(dateTime);
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
}

document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get(['ExtensionEnabled', 'NotificationEnabled', 'AlertSoundEnabled', 'RefreshIntervalMin', 'RefreshIntervalMax', 'TotalQuestions', 'LastQuetionTime'], function (result) {
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

        if (result.RefreshIntervalMin) {
            $('#refresh_interval_min').val(result.RefreshIntervalMin);
            $("#refresh_interval_min-text").html(result.RefreshIntervalMin);
        } 
        if (result.RefreshIntervalMax) {
            $('#refresh_interval_max').val(result.RefreshIntervalMax);
            $("#refresh_interval_max-text").html(result.RefreshIntervalMax);
        }
        
        $("#total_questions").html(result.TotalQuestions);
        LastQuetionTime = formatDateTime(result.LastQuetionTime);
        $("#last_ques_fetched").html(LastQuetionTime);
        
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
        chrome.storage.sync.set({ 'ExtensionEnabled': ExtensionEnabled });
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
        chrome.storage.sync.set({ 'NotificationEnabled': NotificationEnabled });
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
        chrome.storage.sync.set({ 'AlertSoundEnabled': AlertSoundEnabled });
    });

    document.getElementById('refresh_interval_min').addEventListener('change', function(event){
        let refreshIntervalMin = $(this).val();
        let min_val = Number($(this).attr('min'));
        if(Number(refreshIntervalMin) < min_val){
            refreshIntervalMin = min_val;
            $("#refresh_interval_min").val(refreshIntervalMin);
        }
        let refreshIntervalMax = $('#refresh_interval_max').val();
        if(refreshIntervalMin > refreshIntervalMax){
            alert(`Minimum Refresh Interval can't be greater than Maximum Refresh Interval`);
        }
        else if(refreshIntervalMax - refreshIntervalMin < 10){
            alert(`Difference between Minimum Refresh Interval and Maximum Refresh Interval must be greater than or equal to 10`);
        }
        else if(refreshIntervalMin != '' && refreshIntervalMin != undefined && refreshIntervalMin != null){
            $("#refresh_interval_min-text").html(refreshIntervalMin);
            chrome.storage.sync.set({ 'RefreshIntervalMin': refreshIntervalMin });
        }
    });
    document.getElementById('refresh_interval_max').addEventListener('change', function(event){
        let refreshIntervalMax = $(this).val();
        let min_val = Number($(this).attr('min'));
        if(Number(refreshIntervalMax) < min_val){
            refreshIntervalMax = min_val;
            $("#refresh_interval_max").val(refreshIntervalMax);
        }
        let refreshIntervalMin = $('#refresh_interval_min').val();
        if(refreshIntervalMin > refreshIntervalMax){
            $(this).val('')
            alert(`Minimum Refresh Interval can't be greater than Maximum Refresh Interval`);
        }
        else if(refreshIntervalMax - refreshIntervalMin < 10){
            $(this).val('')
            alert(`Difference between Minimum Refresh Interval and Maximum Refresh Interval must be greater than or equal to 10`);
        }
        else if(refreshIntervalMax != '' && refreshIntervalMax != undefined && refreshIntervalMax != null){
            $("#refresh_interval_max-text").html(refreshIntervalMax);
            chrome.storage.sync.set({ 'RefreshIntervalMax': refreshIntervalMax });
        }
    });
});
  
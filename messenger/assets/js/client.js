;(function(){
	var 
		maxContacts = 1,
		lastMsgTime = 0,
		firstAccess = true,
		volume 		= false,
		addMessageFlag	= false;
		
	function setClientData(){
		//if (!maxContacts--) return;
		var data = {};
		if (firstAccess) {
			data = {
				title		: $('title').text(),
				referer		: document.referrer,
				firstConnect: ''
			};
		}
		
		$.post({
			url: root + 'messenger/api/client/', 
			data: data,
			dataType: 'json'
		}).always(function(responce){
			if (addMessageCallback(responce)) {
				setTimeout(function(){
					firstAccess = false;
					setClientData();
				}, 2000);
			}
		});
	}
	function addMessageCallback(responce){
		var addMessageFlagTmp = addMessageFlag;
		addMessageFlag = false;
		if (responce.error) {
			console.log('[' + timeleft() + '] ' + responce.error);
			return false;
		}
		if (responce.new_token) {
			console.log('[' + timeleft() + '] New token: ' + responce.new_token);
			return false;
		}
		if (responce.token) {
			console.log('[' + timeleft() + '] Token: ' + responce.token);
		}
		if (responce.messages) {
			if (addMessageFlagTmp) {
				if(responce.messages.length == 1) {
					storageMsg(responce.messages);
					return true;
				} else {
					var $last = $('#idialog-messages > *').last();
					$last.remove();
				}
			}
			var sharedMsg = [];
			responce.messages.forEach(function(message){
				showMessage(message.message, message.time, message.from);
				sharedMsg.push(message);
			});
			if (volume) play();
			
			
			if (firstAccess) {
				sharedMsg = sharedMsg.slice(-2);
			}
			
			storageMsg(sharedMsg);
			lastMsgTime = responce.messages[responce.messages.length - 1]['timestamp'];
			scrollMessageBlock('#idialog-messages');
		}
		return true;
	}
	
	function storageMsg(msg){
		localStorage.setItem('shared_msg', JSON.stringify(msg));
	}

	function addMessage(data){
		if (data.message.trim()) {
			$.post(root + 'messenger/api/client/', data, addMessageCallback, 'json');
		}
	}
	
	function play(){
		try {
			var promise = (new Audio(root + 'messenger/assets/audio/aay-quiet.wav')).play();
			if (promise !== undefined) {
			  promise.then(_ => {}).catch(error => {});
			}
		} catch (e) {}
	}
	

	$(function(){
		setClientData();
		
		$('#idialog-send').click(function(){
			$('#idialog-message').focus();
			var message = $('#idialog-message').val();
			if (!message.trim()) return false;
			var date = new Date();
			var data = {
				message: clearTags(message, 1000),
				time: setZero(date.getHours()) + ':' + setZero(date.getMinutes()),
				from: 'client'
			};
			showMessage(data.message, data.time, data.from);
			scrollMessageBlock('#idialog-messages');
			addMessageFlag = true;
			addMessage({message: data.message});
			$('#idialog-message').val('');
		});
		
		$('#idialog-mute').click(function(){
			volume = !volume;
			$(this).removeClass().addClass('icon-volume-'+(volume ? 'up' : 'off')+'-1');
		});
		
		window.addEventListener('storage', function(e){
			if (e.key == 'shared_msg') {
				var sharedMsg = localStorage.getItem('shared_msg');
				JSON.parse(sharedMsg).forEach(function(message){
					if (message.timestamp > lastMsgTime) {
						showMessage(message.message, message.time, message.from);
					}
				});
				scrollMessageBlock('#idialog-messages');
			}
		});
	});
})();
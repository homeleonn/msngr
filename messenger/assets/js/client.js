;(function(){
	class Client extends Messenger
	{
		generateListenData()
		{
			let data = {};
			if (this.firstAccess) {
				data = {
					title		: $('title').text(),
					referer		: document.referrer,
					first_connect: ''
				};
			}
			
			return data;
		}
		
		listenCallback(responce){
			let addMessageFlagTmp 	= this.addMessageFlag;
			this.addMessageFlag 	= false;
			
			if (!this.handleResponce(responce)) {
				return false;
			}
			
			if (responce.messages) {
				if (addMessageFlagTmp) {
					if(responce.messages.length == 1) {
						this.storageMsg(responce.messages);
						return true;
					} else {
						$('#idialog-messages > *').last().remove();
					}
				}
				var sharedMsg = [];
				responce.messages.forEach((message) => {
					this.showMessage(message.message, message.ts, message.from);
					sharedMsg.push(message);
				});
				this.play();
				
				
				if (this.firstAccess) {
					sharedMsg = sharedMsg.slice(-2);
				}
				
				this.storageMsg(sharedMsg);
				this.lastMsgTime = responce.messages[responce.messages.length - 1]['timestamp'];
				scrollMessageBlock('#idialog-messages');
			}
			
			return true;
		}
		
		storageMsg(msg){
			localStorage.setItem('shared_msg', JSON.stringify(msg));
		}
		
		send()
		{
			$('#idialog-message').focus();
			var message = $('#idialog-message').val();
			if (!message.trim()) {
				return false;
			}
			var data = {
				message: message,
				ts: 0,
				from: 'client'
			};
			this.showMessage(data.message, data.ts, data.from);
			scrollMessageBlock('#idialog-messages');
			this.addMessageFlag = true;
			this.addMessage({message: data.message});
			$('#idialog-message').val('');
		}
		
	}

	
	$(function(){
		let client = new Client;
		client.listen();
		
		$('#idialog-send').click(() => client.send());
		
		$('#idialog-mute').click(function(){
			client.volumeToggle()
			$(this).removeClass().addClass('icon-volume-'+(client.volume ? 'up' : 'off')+'-1');
		});
		
		window.addEventListener('storage', function(e){
			if (e.key == 'shared_msg') {
				var sharedMsg = localStorage.getItem('shared_msg');
				JSON.parse(sharedMsg).forEach(function(message){
					if (message.timestamp > lastMsgTime) {
						client.showMessage(message.message, message.ts, message.from);
					}
				});
				scrollMessageBlock('#idialog-messages');
			}
		});
	});
})();
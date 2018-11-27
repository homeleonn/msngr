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
		//client.listen();
		
		$('#idialog-init, #idialog-close').click(function(){
			$('#idialog-init, #idialog').toggle(200);
		});
		
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

// Phone mask
;(() => {
	$(() => {
		var 
			$phone = $('#phone-num input'),
			pname = [],
			mask = '(000) 000-00-00';
			
		$phone.on('keypress keyup', function(e){
			let valid = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete'];
			if (!(valid.indexOf(e.originalEvent.key) + 1))
				e.preventDefault();
		});
		
		$phone.keydown(function(e){
			setTimeout(() => {
				let 
					value = e.originalEvent.key,
					fullNum = '',
					j = 0,
					tmp,
					selection = false;
					
				if (['ArrowLeft', 'ArrowRight'].indexOf(e.originalEvent.key) + 1) {
					return;
				}
				
				if (value == 'Backspace' || value == 'Delete') {
					tmp = $phone.val().match(/\d/g);
					pname = tmp ? tmp : [];
					selection = $phone[0].selectionStart;
				} else if (!isNaN(+value)) {
					if ($phone.val()) {
						tmp = $phone.val().substr(0, $phone[0].selectionStart).match(/\d/g);
						if (tmp && tmp.length < pname.length) {
							selection = $phone[0].selectionStart + 1;
							let maskSplit = mask.split(''), maxCycles = 20;
							while (selection <= mask.length && isNaN(maskSplit[selection]) || maskSplit[selection] == ' ') {
								selection++;
								if (maxCycles-- < 0) break;
							}
						}
						if (!tmp && $phone[0].selectionStart != 1) {
							pname = [value];
						} else {
							pname.splice(tmp ? tmp.length : 0, 0, value);
						}
					} else {
						pname.push(value);
					}
				}
				
				mask.split('').forEach((s, i) => {
					if (s == " " || isNaN(+s)){
						fullNum += s;
					} else {
						if (pname[j] != undefined) {
							fullNum += pname[j++];
						} else {
							if (selection === false) {
								selection = i;
							}
							fullNum += '_';
						}
					}
				});
				$phone.val(fullNum);
				if (!selection) {
					selection = $phone.length;
				}
				if (selection == 1) {
					selection++;
				}
				$phone[0].setSelectionRange(selection, selection);
			}, 1);
		});
	});
})();
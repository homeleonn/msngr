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
					if(responce.messages.length == 1) { console.log(responce.messages);
						this.lastMsgTime = responce.messages[0]['ts'];
						this.storageMsg(responce.messages);
						return true;
					} else {
						this.removeLastMessage();
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
				this.lastMsgTime = responce.messages[responce.messages.length - 1]['ts'];
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
			let message = $('#idialog-message').val();
			if (!message.trim()) {
				return false;
			}
			
			if (this.firstAccess) {
				this.listen(() => this.sendHelper(message));	
			} else {
				this.sendHelper(message);
				
				if (this.getStop()) {
					setTimeout(() => {
						this.setStop(false);
						this.listen();
					}, this.listenTimeout);
				}
			}
		}
		
		sendHelper(message){
			let data = {
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
		
		checkToken(){
			let dbData = db();
			if (!dbData) {
				db({token: this.token});
			} else if (dbData.token != this.token){
				db({token: this.token});
				this.setStop(false);
			}
		}
		
	}
	
	function db(value)
	{
		let key = 'idialog';
		
		if (value == undefined) {
			return JSON.parse(localStorage.getItem(key));
		} else if (value == 'exit'){
			localStorage.removeItem(key);
		} else {
			localStorage.setItem(key, JSON.stringify(value));
		}
	}
	
	function ls(key, value){
		if (key == undefined) {
			return false;
		} else if (key == 'remove') {
			localStorage.removeItem(key);
		} else if (value == undefined){
			return JSON.parse(localStorage.getItem(key));
		} else {
			localStorage.setItem(key, JSON.stringify(value));
		}
	}
	
	var selfTab;
	class Tab
	{
		get()
		{
			let tabs = ls('tabs');
			
			return tabs ? tabs : [];
		}
		
		set(value = null, tabs1 = false){
			let tabs = tabs1 ? tabs1 : this.get();
			tabs.push(value)
			ls('tabs', tabs);
		}
		
		add()
		{
			let tabs = this.get();
			selfTab = tabs.length;
			this.set();
		}
		
		remove()
		{
			let tabs = this.get();
			if (tabs.length){
				tabs.splice(selfTab, 1);
				this.set('remove', tabs);
			}
		}
		
		delegate(client){
			let tabs = this.get(), max = 0;
				
			if (tabs[tabs.length - 1] != 'remove') {
				return;
			}
				
			tabs.forEach((item, i) => {
				if (!isNaN(item)) {
					if (item > max) {
						max = item;
					}
				}
			});
			
			if (selfTab == max){
				tabs.splice(tabs.length - 1, 1);
				ls('tabs', tabs);
				client.listen();
			}
		}
	}
	
	function max(arr){
		return Math.max.apply(null, arr);
	}
	
	
	
	$(function(){
		let client;//, tab = new Tab;
		
		// num tab
		//tab.add();
		
		function init(el){
			if (!client) {
				client = new Client;
			}
			
			if(el) {
				if (el.target.id == 'idialog-close') {
					client.setStop(true);
					db('exit');
				}
				// else if (!client.getStop()) {
					// client.setStop(false);
					// client.listen();
				// }
			}
			
			$('#idialog-init, #idialog').toggle(200);
		}
		
		$('#idialog-init, #idialog-close').click(init);
		
		let dbData = db();
		if (dbData && dbData.token) {
			init();
			client.listen();
		}
		
		
		$('#idialog-send').click(() => client.send());
		
		$('#idialog-mute').click(function(){
			client.volumeToggle();
			$(this).removeClass().addClass('icon-volume-'+(client.volume ? 'up' : 'off')+'-1');
		});
		
		
		
		window.addEventListener('storage', (e) => {
			if (client == undefined) {
				return;
			}
			
			if (e.key == 'shared_msg') {
				var sharedMsg = localStorage.getItem('shared_msg');
				JSON.parse(sharedMsg).forEach((message) => {
					if (message.ts > client.lastMsgTime) {
						client.lastMsgTime = message.ts;
						client.showMessage(message.message, message.ts, message.from);
					}
				});
				scrollMessageBlock('#idialog-messages');
			} else if (e.key == 'idialog') {
				client.setStop(true);
			} else if (e.key == 'tabs') {
				tab.delegate(client);
			}
		});
		
		window.addEventListener('beforeunload', () => {
			//tab.remove();
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
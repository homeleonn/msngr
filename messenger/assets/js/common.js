class Messenger
{
	constructor(type = 'client', maxContacts = 10)
	{
		this.type		 	= type;
		this.maxContacts 	= maxContacts;
		this.listenTimeout 	= 10000;
		this.listenTimer 	= false;
		this.lastMsgTime 	= 0;
		this.firstAccess 	= true;
		this.volume 		= true;
		this.addMessageFlag	= false;
		this.stop			= false;
		this.token			= Math.random();
	}
	
	listen(callback = false)
	{
		// if (this.isExpiredCountContacts()) {
			// return;
		// }
			
		try {
			this.checkToken();
		} catch(e){}
		
		
		$.getJSON(messengerRoot + `messenger/api/${this.type}/`, this.generateListenData()).always((responce) => 
		{
			if (this.listenCallback(responce)) {
				this.firstAccess = false;
				
				if (callback) {
					callback()
				}
				console.log(2)
				this.listenTimer = setTimeout(() =>
				{
					if (!this.getStop()) {
						this.listen();
					}
				}, this.listenTimeout);
			}
		});
	}
	
	handleResponce(responce){
		if (typeof responce.error == "string") {
			if (responce.error == 'spam') {
				this.removeLastMessage();
				alert('Вы отправляете сообщения слишком часто! Подождите минутку.');
			}
			return false;
		}
		if (responce.new_token) {
			console.log('[' + timeleft() + '] New token: ' + responce.new_token);
			return false;
		}
		if (responce.token) {
			console.log('[' + timeleft() + '] Token: ' + responce.token);
		}
		
		return true;
	}
	
	getStop(){
		return this.stop;
	}
	
	setStop(flag){
		if (flag === true) {
			clearTimeout(this.listenTimer);
		}
		
		this.stop = flag;
	}
	
	play(){
		if (!this.volume || this.firstAccess) return;
		try {
			var promise = (new Audio(messengerRoot + 'messenger/assets/audio/aay-quiet.wav')).play();
			if (promise !== undefined) {
			  promise.then(_ => {}).catch(error => {});
			}
		} catch (e) {}
	}
	
	volumeToggle()
	{
		this.volume = !this.volume;
	}
	
	isExpiredCountContacts()
	{
		return this.maxContacts-- <= 0 ? true : false;
	}
	
	showMessage(message, ts, from){
		let date = new Date();
		if (ts !== 0) {
			date.setTime(ts * 1000);
		}
		let time = setZero(date.getHours()) + ':' + setZero(date.getMinutes())
		$('#idialog-messages').append(`
			<div class="idialog-` + from + `">
				<div class="idialog-message-content">
					<div class="idialog-message-time">` + time + `</div>
					` + message + `
				</div>
			</div>
		`);
	}
	
	addMessage(data){
		if (data.message.trim()) {
			$.post(messengerRoot + 'messenger/api/' + this.type + '/', data, (responce) => this.listenCallback(responce), 'json');
		}
		$('#idialog-message').val('');
	}
	
	removeLastMessage(){
		$('#idialog-messages > *').last().remove();
	}
	
	cut(text, len = 255){
		return text.substr(0, len);
	}
}



function toggleLoad(){
	$('#load').toggleClass('none');
	setTimeout(function(){$('#load').toggleClass('go')}, 20);
}

function isset (varName, context = window) {
	return typeof (context[varName]) != 'undefined';
}

function isUndefined (varName) {
	return varName == undefined;
}


function timeleft(sec = false){
	var sec = sec ? sec : performance.now() / 1000;
	var h = Math.floor(sec / 3600);
	h = setZero(h);
	sec = sec % 3600;
	var m = Math.floor(sec / 60);
	m = setZero(m);
	sec = sec % 60;
	var s = Math.floor(sec);
	s = setZero(s);
	
	return h + ':' + m + ':' + s;
}

function setZero(n){
	return n >= 10 ? n : '0' + n;
}

function clearTags(text, cut = 1000){
	var replace 	= ['<','>'];
	var replacement = ['&lt;','&gt;'];
	text = text.substr(0, cut).replace(/(<)/gi, '&lt;');
	return text.replace(/(>)/gi, '&gt;');
}


function scrollMessageBlock(el){
	if (!$(el).length) return;
	setTimeout(function(){
		$(el).scrollTop($(el).prop('scrollHeight'));
	}, 1);
}

function date(ts){
	let date = new Date();
	date.setTime(ts * 1000);
	return setZero(date.getHours()) + ':' + setZero(date.getMinutes());
}


function fnOnTimeout(callback, delay){
	var timeout = false,
		delay = delay || 1000;
	
	return function(){
		if(!timeout){
			timeout = true;
			setTimeout(function(){
				callback();
				timeout = false;
			}, delay);
		}
	}
}

function play(volume = false){
	if (!volume) return;
	try {
		var promise = (new Audio(messengerRoot + 'messenger/assets/audio/aay-quiet.wav')).play();
		if (promise !== undefined) {
		  promise.then(_ => {}).catch(error => {});
		}
	} catch (e) {}
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
function cl(){
	console.log(new Error().stack);
	console.log.apply(console, arguments);return;
}

$(function(){
	$('img[alt="www.000webhost.com"]').closest('div').remove();
	
		
	$('#idialog-message').keypress(function(e){
		if (e.originalEvent.keyCode == 13) {
			$('#idialog-send').click();
		}
	});
});
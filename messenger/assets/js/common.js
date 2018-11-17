function showMessage(message, ts, from){
	let date = new Date();
	if (ts === 0) {
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

function timeleft(){
	var sec = performance.now() / 1000;
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

$(function(){
	$('img[alt="www.000webhost.com"]').closest('div').remove();
	
		
	$('#idialog-message').keypress(function(e){
		if (e.originalEvent.keyCode == 13) {
			$('#idialog-send').click();
		}
	});
});
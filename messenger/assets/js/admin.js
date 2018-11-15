;(function(){
	var 
		maxContacts = 1,
		lastMsgTime = 0,
		firstAccess = true
		volume 		= false;
		
	function listenNewMessages(){
		//if (!maxContacts--) return;
		var data = {};
		if (firstAccess) {
			data = {
				firstConnect: ''
			};
		}
		
		$.post({
			url: root + 'messenger/api/admin/', 
			data: data,
			dataType: 'json'
		}).always(function(responce){
			if (addMessageCallback(responce)) {
				setTimeout(function(){
					firstAccess = false;
					listenNewMessages();
				}, 2000);
			}
		});
	}
		
	$(function(){
		listenNewMessages();
		$('#idialog-clients').on('click', 'li', function(){
			document.location.href = "?client=" + $(this).data('id');
		});
		
		$('#mobile-nav').click(function(){
			$('#idialog-clients').toggleClass('open');
		});
		
		$('body').click(function(e){
			var historyId = 'idialog-show-history'
			var jqHistory = '#' + historyId + ' + div'
			if(e.target.id != historyId){
				$(jqHistory).hide();
			} else {
				$(jqHistory).toggle();
			}
		});
		
		$('#idialog-send').click(function(){
			$('#idialog-message').focus();
			var sendData = {message: $('#idialog-message').val()};
			if (clientId) sendData.client_id = clientId;
			addMessage(sendData);
		});
		
		
		
		$stats = $('#idialog-client-info-stats');
		if ($stats.length) {
			minOnSite = +$stats.text().match(/(\d+) мин/)[1];
			setInterval(function(){
				$stats.text($stats.text().replace(/(\d+) мин/, (minOnSite += 1) + ' мин'));
			}, 60 * 1000);
		}
		
		
		scrollMessageBlock('#idialog-messages');
		
		resize();
		var resizeListen = fnOnTimeout(resize, 300);
		$(window).resize(function(){
			resizeListen();
		});
	});
	
	var minOnSite, $stats;
	
	function resize(){
		var $dlgMsgWrp = $('#idialog-messages-wrapper');
		if (!$dlgMsgWrp.length) return;
		var wh = $(window).height();
		$dlgMsgWrp.css('height', wh - $dlgMsgWrp.offset().top);
	}


	function addMessageCallback(responce){
		if (responce.error) {
			console.log(responce.error);
			return false;
		}
		if (responce.new_token) {
			console.log('[' + timeleft() + '] New token: ' + responce.new_token);
			return false;
		}
		if (responce.token) {
			console.log('[' + timeleft() + '] Token: ' + responce.token);
		}
		if (responce.clients) {
			var $clientBlock, messageGlob;
			for (client in responce.clients) {
				if(typeof responce.clients[client].messages == "undefined") continue;
				var focusClient = $('#idialog-messages').data('id') == client;
				responce.clients[client].messages.forEach(function(message){
					messageGlob = message;
					if(focusClient)
						showMessage(message.message, message.time, message.from);
				});	
				$clientBlock = $('[data-id="'+client+'"]');
				if (!$clientBlock.length) {
					var newClientItem = getNewClientItem(client);
					if (!$('#idialog-clients > ul > li').length) {
						$('#idialog-clients > ul').html(newClientItem);
					} else {
						$('#idialog-clients > ul').append(newClientItem);
					}
					$clientBlock = $('#idialog-clients > ul > li[data-id="'+client+'"]');
				}
				$clientBlock.find('.idialog-lastmsg-time').text(messageGlob.time);
				$clientBlock.find('.idialog-msg').text((messageGlob.from == 'advisor' ? 'я: ' : '') + messageGlob.message);
			}
			scrollMessageBlock('#idialog-messages');
		}
		return true;
	}

	function addMessage(data){
		if (data.message.trim()) {
			$.post(root + 'messenger/api/admin/', data, addMessageCallback, 'json');
		}
		$('#idialog-message').val('');
	}
	
	
	
	function getNewClientItem(clientId){
		
		return `
			<li title="Перейти к диалогу с Клиент `+clientId+`" data-id="`+clientId+`">
				<div class="idialog-avatar">`+clientId+`</div>
				<div class="idialog-msg-wrapper">
					<div class="col-md-8 idialog-client-name">Клиент `+clientId+`</div>
					<div class="col-md-4 right idialog-lastmsg-time"></div>
					<div class="idialog-msg"></div>
				</div>
			</li>
		`;
	}
})();
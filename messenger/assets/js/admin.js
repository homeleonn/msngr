;(function(){
	let 
		maxContacts 	= 10,
		lastMsgTime 	= 0,
		firstAccess 	= true,
		volume 			= false,
		durationTimer 	= false,
		needData		= false;
		titleToggleTimer= false,
		transition		= false,
		window['clients'] 	= {};
		
	
	$(function(){
		listenNewMessages();
		// $('#idialog-clients').on('click', 'li', function(){
			// document.location.href = "?client=" + $(this).data('id');
		// });
		
		$('#mobile-nav').click(function(){
			$('#idialog-clients').toggleClass('open');
		});
		
		$('body').click(function(e){
			var historyId = 'idialog-show-history';
			
			if(e.target.id != historyId){
				$('#dlg-history-list').hide();
			} else {
				$('#dlg-history-list').toggle();
			}
		});
		
		let docFocusAction = fnOnTimeout(function(){
			if (titleToggleTimer) {
				clearInterval(titleToggleTimer);
				titleToggleTimer = false;
			}
		});
		$(document).on('click hover mousemove focus', docFocusAction);
		
		$('#idialog-send').click(function(){
			$('#idialog-message').focus();
			var sendData = {message: $('#idialog-message').val()};
			if (clientId) sendData.client_id = clientId;
			addMessage(sendData);
		});
		
		scrollMessageBlock('#idialog-messages');
		
		resize();
		var resizeListen = fnOnTimeout(resize, 300);
		$(window).resize(function(){
			resizeListen();
		});
	});
	
	function listenNewMessages(){
		if (!maxContacts--) return;
		let data = {};
		
		if (clientId) {
			data.client_id = clientId;
		}
			
		if (firstAccess) {
			data.first_connect = '';
		}
		
		$.get({
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
	
	function resize(){
		var $dlgMsgWrp = $('#idialog-messages-wrapper');
		if (!$dlgMsgWrp.length) return;
		var wh = $(window).height();
		$dlgMsgWrp.css('height', wh - $dlgMsgWrp.offset().top);
	}


	function addMessageCallback(responce){
		if (!handleResponce(responce)) return false;
			
		if (responce.clients) {//console.log(clients);
			for (let client in responce.clients) {
				let 
					selectedClient 	= clientId == client,
					clnt 			= responce.clients[client];
				
				clnt.id = client;
				//console.log(clnt);
				updateClient(clnt, selectedClient);
				
				if (selectedClient) {
					handleClient(clientId);
				}
			}
			//console.log(clients);
		} else if (transition){
			handleClient(clientId);
		}
		return true;
	}
	
	function handleClient(clientId){
		setSelectedClientInfo(clients[clientId]);
		if(isset('messages', clients[clientId])) {
			showMessages(clients[clientId].messages);
		}
	}
	
	function showMessages(messages){
		messages.forEach(function(message){
			showMessage(message.message, message.ts, message.from);
		});
		scrollMessageBlock('#idialog-messages');
		
		if (!firstAccess && messages[messages.length - 1].from == 'client') {
			if (!document.hasFocus()) {
				play();
				//titleToggle();
			}
		}
	}
	
	// function titleToggle(){
		// let 
			// title = $('title').text();
			// flag = false;
		// titleToggleTimer = setInterval(function(){
			// $('title').text(flag  ? title : '*** Новое сообщение');
			// flag = !flag;
		// }, 2000);
	// }
	
	
	function updateClient(client, selectedClient){
		let 
			dialog_clients 	= '#idialog-clients',
			$clientBlock 	= $('#idialog-clients [data-id="'+client.id+'"]'),
			newClient 		= isUndefined(clients[client.id]),
			lastMSg;
		
		if (newClient || (selectedClient && needData)) {
			clients[client.id] = client;
		} else {
			for (let prop in client) {
				//console.log(prop, client[prop], Array.isArray(client[prop]));
				if (!isUndefined(clients[client.id][prop])) {
					if (Array.isArray(client[prop])) {
						clients[client.id][prop] = clients[client.id][prop].concat(client[prop]);
					} else if(clients[client.id][prop] != client[prop]) {
						clients[client.id][prop] = client[prop];
					}
				} else {
					clients[client.id][prop] = client[prop];
				}
			}
		}
		
		if (newClient) {
			let newClientItem = getNewClientItem(client.id);
			let append = $(dialog_clients + ' > ul > li').length;
			$(dialog_clients + ' > ul')[append ? 'append' : 'html'](newClientItem);
			$clientBlock = $(dialog_clients + ' > ul > li[data-id="'+client.id+'"]');
		}
		
		if (isset('messages', client)) {
			lastMSg = client.messages[client.messages.length - 1];
		} else if(newClient) {
			lastMSg = {
				ts: false,
				from: 'advisor',
				message: 'Здравствуйте, могу ли я Вам чем-то помочь?'
			};
		}
		
		if (!isUndefined(lastMSg)) {
			$clientBlock.find('.idialog-lastmsg-time').text(lastMSg.ts ? date(lastMSg.ts) : '-');
			$clientBlock.find('.idialog-msg').text((lastMSg.from == 'advisor' ? 'я: ' : '') + lastMSg.message);
		}
	}

	function addMessage(data){
		if (data.message.trim()) {
			$.post(root + 'messenger/api/admin/', data, addMessageCallback, 'json');
		}
		$('#idialog-message').val('');
	}
	
	function handleResponce(responce){
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
		
		return true;
	}
	
	
	function getNewClientItem(clientId){
		
		return `
			<li class="dlg" title="Перейти к диалогу с Клиент `+clientId+`" data-id="`+clientId+`">
			
				<div class="idialog-avatar">`+clientId+`</div>
				<div class="idialog-msg-wrapper">
					<div class="col-md-8 idialog-client-name">Клиент `+clientId+`</div>
					<div class="col-md-4 right idialog-lastmsg-time"></div>
					<div class="idialog-msg"></div>
				</div>
			</li>
		`;
	}
	
	function setHistory(history){
		if (!history) return;
		let 
			s 		= '',
			count 	= history.length,
			last	= history[count - 1];
		
		history.forEach(function(item){
			s += `<li><span>`+(count--)+`)`+date(item.ts)+`</span> <a href="`+item.url+`" target="_blank">`+item.title+`</a></li>`;
		});
		
		$('#dlg-client-history-caption #dlg-h-time').text(date(last.ts));
		$('#dlg-client-history-caption > a').attr({'href': last.url}).text(last.title);
		$('#dlg-client-history-caption #dlg-h-count').text('( '+history.length+' )');
		$('#idialog-client-history ul').html(s);
	}
	
	function setClientInfo(client){
		if(!isset('history', client)) return; 
		let 
			date 		= new Date(),
			minOnSite 	= Math.floor((date.getTime() / 1000 - client.history[0].ts) / 60);
		
		$('#idialog-client-info .idialog-avatar').text(client.id);
		$('#idialog-client-info-name').text('Клиент ' + client.id);
		$('#idialog-client-info-referer').html(client.referer);
		$('#idialog-client-info-stats').text('На сайте ' + minOnSite + ' мин., просмотрено страниц ' + client.history.length);
		$('#idialog-client-info-geo').text(client.geo + ', IP адрес ' + client.ip);
		minOnSiteCounter();
	}
	
	function setSelectedClientInfo(client){
		$('#idialog-messages-wrapper, #idialog-client-info').removeClass('none');
		$('#idialog-messages').data('id', client.id).html('');
		setHistory(client.history);
		setClientInfo(client);
	}
	
	function minOnSiteCounter(){
		clearInterval(durationTimer);
		let $stats = $('#idialog-client-info-stats');
		if ($stats.length) {
			let minOnSite = +$stats.text().match(/(\d+) мин/)[1];
			durationTimer = setInterval(function(){
				$stats.text($stats.text().replace(/(\d+) мин/, (minOnSite += 1) + ' мин'));
			}, 60 * 1000);
		}
	}
	
	
	// without reload
	window.onpopstate = function(event) {
		console.log(document.location.href);
		go(document.location.href, false, true);
	};
	
	$(function(){
		// $('body').on('click', 'li.dlg', function(e){
			// e.preventDefault();
			// go($(this).attr('href'), $(this).data('request'));
		// });
		
		$('#idialog-clients').on('click', 'li', function(){
			let 
				clientId = $(this).data('id'),
				data = {};
			if (clientId == window.clientId) return;
			window.clientId = clientId;
			
			if (isUndefined(clients[clientId]['geo'])) {
				data.need_data = '';
				needData = true;
			} else {
				needData = false;
			}
			go('?client_id=' + clientId, data);
		});
	});
	
	function go(href, data = false, replace = false){
		let 
			load 			= false,
			toggleLoadFlag 	= false;
			
		load = setTimeout(function(){
			toggleLoadFlag = true;
			toggleLoad();
		}, 500);
		
		transition = true;
		
		$.get({
			url: href, 
			data: data ? data : {},
			dataType: 'json'
		}).always(function(responce){
			//console.log(responce);
			history[replace ? 'replaceState' : 'pushState'](null, null, href);
			clearTimeout(load);
			if (toggleLoadFlag && responce.statusText != 'error') toggleLoad();
			addMessageCallback(responce);	
			transition = false;
		});
		
	}
})();
class Advisor extends Messenger
{
	constructor()
	{
		super('admin');
		
		this.listenTimeout		= 2000;
		this.durationTimer 		= false,
		this.needData			= false,
		this.titleToggleTimer	= false,
		this.transition			= false,
		this.clients 			= {};
	}
	
	generateListenData()
	{
		let data = {};
		
		if (this.firstAccess) {
			data.first_connect = '';
		}
		
		if (this.clientId) {
			data.client_id = clientId;
		}
		
		return data;
	}
	
	listenCallback(responce){
		if (!this.handleResponce(responce)) return false;
			
		if (responce.clients) {//console.log(clients);
			for (let client in responce.clients) {
				let 
					selectedClient 	= window.clientId == client,
					clnt 			= responce.clients[client];
				
				clnt.id = client;
				//console.log(clnt);
				this.updateClient(clnt, selectedClient);
				
				if (selectedClient) {
					this.handleClient(window.clientId);
				}
			}
			//console.log(clients);
		} else if (this.transition){
			this.handleClient(window.clientId);
		}
		return true;
	}
	
	send()
	{
		$('#idialog-message').focus();
		let sendData = {message: $('#idialog-message').val()};
		
		if (clientId) {
			sendData.client_id = clientId;
		}
		
		this.addMessage(sendData);
	}
	
	

	handleClient(clientId){
		this.setSelectedClientInfo(this.clients[clientId]);
		if(isset('messages', this.clients[clientId])) {
			this.showMessages(this.clients[clientId].messages);
		}
	}
	
	showMessages(messages){
		messages.forEach((message) => {
			this.showMessage(message.message, message.ts, message.from);
		});
		scrollMessageBlock('#idialog-messages');
		
		if (!this.firstAccess && messages[messages.length - 1].from == 'client') {
			if (!document.hasFocus()) {
				this.play();
				//titleToggle();
			}
		}
	}
	
	updateClient(client, selectedClient){
		let 
			dialog_clients 	= '#idialog-clients',
			$clientBlock 	= $('#idialog-clients [data-id="'+client.id+'"]'),
			newClient 		= isUndefined(this.clients[client.id]),
			lastMSg;
		
		if (newClient || (selectedClient && this.needData)) {
			this.clients[client.id] = client;
		} else {
			for (let prop in client) {
				//console.log(prop, client[prop], Array.isArray(client[prop]));
				if (!isUndefined(this.clients[client.id][prop])) {
					if (Array.isArray(client[prop])) {
						this.clients[client.id][prop] = this.clients[client.id][prop].concat(client[prop]);
					} else if (this.clients[client.id][prop] != client[prop]) {
						this.clients[client.id][prop] = client[prop];
					}
				} else {
					this.clients[client.id][prop] = client[prop];
				}
			}
		}
		
		if (newClient) {
			let newClientItem = this.getNewClientItem(client.id);
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
	
	getNewClientItem(clientId){
		
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
	
	setHistory(history){
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
	
	setClientInfo(client){
		if(!isset('history', client)) return; 
		let 
			date 		= new Date(),
			minOnSite 	= Math.floor((date.getTime() / 1000 - client.history[0].ts) / 60);
		
		$('#idialog-client-info .idialog-avatar').text(client.id);
		$('#idialog-client-info-name').text('Клиент ' + client.id);
		$('#idialog-client-info-referer').html(client.referer);
		$('#idialog-client-info-stats').text('На сайте ' + minOnSite + ' мин., просмотрено страниц ' + client.history.length);
		$('#idialog-client-info-geo').text(client.geo + ', IP адрес ' + client.ip);
		this.minOnSiteCounter();
	}
	
	setSelectedClientInfo(client){
		$('#idialog-messages-wrapper, #idialog-client-info').removeClass('none');
		$('#idialog-messages').data('id', client.id).html('');
		this.setHistory(client.history);
		this.setClientInfo(client);
	}
	
	minOnSiteCounter(){
		clearInterval(this.durationTimer);
		let $stats = $('#idialog-client-info-stats');
		if ($stats.length) {
			let minOnSite = +$stats.text().match(/(\d+) мин/)[1];
			this.durationTimer = setInterval(function(){
				$stats.text($stats.text().replace(/(\d+) мин/, (minOnSite += 1) + ' мин'));
			}, 60 * 1000);
		}
	}
	
	selectClient(el)
	{
		let 
			clientId = $(el).data('id'),
			data = {};
		if (clientId == window.clientId) return;
		window.clientId = clientId;
		
		if (isUndefined(this.clients[clientId]['geo'])) {
			data.need_data = '';
			this.needData = true;
		} else {
			this.needData = false;
		}
		this.go('?client_id=' + clientId, data);
	}
	
	go(href, data = false, replace = false){
		// let 
			// load 			= false,
			// toggleLoadFlag 	= false;
			
		// load = setTimeout(function(){
			// toggleLoadFlag = true;
			// toggleLoad();
		// }, 500);
		
		this.transition = true;
		
		$.getJSON(href, data ? data : {}).always((responce) => 
		{
			//console.log(responce);
			history[replace ? 'replaceState' : 'pushState'](null, null, href);
			//clearTimeout(load);
			// if (toggleLoadFlag && responce.statusText != 'error') toggleLoad();
			this.listenCallback(responce);	
			this.transition = false;
		});
	}
}

;(function(){
	$(function(){
		let advisor = new Advisor;
		advisor.listen();
		
		$('#idialog-clients').on('click', 'li', function() {advisor.selectClient(this)});
		
		$('#idialog-send').click(() => advisor.send());
		
		scrollMessageBlock('#idialog-messages');
		
		resize();
		var resizeListen = fnOnTimeout(resize, 300);
		$(window).resize(function(){
			resizeListen();
		});
		
		$('#mobile-nav').click(function(){
			$('#idialog-clients').toggleClass('open');
		});
		
		$('body').click(function(e){
			$('#dlg-history-list')[e.target.id != 'idialog-show-history' ? 'hide' : 'toggle']();
		});
		
		
		// let docFocusAction = fnOnTimeout(function(){
			// if (titleToggleTimer) {
				// clearInterval(titleToggleTimer);
				// titleToggleTimer = false;
			// }
		// });
		
		// переделать. сделать иконку истории вместо стрелки и показывать при наведении, закрывать при отведении когда пройдет 1 сек
		//$(document).on('click hover mousemove focus', docFocusAction);
		
	});
	
	function resize(){
		var $dlgMsgWrp = $('#idialog-messages-wrapper');
		if (!$dlgMsgWrp.length) return;
		var wh = $(window).height();
		$dlgMsgWrp.css('height', wh - $dlgMsgWrp.offset().top);
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
	
	
	// without reload
	window.onpopstate = function(event) {
		console.log(document.location.href);
		go(document.location.href, false, true);
	};
})();
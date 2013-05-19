var debug = document.location.href.indexOf('localhost') >= 0;

function App(){
	$('#loader').show();
	this.db  = null;
	this.bindEvents(this);
	this.initDB();
}

App.run = function(){
	return new App();
}

App.prototype.initDB = function() {
	this.db = new Database('./db/dico.db3');
	var that = this;
	this.db.executeS('SELECT count(*) as nb FROM dico' , function(tx , results){
		debug && console.log(results.rows.item(0)['nb']);
		$('#loader').hide();
	} , function(err){
		that.loadDump(function(){
			$('#loader').hide();
		} , function(prct){
			$('#lblprogress').html(prct);
		});
	});
};

App.prototype.loadDump = function(callback , process) {
	var that = this;
	$.get('db/dump.sql' , function(queries){
		query = queries.split('\n');
		that.loadDump_next(query , 0 , callback , process);
	});
};

App.prototype.loadDump_next = function(queries , index , callback , process) {
	var that = this;
	process(index + '/' + queries.length);
	if(index >= query.length){
		callback();
		return;
	}
	this.db.execute(queries[index] , function(){
		that.loadDump_next(queries , ++index , callback , process);
	});
};


App.prototype.bindEvents = function(app) {
	$('#btnsearch').click(function(){
		app.search();
	});
	$('#mot').keydown(function(evt){
		if(evt.keyCode == 13){
			app.search();
		}
	});
};

App.prototype.search = function() {
	$('#loader').show();
	var word = $('#mot').val();
	var whereStatement = " WHERE grec LIKE '" + $('input[name=radsearch]:checked').val().replace('?' , word) + "'"
		+ " OR francais LIKE '" + $('input[name=radsearch]:checked').val().replace('?' , word) + "'"
		+ " OR gr LIKE '" + $('input[name=radsearch]:checked').val().replace('?' , word) + "'"
		+ " OR fr LIKE '" + $('input[name=radsearch]:checked').val().replace('?' , word) + "'";
	var querySelect = 'SELECT * FROM dico' + whereStatement + ' LIMIT 0,30';
    this.db.executeS(querySelect , function(tx, results){
    	debug && console.log(results);
		var tableau = '';
		if(results.rows.length == 0){
			tableau+= '<tr><td colspan="2" style="font-size:50px;color:red;text-align:center;">No result</td></tr>';
		}else {
			for (var i=0; i<results.rows.length; i++) {
				var row = results.rows.item(i);
				tableau+= '<tr><td>' + row['grec'] + '</td><td>' + row['francais'] + '</td></tr>';
			}
		}
		$('#tableau').html(tableau);
		$('#loader').hide();
    });
};
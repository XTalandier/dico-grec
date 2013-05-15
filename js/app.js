var db;
var query  = [];
var update = false;
$(document).ready(function(){
	$('#btnsearch').click(function(){
		search_words();
	});
	$('#mot').keydown(function(evt){
		if(evt.keyCode == 13){
			search_words();
		}
	});
	$('#btnreload').click(function(){
		if(confirm('Sure ?')){
			$('#loader').show();
			update = true;
			load_db();
		}
	});
	load_db();
});


function load_db(){
	try {
		db = openDatabase("./db/dico.db3", "1.0", "HTML5 Database API example" , 2 * 1024 * 1024 * 1024 *1024);
		execQuery('SELECT count(*) as nb FROM dico;', function(hasError , results){
			execQuery(update ? 'DROP TABLE dico;' : 'SELECT 1;', function(hasError , results){
				if(update){
					$.get('db/dump.sql' , function(queries){
						query = queries.split('\n');
						nextImport(0);
					});
				}else {
					$('#loader').hide();
				}
			});
		});
	}catch(ex){
		alert(ex);
	}
}

function search_words(){
	$('#loader').show();
	selectInDico(function(tx , results){
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
}
function nextImport(index){
	document.title = index + '/' + query.length;
	if(index > query.length){
		$('#loader').hide();
		return;
	}
	execQuery(query[index] , function(){
		nextImport(++index);
	});
}


function makeLike(word){
	return $('input[name=radsearch]:checked').val().replace('?' , word);
}

function execQuery(query , callback){
	db.transaction(function(tx) {
	    tx.executeSql(query, [], function(tx, result){
	    	callback(false , result);
	  	}, function(tx , error) { 
	    	console.log(error.message);
	    	console.log(query + "\n\n");
	    	callback(true , null);
	 	});
	});
}

function selectInDico(callback){
	var word = $('#mot').val().toLowerCase();
	db.transaction(
	    function (transaction) {
	    	console.log("SELECT * FROM dico WHERE grec LIKE '" + makeLike(word) + "'"
	        	+ "OR francais LIKE '%" + $('#mot').val().toLowerCase() + "%'"
	        	+ "OR gr LIKE '" + makeLike(word) + "'"
	        	+ "OR fr LIKE '" + makeLike(word) + "'"
	        	+ "LIMIT 0,30;");
	        transaction.executeSql("SELECT * FROM dico WHERE grec LIKE '" + makeLike(word) + "'"
	        	+ "OR francais LIKE '%" + $('#mot').val().toLowerCase() + "%'"
	        	+ "OR gr LIKE '" + makeLike(word) + "'"
	        	+ "OR fr LIKE '" + makeLike(word) + "'"
	        	+ "LIMIT 0,30;", [],
                callback, function(tx , error){
                	alert(error.message);
                });
	    }
	);
}


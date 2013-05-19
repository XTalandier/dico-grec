<?php

$action = $_GET['action'];
$ret    = '';
switch ($action) {
	case 'list-dump':
		$ret = list_dump();
		break;
	case 'upload':
		upload();
		break;
	default:
		showAction();
		break;
}
echo $ret;

function list_dump(){
	$dumps = array();
	$d = dir('./sql/');
	while(($f = $d->read()) !== false){
		if($f != '.' && $f != '..'){
			array_push($dumps , $f);
		}
	}
	return json_encode($dumps);
}


function showAction(){
?>
Format for SQL file:
<pre>
INSERT INTO "dico" VALUES('GREEK VALUE','FRENCH VALUE','a dummy value','GREEK WITHOUT ACCENTS','FRENCH WITHOUT ACCENTS');
</pre>
	<form method="post" action="?action=upload" enctype="multipart/form-data">
		<input type="file" name="flfile" />
		<input type="submit" />
	</form>
<?php
}


function upload(){
	$f = $_FILES['flfile'];
	$expl = explode('.' , $f['name']);
	if($expl[count($expl) - 1] != 'sql'){
		echo 'SQL File only for the moment';
	}elseif(file_exists('./sql/'.$f['name'])){
		echo 'This file already exists';
	}else{
		move_uploaded_file($f['tmp_name'], './sql/'.$f['name']);
		echo "OK";
	}
}


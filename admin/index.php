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
	<form method="post" action="?action=upload" enctype="multipart/form-data">
		<input type="file" name="flfile" /><br />
		CSV Separator: <input type="text" name="csvseparator" value=";" />
		<input type="submit" />
	</form>
Format for SQL file:
<pre>
INSERT INTO "dico" VALUES('GREEK VALUE','FRENCH VALUE','a dummy value','GREEK WITHOUT ACCENTS','FRENCH WITHOUT ACCENTS');
</pre>
Format for CSV file:
<pre>
GREEK VALUE;FRENCH VALUE;a dummy value;GREEK WITHOUT ACCENTS;FRENCH WITHOUT ACCENTS
</pre>

<?php
}


function upload(){
	$f = $_FILES['flfile'];
	$expl = explode('.' , $f['name']);
	$allowed = array('csv' , 'sql');
	if(!in_array($expl[count($expl) - 1] , $allowed)){
		echo "'".$expl[count($expl) - 1] ."'<br />";
		echo 'SQL or CSV Files only for the moment';
	}elseif(file_exists('./sql/'.$f['name'])){
		echo 'This file already exists';
	}else{
		if($expl[count($expl) - 1] == 'csv'){
			$i = 0;
			$foofile = './sql/'.uniqid().'.csv';
			move_uploaded_file($f['tmp_name'], $foofile);
			$fp = fopen($foofile , 'r');
			$fs = fopen('./sql/'.$f['name'].'.sql' , 'w');
			fwrite($fs, '#DumpFile auto genered');
			while(!feof($fp)){
				// Error ?
				if(++$i >= 1000000){
					fclose($fp);
					fclose($fx);
					unlink($foofile);
					echo "Something went wrong... 1 000 000 rows max";
					exit;
				}
				$line = fgetcsv($fp , 0 , $_POST['csvseparator']);
				if(substr($line[0], 0 , 1) != '#' && count($line) == 5){
					$strSQL = "\nINSERT INTO \"dico\" VALUES('".mysql_escape_string($line[0])."','".mysql_escape_string($line[1])."','".mysql_escape_string($line[2])."','".mysql_escape_string($line[3])."','".mysql_escape_string($line[4])."');";
					fwrite($fs, $strSQL);
				}
			}
			fclose($fp);
			fclose($fs);
			unlink($foofile);
			echo '<b>Auto generated dump:</b><pre>'.file_get_contents('./sql/'.$f['name'].'.sql').'</pre>';
		}else{
			move_uploaded_file($f['tmp_name'], './sql/'.$f['name']);
			echo "OK";
		}
	}
}


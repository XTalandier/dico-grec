BEGIN TRANSACTION;
UPDATE dico SET fr=REPLACE(gr, 'é' , 'e');
UPDATE dico SET fr=REPLACE(gr, 'è' , 'e');
UPDATE dico SET fr=REPLACE(gr, 'ê' , 'e');
COMMIT;

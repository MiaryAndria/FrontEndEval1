## Copie contenu 
mysqldump -u root -p bagisto_vf | mysql -u root -p bagisto_backup
mysqldump -u root -p bagisto_backup | mysql -u root -p bagisto_vf
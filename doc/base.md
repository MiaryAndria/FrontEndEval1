## Copie contenu 
mysqldump -u root -p bagisto_vf | mysql -u root -p bagisto_backup
mysqldump -u root -p bagisto_backup | mysql -u root -p bagisto_vf


aria_log.00000001
aria_log.00000002
aria_log_control
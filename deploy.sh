git -C ~/code-org-ar pull
git pull
cp -rf ~/code-org-ar/ar-SA/* i18n/locales/ar-SA/.
cp ~/code-org-ar/*.yml dashboard/config/locales/.
cp -rf ~/code-org-ar/i18n/* apps/i18n/.
cd apps
npm run build:dist
cd ../dashboard
rake assets:precompile
sudo supervisorctl stop all &&  ps -aux | grep puma | awk '{print $2}' |  xargs sudo kill -9
sleep 2s
ps -aux | grep puma
sudo supervisorctl start all

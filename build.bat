mkdir build
copy index.html    build\\index.html
copy appinfo.json  build\\appinfo.json
copy icon.png      build\\icon.png
copy largeIcon.png build\\largeIcon.png
xcopy /E /I /Y sounds build\\sounds
cd build
call ares-package .
del index.html
del appinfo.json
del icon.png
del largeIcon.png
rmdir /Q /S sounds
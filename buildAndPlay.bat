call build.bat
@Echo Off
Set mask="arboro*"
FOR %%i IN (%mask%) DO Set fileName="%%i"
ares-install %fileName%
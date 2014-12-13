call build.bat
@Echo Off
Set mask="roarbo*"
FOR %%i IN (%mask%) DO Set fileName="%%i"
ares-install %fileName%
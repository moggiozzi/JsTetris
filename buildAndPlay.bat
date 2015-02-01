call build.bat
cd build
@Echo Off
Set mask="roarbo*"
FOR %%i IN (%mask%) DO Set fileName="%%i"
ares-install %fileName%
cd ../
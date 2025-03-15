@echo off
pushd %~dp0
:main
npm run start:server
goto :main
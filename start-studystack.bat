@echo off
title StudyStack — IIT Roorkee
cls
echo ========================================================
echo                 StudyStack - IIT Roorkee                
echo                 Your Stack. Your Track.                 
echo ========================================================
echo.
echo Starting StudyStack Fullstack Server and SQLite DB...
echo Opening browser at http://localhost:5000 in 3 seconds...
echo.

start "" "http://localhost:5000"
npm run server

pause

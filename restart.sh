sudo kill -15 `cat /opt/Backend/logs/PID`
wait ${!}
sudo rm /opt/Backend/logs/PID
sudo node /opt/Backend/app >> "/opt/Backend/logs/$(date +%F).log" &
sudo echo $! > ./logs/PID
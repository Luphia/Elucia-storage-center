supervisor ./app >> "./logs/$(date +%F).log" &
echo $! > ./logs/PID
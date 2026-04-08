#!/bin/bash
# AECC Server Monitor — CPU/RAM alerts
CPU_THRESHOLD=80
RAM_THRESHOLD=85
LOG_FILE=/var/log/aecc-monitor.log

CPU_USAGE=$(top -bn1 | grep 'Cpu(s)' | awk '{print int($2 + $4)}')
RAM_USAGE=$(free | awk '/Mem/ {printf("%.0f", $3/$2 * 100)}')
DISK_USAGE=$(df -h / | awk 'NR==2 {gsub(/%/,""); print $5}')

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
echo "$TIMESTAMP | CPU: ${CPU_USAGE}% | RAM: ${RAM_USAGE}% | Disk: ${DISK_USAGE}%" >> $LOG_FILE

ALERT=''
if [ $CPU_USAGE -gt $CPU_THRESHOLD ]; then
  ALERT="CPU: ${CPU_USAGE}% (threshold: ${CPU_THRESHOLD}%)"
fi
if [ $RAM_USAGE -gt $RAM_THRESHOLD ]; then
  ALERT="${ALERT} RAM: ${RAM_USAGE}% (threshold: ${RAM_THRESHOLD}%)"
fi
if [ $DISK_USAGE -gt 90 ]; then
  ALERT="${ALERT} Disk: ${DISK_USAGE}% (threshold: 90%)"
fi

if [ -n "$ALERT" ]; then
  echo "$TIMESTAMP ALERT: $ALERT" >> $LOG_FILE
fi

# Log rotation: keep under 10MB
LOG_SIZE=$(stat --printf='%s' "$LOG_FILE" 2>/dev/null || echo 0)
if [ "$LOG_SIZE" -gt 10485760 ]; then
  tail -n 5000 $LOG_FILE > ${LOG_FILE}.tmp && mv ${LOG_FILE}.tmp $LOG_FILE
fi

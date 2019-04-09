#!/bin/bash

#NU_PATH="/Volumes/StoreEx/elvi.network/nucypher/"
#cd "/Volumes/StoreEx/elvi.network/nucypher/" | source ./bin/activate
#which nucypher
cd "/Volumes/StoreEx/elvi.network/nucypher/"
source ./bin/activate
command -v nucypher >/dev/null 2>&1 || { echo >&2 "I ${PWD} require foo but it's not installed.  Aborting."; exit 1; }
#aliceAlive=$(lsof -i:8151)
#bobAlive=$(lsof -i:11151)
#echo '' > enrico.logs
enrico=$(lsof -i:5151)
num="--policy-encrypting-key $1"

if [[ $enrico ]]; then
    echo $(cat enrico.logs)
    #avk=$(cat alice.logs | grep "Alice Verifying Key" | awk -F "\ " '{print $4}')
else
    nohup nucypher enrico run $num > enrico.logs &
    sleep 10
    echo "enrico $num - $2" > enrico.logs
fi

exit 0;

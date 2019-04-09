#!/bin/bash

#NU_PATH="/Volumes/StoreEx/elvi.network/nucypher/"
#cd "/Volumes/StoreEx/elvi.network/nucypher/" | source ./bin/activate
#which nucypher
cd "/Volumes/StoreEx/elvi.network/nucypher/"
source ./bin/activate
command -v nucypher >/dev/null 2>&1 || { echo >&2 "I ${PWD} require foo but it's not installed.  Aborting."; exit 1; }

aliceAlive=$(lsof -i:8151)
bobAlive=$(lsof -i:11151)

if [[ $aliceAlive ]]; then
    avk=$(cat alice.logs | grep "Alice Verifying Key" | awk -F "\ " '{print $4}')

else
    rm alice.logs
    nohup nucypher alice run --dev --federated-only --teacher-uri 127.0.0.1:10151 > alice.logs &
    sleep 5
    avk=$(cat alice.logs | grep "Alice Verifying Key" | awk -F "\ " '{print $4}')
fi
#if [[ $bobAlive ]]; then
#    bob=$(cat bob.logs | grep "Key" | awk -F "\ " '{print $4}' | tr "\n" ","| sed 's/.$//')

#else
#    rm bob.logs
#    nohup nucypher bob run --dev --federated-only --teacher-uri 52.14.207.225:9151 > bob.logs &
#    sleep 5
#    bob=$(cat bob.logs | grep "Key" | awk -F "\ " '{print $4}' | tr "\n" ","| sed 's/.$//')
#    echo "hola"
#fi
#cat alice.logs | grep "Alice Verifying Key"


#echo "alice:"$avk"-bob:"$bob
echo "$avk"
exit 0;

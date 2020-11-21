#!/bin/sh

for project in fire-alarm slack telegram washer
do
    cd $project
    pwd
    yarn install
    rm -r lib
    yarn build
    rm -r release
    mv lib release
    cd ..

done
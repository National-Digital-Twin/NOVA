#!/bin/sh -e

cd ../../..
sudo docker build \
  -t nova/api \
  -f Dockerfile.backend \
  .
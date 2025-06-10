#!/bin/sh -e

cd ../../..
sudo docker build \
  -t nova/frontend \
  -f Dockerfile.frontend \
  .

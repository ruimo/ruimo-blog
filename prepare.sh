#!/bin/sh
if bash -c "docker build -t ruimo/mkdocs ."; then RESULT=0; else RESULT=1; fi
echo result: $RESULT

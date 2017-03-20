#!/bin/sh

mkdir output_dir
mogrify -path output_dir -gravity center -crop 120x120 *.jpg

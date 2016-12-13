import numpy as np
import math
import csv
import re

readFilename = '../../data/Quarter/zed-u-encoded.csv'
targetFilename = '../../data/Quarter/nyc-u-encoded-'
encodeWeather = True
encodeQScore = False

if not encodeWeather:
	fieldnames = ['hour_x','hour_y','lat','lon','month_x','month_y','day_x','day_y','day', 'year', 'expected']
else:
	if not encodeQScore:
		fieldnames = ['geoId','hour_x','hour_y','lat','lon','month_x','month_y','day_x','day_y', 'day' , 'year','tempf','vis','num_establishments','num_liquor_stores','num_restaurants','num_stores','num_bars','expected']
	else:
		fieldnames = ['geoId','hour_x','hour_y','lat','lon','month_x','month_y','day_x','day_y', 'day','qscore','year','tempf','vis','expected']

csvfile = open(readFilename, 'rU')
reader = csv.DictReader(csvfile)

currentYear = ''
accumulator = []
writer = None

for row in reader:
	if row['year'] != currentYear:
		if row['year'] != '':
			for r in accumulator:
				writer.writerow(r)
			del accumulator[:]

		print targetFilename + row['year'] + '.csv'
		f = open(targetFilename + row['year'] + '.csv', 'w')
		writer = csv.DictWriter(f, fieldnames=fieldnames)
		currentYear = row['year']

	accumulator.append(row)

if accumulator:
	for r in accumulator:
		writer.writerow(r)

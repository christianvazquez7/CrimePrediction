import numpy as np
import math
import csv
import re

readFilename = '../../data/zeroes.csv'
targetFilename = '../../data/zeros'

fieldnames = ['hour_x','hour_y','lat','lon','month_x','month_y','day_x','day_y', 'year', 'expected']
csvfile = open(readFilename, 'rU')
reader = csv.DictReader(csvfile)

currentYear = ''
accumulator = []
writer = None

for row in reader:
	if row['year'] != currentYear:
		if row['year'] != '':
			for r in accumulator:
				writer.writerow({'hour_x': r['hour_x'], 'hour_y': r['hour_y'], 'lat' : r['lat'], 'lon': r['lon'], 'month_x' : r['month_x'], 'month_y': r['month_y'], 'day_x' : r['day_x'] , 'day_y' : r['day_y'], 'year': r['year'], 'expected':r['expected'] })
			del accumulator[:]

		print targetFilename + row['year'] + '.csv'
		f = open(targetFilename + row['year'] + '.csv', 'w')
		writer = csv.DictWriter(f, fieldnames=fieldnames)
		currentYear = row['year']

	accumulator.append(row)

if accumulator:
	for r in accumulator:
		writer.writerow({'hour_x': r['hour_x'], 'hour_y': r['hour_y'], 'lat' : r['lat'], 'lon': r['lon'], 'month_x' : r['month_x'], 'month_y': r['month_y'], 'day_x' : r['day_x'] , 'day_y' : r['day_y'], 'year': r['year'], 'expected':r['expected'] })

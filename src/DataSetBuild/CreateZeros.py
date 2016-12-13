import numpy as np
import csv
import re

csvfile = open('../../data/Quarter/nyc-filtered-sorted-w-c.csv', 'rU')
maskFile = open('../../data/mask.csv', 'rU')

targetFile = open('../../data/Quarter/zed-n.csv', 'w')
fieldnames = ['gridID', 'day_name','month_name','date','year','hour', 'lat', 'lon', 'expected']

writer = csv.DictWriter(targetFile, fieldnames=fieldnames)
writer.writeheader()

reader = csv.DictReader(csvfile)
maskReader = csv.DictReader(maskFile)

mask = []
for row in maskReader:
	mask.append(row['gridID'])



currentDay = ''
currentMonth = ''
currentYear = ''
currentHour = ''
currentLat = ''
currentLon = ''
crimeBin = {}

for row in reader:
	# if row['year'] == '2007':
	# 	break
	if (row['year'] != currentYear or row['day_name'] != currentDay or row['month_name'] != currentMonth or row['hour'] != currentHour):
		if currentHour != '':
			samples = np.random.choice(mask,30)
			# samples = list(range(0,58852))
			print 'new hour bin:' + row['date']
			for val in samples:
				if val not in crimeBin.keys():
					writer.writerow({'gridID': val, 'day_name': row['day_name'], 'month_name': row['month_name'], 'date':row['date'], 'year': row['year'], 'hour': row['hour'], 'lat': currentLat, 'lon': currentLon, 'expected': 0})
			crimeBin.clear()
		currentDay = row['day_name']
		currentMonth = row['month_name']
		currentYear = row['year']
		currentHour = row['hour']
		currentLat = row['lat']
		currentLon = row['lon']

	print 'old:'+ row['date']
	crimeBin[row['gridID']] = 1

if crimeBin:
	for val in samples:
				if val not in crimeBin.keys():
					writer.writerow({'gridID': val, 'day_name': row['day_name'], 'month_name': row['month_name'], 'date':row['date'], 'year': row['year'], 'hour': row['hour'],'lat': currentLat, 'lon': currentLon, 'expected': 0})



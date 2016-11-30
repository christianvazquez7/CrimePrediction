import csv
import re

csvfile = open('../data/StreetScoreNYC-Mapped-Sorted.csv', 'rU')
targetFile = open('../data/StreetScoreNYC-Aggregated.csv', 'w')
fieldnames = ['avg' ,'gridID']
writer = csv.DictWriter(targetFile, fieldnames=fieldnames)
writer.writeheader()

reader = csv.DictReader(csvfile)
sumation = 0.0
count = 0.0
currentID = ''
for row in reader:
	if row['gridID'] != currentID:
		if currentID != '':
			writer.writerow({'avg': sumation/count ,'gridID': currentID})
		count = 0
		sumation = 0
		currentID = row['gridID']
	sumation += float(row['qscore'])
	count += 1

if count != 0:
	writer.writerow({'avg': sumation/count ,'gridID': currentID})

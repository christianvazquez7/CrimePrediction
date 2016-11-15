import csv
import re

csvfile = open('../data/RobberyNYC-Mapped.csv', 'rU')
targetFile = open('../data/RobberyBins-Daily-Hours.csv', 'w')
fieldnames = ['gridID', 'hour', 'expected']

writer = csv.DictWriter(targetFile, fieldnames=fieldnames)
writer.writeheader()

reader = csv.DictReader(csvfile)


currentDay = ''
currentMonth = ''
currentYear = ''
crimeBin = {}

for row in reader:
	if (row['year'] != currentYear or row['day'] != currentDay or row['month_name'] != currentMonth):
		
		if currentDay != '':
			#print crimeBin
			for key in crimeBin:
				writer.writerow({'gridID': key[0], 'hour': key[1], 'expected': crimeBin[key]})
			crimeBin.clear()


		currentDay = row['day']
		currentMonth = row['month_name']
		currentYear = row['year']

	if (row['gridID'],row['hour']) in crimeBin.keys():
		print 'hheeeeeeeeeeeeeere'
		crimeBin[(row['gridID'],row['hour'])] += 1;
		print crimeBin[(row['gridID'],row['hour'])]
		print row['gridID']
	else:
		crimeBin[(row['gridID'],row['hour'])] = 1;

	
		
if not crimeBin:
	for key in crimeBin:
		writer.writerow({'gridID': key[0], 'hour': key[1], 'expected': crimeBin[key] })

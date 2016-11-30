import csv
import re

csvfile = open('../../data/RobberyNYC-Mapped.csv', 'rU')
targetFile = open('../../data/RobberyBins-Daily-Hours.csv', 'w')
fieldnames = ['gridID', 'day_name','month_name','date','year','lat','lon','hour', 'expected']

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
			for key in crimeBin:
				writer.writerow({'gridID': key[0], 'hour': key[1], 'expected': crimeBin[key][1], 'day_name': crimeBin[key][0]['day_name'] , 'month_name': crimeBin[key][0]['month_name'], 'date':crimeBin[key][0]['date'] ,'year': crimeBin[key][0]['year'] , 'lat': crimeBin[key][0]['center_lat'],'lon': crimeBin[key][0]['center_lon']})
			crimeBin.clear()


		currentDay = row['day']
		currentMonth = row['month_name']
		currentYear = row['year']

	if (row['gridID'],row['hour']) in crimeBin.keys():
		crimeBin[(row['gridID'],row['hour'])] = (crimeBin[(row['gridID'],row['hour'])][0],crimeBin[(row['gridID'],row['hour'])][1] + 1);
	else:
		crimeBin[(row['gridID'],row['hour'])] = (row,1);

	
		
if not crimeBin:
	for key in crimeBin:
		writer.writerow({'gridID': key[0], 'hour': key[1], 'expected': crimeBin[key][1], 'day_name': crimeBin[key][0]['day_name'] , 'month_name': crimeBin[key][0]['month_name'], 'date':crimeBin[key][0]['date'] ,'year': crimeBin[key][0]['year'] , 'lat': crimeBin[key][0]['center_lat'],'lon': crimeBin[key][0]['center_lon']})

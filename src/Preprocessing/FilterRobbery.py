import csv
import re

csvfile = open('../data/CrimeIncidentsNYC.csv', 'rb')
targetFile = open('../data/RobberyNYC.csv', 'w')
fieldnames = ['crime_id', 'date','day_name','month_name','day','year','hour','latitude','longitude']
writer = csv.DictWriter(targetFile, fieldnames=fieldnames)
writer.writeheader()


reader = csv.DictReader(csvfile)
for row in reader:
	#print ', '.join(row)
	if row['Offense'] == 'ROBBERY':
		separated  = re.split(',', row['Location 1'])
		latitude = re.sub('\(', '', separated[0])
		longitude = re.sub('\)', '', separated[1])
		print latitude
		print longitude
		writer.writerow({'crime_id': row['Identifier'], 'date': row['Occurrence Date'], 'day_name' : row['Day of Week'], 'month_name': row['Occurrence Month'], 'day' : row['Occurrence Day'], 'year': row['Occurrence Year'], 'hour' : row['Occurrence Hour'] , 'latitude' : latitude, 'longitude': longitude })

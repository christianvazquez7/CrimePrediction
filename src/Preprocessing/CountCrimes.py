import csv
import re

csvfile = open('../../data/RobberyNYC-Mapped.csv', 'rU')

accumulator = {}
reader = csv.DictReader(csvfile)
for row in reader:
	#print ', '.join(row)
	if row['year'] in accumulator.keys():
		accumulator[row['year']] = accumulator[row['year']] + 1
	else:
		accumulator[row['year']] = 1

for key in accumulator:
	print key + ': '+ str(accumulator[key])

import numpy as np
import math
import csv
import re

num_of_months_in_year = 12.0
num_of_days_in_week = 7.0
num_of_hour_in_day = 24.0
num_of_day_in_month = 30


dayMap = {}
dayMap['Sunday'] = 1
dayMap['Monday'] = 2
dayMap['Tuesday'] = 3
dayMap['Wednesday'] = 4
dayMap['Thursday'] = 5
dayMap['Friday'] = 6
dayMap['Saturday'] = 7

monthMap = {}
monthMap['Jan'] = 1
monthMap['Feb'] = 2
monthMap['Mar'] = 3
monthMap['Apr'] = 4
monthMap['May'] = 5
monthMap['Jun'] = 6
monthMap['Jul'] = 7
monthMap['Aug'] = 8
monthMap['Sep'] = 9
monthMap['Oct'] = 10
monthMap['Nov'] = 11
monthMap['Dec'] = 12

def encode_month_x(tar):
	return np.cos(2*np.pi*float(monthMap[tar])/num_of_months_in_year)

def encode_month_y(tar):
	return np.sin(2*np.pi*float(monthMap[tar])/num_of_months_in_year)

def encode_day_x(tar):
	return np.cos(2*np.pi*float(dayMap[tar])/num_of_days_in_week)

def encode_day_y(tar):
	return np.sin(2*np.pi*float(dayMap[tar])/num_of_days_in_week)

def encode_hour_x(tar):
	return np.cos(2*np.pi*float(tar)/num_of_hour_in_day)

def encode_hour_y(tar):
	return np.sin(2*np.pi*float(tar)/num_of_hour_in_day)



csvfile = open('../../data/id06.csv', 'rU')


targetFile = open('../../data/zeroes.csv', 'w')
fieldnames = ['hour_x','hour_y','lat','lon','month_x','month_y','day_x','day_y', 'year', 'expected']
writer = csv.DictWriter(targetFile, fieldnames=fieldnames)
writer.writeheader()

reader = csv.DictReader(csvfile)
for row in reader:
	month_x =  encode_month_x(row['month_name'])
	month_y =  encode_month_y(row['month_name'])
	day_x =  encode_day_x(row['day_name'])
	day_y = encode_day_y(row['day_name'])
	hour_x =  encode_hour_x(row['hour'])
	hour_y = encode_hour_y(row['hour'])
	year = row['year']
	lat = row['lat']
	lon = row['lon']
	writer.writerow({'hour_x': hour_x, 'hour_y': hour_y, 'lat' : lat, 'lon': lon, 'month_x' : month_x, 'month_y': month_y, 'day_x' : day_x , 'day_y' : day_y, 'year': year, 'expected':row['expected'] })








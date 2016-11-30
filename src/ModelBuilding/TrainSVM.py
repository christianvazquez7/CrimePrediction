import numpy as np
import math
import csv
import re
from sklearn import svm
from sklearn.externals import joblib
from sklearn import preprocessing
from sklearn.preprocessing import StandardScaler



filename = "../../data/2006.csv"
zeroes = "../../data/zeros2006.csv"
dataset = np.loadtxt(fname = filename, delimiter = ',')
dataset2 = np.loadtxt(fname = zeroes, delimiter = ',')

x1 = dataset[:,0:8]
y1 = dataset[:,9]
print len(x1)
print len(y1)

x2 = dataset2[:,0:8]
y2 = dataset2[:,9]

print len(x2)
print len(y2)

X = np.concatenate((x1,x2))
y = np.concatenate((y1,y2))

print len(X)
print len(y)

# X = preprocessing.normalize(X, norm='l2')

scalerX = StandardScaler().fit(X)
scalery = StandardScaler().fit(y)

X = scalerX.transform(X)
y = scalery.transform(y)

clf = svm.SVR(verbose=True, kernel='rbf')
clf.fit(X, y)

print clf.predict(X[0:30,:])

print clf.score(X,y)

joblib.dump(clf, 'Model2006.pkl') 

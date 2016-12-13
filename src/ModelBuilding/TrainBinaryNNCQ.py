import numpy as np
import pandas
from keras.models import Sequential
from keras.layers import Dense
from keras.wrappers.scikit_learn import KerasClassifier
from sklearn.model_selection import cross_val_score
from sklearn.model_selection import StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn import preprocessing
from keras.optimizers import Adam
from sklearn.preprocessing import StandardScaler
from keras.layers.core import Dropout
from sklearn.metrics import roc_curve, auc
from scipy import interp
import matplotlib.pyplot as plt
from itertools import cycle
import csv
import re
from sklearn.decomposition import PCA

csvfile = open('../../data/census.csv', 'rU')

accumulator = {}
reader = csv.DictReader(csvfile)
cc = [] 
i = 0
for row in reader:
	lst = [float(x) for x in row.values()]
	accumulator[row['geoId']] = i
	i = i + 1
	cc.append(lst)

def baseline_model():
	# create model
	model = Sequential()
	model.add(Dense(25, input_dim=114, init='normal', activation='relu'))
	model.add(Dense(16, init='normal', activation='relu'))
	model.add(Dense(1, init='normal', activation='sigmoid'))
	# Compile model
	# sgd = SGD(lr=.000001, decay=1e-6, momentum=0.9, nesterov=True)
	model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy','fmeasure'])
	return model




filename = "../../data/Quarter/streetscore/nyc-encoded-2006.csv"
zeroes = "../../data//Quarter/streetscore/zed-encoded-2006.csv"
dataset = np.loadtxt(fname = filename, delimiter = ',')
dataset2 = np.loadtxt(fname = zeroes, delimiter = ',')

filename3 = "../../data/Quarter/streetscore/nyc-encoded-2007.csv"
zeroes3 = "../../data/Quarter/streetscore/zed-encoded-2007.csv"
dataset3 = np.loadtxt(fname = filename3, delimiter = ',')
dataset30 = np.loadtxt(fname = zeroes3, delimiter = ',')

filename4 = "../../data/Quarter/streetscore/nyc-encoded-2008.csv"
zeroes4 = "../../data/Quarter/streetscore/zed-encoded-2008.csv"
dataset4 = np.loadtxt(fname = filename4, delimiter = ',')
dataset40 = np.loadtxt(fname = zeroes4, delimiter = ',')

filename5 = "../../data/Quarter/streetscore/nyc-encoded-2010.csv"
zeroes5 = "../../data/Quarter/streetscore/zed-encoded-2010.csv"
dataset5 = np.loadtxt(fname = filename5, delimiter = ',')
dataset50 = np.loadtxt(fname = zeroes5, delimiter = ',')

filename6 = "../../data/Quarter/streetscore/nyc-encoded-2011.csv"
zeroes6 = "../../data/Quarter/streetscore/zed-encoded-2011.csv"
dataset6 = np.loadtxt(fname = filename6, delimiter = ',')
dataset60 = np.loadtxt(fname = zeroes6, delimiter = ',')

filename7 = "../../data/Quarter/streetscore/nyc-encoded-2012.csv"
zeroes7 = "../../data/Quarter/streetscore/zed-encoded-2012.csv"
dataset7 = np.loadtxt(fname = filename7, delimiter = ',')
dataset70 = np.loadtxt(fname = zeroes7, delimiter = ',')

filename8 = "../../data/Quarter/streetscore/nyc-encoded-2013.csv"
zeroes8 = "../../data/Quarter/streetscore/zed-encoded-2012.csv"
dataset8 = np.loadtxt(fname = filename8, delimiter = ',')
dataset80 = np.loadtxt(fname = zeroes8, delimiter = ',')

dta =  np.concatenate((dataset,dataset2))
dta = np.concatenate((dta,dataset3,dataset30, dataset4, dataset40, dataset5,dataset50, dataset60, dataset6, dataset7,dataset70,dataset8,dataset80))





pca = PCA(n_components=100)
C = np.array(cc)
C_new = pca.fit_transform(C)
print len(C_new[0])



#np.random.shuffle(dta)

X = dta[:,0:14]
y = dta[:,14]

print X 

xx = []

for data in X:
	dd = np.append(data,C_new[accumulator[str(int(data[0]))]])
	xx.append(dd)


s = set(y)




estimators = []
estimators.append(('standarize',StandardScaler()))
estimators.append(('mlp', KerasClassifier(build_fn=baseline_model,nb_epoch=20,verbose=1)))
pipeline = Pipeline(estimators)
# kfold = StratifiedKFold(n_splits=2, shuffle=True)

# results = cross_val_score(pipeline, X, y, cv=kfold)

# print results.mean() * 100
# print results.std() * 100



validationFileName = "../../data/Quarter/streetscore/nyc-encoded-2009.csv"
zeroValidation = "../../data/Quarter/streetscore/zed-encoded-2009.csv"

d1 = np.loadtxt(fname = validationFileName, delimiter = ',')
d2 = np.loadtxt(fname = zeroValidation, delimiter = ',')

d3 = np.concatenate((d1,d2))

X_test = d3[:,0:14]
y_test = d3[:,14]

bb = []
for data in X_test:
	dd = np.append(data,C_new[accumulator[str(int(data[0]))]])
	bb.append(dd)




pipeline.fit(xx,y)
print '\n'

from sklearn.metrics import classification_report
from sklearn.metrics import confusion_matrix

y_true = y_test
y_pred = pipeline.predict(bb)
print '\n'


print(classification_report(y_true, y_pred))

print confusion_matrix(y_true, y_pred)
# print pipeline.predict(X_test[0:30,:])

y_scores = pipeline.predict_proba(bb)

fpr = dict()
tpr = dict()
roc_auc = dict()

print y_scores[:,14]
print y_scores[:,1]

fpr[0], tpr[0], _ = roc_curve(y_test, y_scores[:,1])
roc_auc[0] = auc(fpr[0], tpr[0])


plt.figure()
lw = 2
plt.plot(fpr[0], tpr[0], color='darkorange',lw=lw, label='ROC curve (area = %0.2f)' % roc_auc[0])
plt.plot([0, 1], [0, 1], color='navy', lw=lw, linestyle='--')
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('Receiver operating characteristic example')
plt.legend(loc="lower right")
plt.show()




#estimator = KerasRegressor(build_fn=baseline_model, nb_epoch=10, batch_size=5, verbose=1)

# fix random seed for reproducibility
#seed = 7
#np.random.seed(seed)
	
#kfold = KFold(n_splits=2, random_state=seed)
#results = cross_val_score(estimator, X, y, cv=kfold)
#print("Results: %.2f (%.2f) MSE" % (results.mean(), results.std()))
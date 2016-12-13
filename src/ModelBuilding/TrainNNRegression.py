import numpy as np
import pandas as pd
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
from sklearn.metrics import classification_report
from sklearn.metrics import confusion_matrix
from sklearn.svm import LinearSVC
from sklearn.datasets import load_iris
from sklearn.feature_selection import SelectFromModel
from sklearn.feature_selection import mutual_info_classif
from sklearn.feature_selection import SelectKBest
from sklearn import cross_validation
from sklearn.metrics import  make_scorer, precision_recall_fscore_support
import sklearn
from keras.wrappers.scikit_learn import KerasRegressor



dataPath = "../../data/Quarter/"
featureMap = {'geoId':0,'hour_x':1,'hour_y':2,'lat':3,'lon':4,'month_x':5,'month_y':6,'day_x':7,'day_y':8,'day':9,'year':10,'tempf':11,'vis':12}

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

pca = PCA(n_components=100)
C = np.array(cc)
C_new = pca.fit_transform(C)




def plotROC(y_test, y_scores):
	fpr = dict()
	tpr = dict()
	roc_auc = dict()

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

def filterFeatures(dataset, featureList):
	indexList = []
	result = []
	for feature in featureList:
		indexList.append(featureMap[feature])
	for entry in dataset:
		filteredEntry = []
		for index in indexList:
			filteredEntry.append(entry[index])
		result.append(filteredEntry)
	return result

def dataFromYears(yearList):
	result = np.array([])
	for year in yearList:
		result = addDataSet(result,dataPath + "nyc-encoded-"+year+".csv")
		result = addDataSet(result,dataPath + "nyc-zero-encoded-"+year+".csv")
	return result

def unbalancedDataFromYears(yearList):
	result = np.array([])
	for year in yearList:
		result = addDataSet(result,dataPath + "nyc-encoded-"+year+".csv")
		result = addDataSet(result,"../../data/Quarter/" + "nyc-u-encoded-"+year+".csv")
	return result

def addDataSet(data, file):
	ds = np.loadtxt(fname = file, delimiter = ',')
	print np.shape(ds)
	a = data.size
	if a:
		print "concat"
		return np.concatenate((data, ds))
	else:
		return ds

def baseline_model():
	# create model
	model = Sequential()
	model.add(Dense(25, input_dim=118, init='normal', activation='relu'))
	model.add(Dense(16, init='normal', activation='relu'))
	model.add(Dense(1, init='normal'))
	# Compile model
	# sgd = SGD(lr=.000001, decay=1e-6, momentum=0.9, nesterov=True)
	model.compile(loss='mean_squared_error', optimizer='adam', metrics=['mean_squared_error'])
	return model

def addCensus(dataset):
	bb = []
	for data in dataset:
		dd = np.append(data,C_new[accumulator[str(int(data[0]))]])
		bb.append(dd)
	return bb

def toBinary(dataset):
	result = []
	for item in dataset:
		if item > 0:
			result.append(1)
		else:
			result.append(0)
	return result


estimators = []
estimators.append(('standarize',StandardScaler()))
estimators.append(('mlp', KerasClassifier(build_fn=baseline_model,nb_epoch=20)))



def get_true_and_pred_CV(estimator, X, y, n_folds, cv, params):
    ys = []
    for train_idx, valid_idx in cv:
        clf  = Pipeline(estimators)
        if isinstance(X, np.ndarray):
            clf.fit(X[train_idx], y[train_idx])
            cur_pred = clf.predict(X[valid_idx])
        elif isinstance(X, pd.DataFrame):
            clf.fit(X.iloc[train_idx, :], y[train_idx]) 
            cur_pred = clf.predict(X.iloc[valid_idx, :])
        else:
            raise Exception('Only numpy array and pandas DataFrame ' \
                            'as types of X are supported')

        ys.append((y[valid_idx], cur_pred))
    return ys




def fit_and_score_CV(estimator, X, y, n_folds=2, stratify=True, **params):
    if not stratify:
        cv_arg = cross_validation.KFold(y.size, n_folds)
    else:
        cv_arg = cross_validation.StratifiedKFold(y, n_folds,shuffle=True)

    ys = get_true_and_pred_CV(estimator, X, y, n_folds, cv_arg, params)    
    cv_acc = map(lambda tp: sklearn.metrics.accuracy_score(tp[0], tp[1]), ys)
    cv_pr_weighted = map(lambda tp: sklearn.metrics.precision_score(tp[0], tp[1], average='weighted'), ys)
    cv_rec_weighted = map(lambda tp: sklearn.metrics.recall_score(tp[0], tp[1], average='weighted'), ys)
    cv_f1_weighted = map(lambda tp: sklearn.metrics.f1_score(tp[0], tp[1], average='weighted'), ys)
    cv_auc_weighted = map(lambda tp: sklearn.metrics.roc_auc_score(tp[0], tp[1]), ys)


    # the approach below makes estimator fit multiple times
    #cv_acc = sklearn.cross_validation.cross_val_score(algo, X, y, cv=cv_arg, scoring='accuracy')
    #cv_pr_weighted = sklearn.cross_validation.cross_val_score(algo, X, y, cv=cv_arg, scoring='precision_weighted')
    #cv_rec_weighted = sklearn.cross_validation.cross_val_score(algo, X, y, cv=cv_arg, scoring='recall_weighted')   
    #cv_f1_weighted = sklearn.cross_validation.cross_val_score(algo, X, y, cv=cv_arg, scoring='f1_weighted')
    return {'CV accuracy': np.mean(cv_acc), 'CV precision_weighted': np.mean(cv_pr_weighted),
            'CV recall_weighted': np.mean(cv_rec_weighted), 'CV F1_weighted': np.mean(cv_f1_weighted), 'AUC': np.mean(cv_auc_weighted)}



years = ['2011','2012','2013','2014','2015','2006','2007','2008','2009','2010']

for year in years:
	i = 0
	num_of_features = 18
	train_set = []
	for j in range(0,10):
		if j != i:
			print years[j]
			train_set.append(years[j])


	dta = dataFromYears(train_set)


	X = dta[:,0:18]

	y = dta[:,num_of_features]


	X = addCensus(X)



	estimators = []
	estimators.append(('standarize',StandardScaler()))
	estimators.append(('mlp', KerasRegressor(build_fn=baseline_model,nb_epoch=20,verbose=1)))
	# kfold = StratifiedKFold(n_splits=2, shuffle=True)
	# pipeline = Pipeline(estimators)
	X = np.array(X)
	y = np.array(y)

	# print "------------------------------"

	# print "Result for YEAR: " + year

	# # print fit_and_score_CV(estimators,X,y)

	# print '\n'

	print "------------------------------"
	ys = []
	yscc = []

	# for train, test in kfold.split(X, y):
	# pipeline = Pipeline(estimators)
	# X_train, X_test = X[train], X[test]
	# y_train, y_test = y[train], y[test]
	# pipeline.fit(X_train,y_train)
	# y_pred = pipeline.predict(X_test)
	# y_scores = pipeline.predict_proba(X_test)
	# ys.append((y[test], y_pred))
	# yscc.append((y[test],y_scores[:,1]))
	# print(classification_report(y_test, y_pred))

	test = dataFromYears([year])
	X_test = test[:,0:18]
	y_test = test[:,num_of_features]

	X_test = addCensus(X_test)

	pipeline = Pipeline(estimators)
	pipeline.fit(X,y)

	y_pred = pipeline.predict(X_test)
	ys.append((y_test, y_pred))

	cv_mean_square_error = map(lambda tp: sklearn.metrics.mean_squared_error(tp[0], tp[1]), ys)

	# i = i + 1

	print "------------------------------"

	print "Result for YEAR: " + year

	# # print fit_and_score_CV(estimators,X,y)

	# print '\n'


	print {'CV precision_weighted': np.mean(cv_mean_square_error)}

	print "------------------------------"

	# metrics = ['recall','precision','accuracy','fmeasure']

# results = cross_val_score(pipeline, X, y, cv=kfold, scoring='roc_auc')
# print '\n'
# print "Results for "
# print results.mean() * 100
# print results.std() * 100




# test = dataFromYears(['2014'])

# X_test = test[:,0:18]
# y_test = test[:,num_of_features]
# y_test = toBinary(y_test)
# X_test = addCensus(X_test)




# pipeline.fit(X,y)
# print '\n'

# y_true = y_test
# y_pred = pipeline.predict(X_test)
# print '\n'


# print(classification_report(y_true, y_pred))

# print confusion_matrix(y_true, y_pred)
# # print pipeline.predict(X_test[0:30,:])

# y_scores = pipeline.predict_proba(X_test)

# plotROC(y_test,y_scores)




#estimator = KerasRegressor(build_fn=baseline_model, nb_epoch=10, batch_size=5, verbose=1)

# fix random seed for reproducibility
#seed = 7
#np.random.seed(seed)
	
#kfold = KFold(n_splits=2, random_state=seed)
#results = cross_val_score(estimator, X, y, cv=kfold)
#print("Results: %.2f (%.2f) MSE" % (results.mean(), results.std()))










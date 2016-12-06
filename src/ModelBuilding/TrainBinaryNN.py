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


def baseline_model():
	# create model
	model = Sequential()
	model.add(Dense(32, input_dim=9, init='normal', activation='relu'))
	model.add(Dense(16, init='normal', activation='relu'))
	model.add(Dense(1, init='normal', activation='sigmoid'))
	# Compile model
	# sgd = SGD(lr=.000001, decay=1e-6, momentum=0.9, nesterov=True)
	model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy','fmeasure'])
	return model




filename = "../../data/Quarter/nyc-encoded-2006.csv"
zeroes = "../../data//Quarter/nyc-zero-encoded-2006.csv"
dataset = np.loadtxt(fname = filename, delimiter = ',')
dataset2 = np.loadtxt(fname = zeroes, delimiter = ',')

filename3 = "../../data/Quarter/nyc-encoded-2007.csv"
zeroes3 = "../../data/Quarter/nyc-zero-encoded-2007.csv"
dataset3 = np.loadtxt(fname = filename3, delimiter = ',')
dataset30 = np.loadtxt(fname = zeroes3, delimiter = ',')


dta =  np.concatenate((dataset,dataset2))
dta = np.concatenate((dta,dataset3,dataset30))
#np.random.shuffle(dta)

X = dta[:,0:9]
y = dta[:,12]

print X
print y

print X


s = set(y)
print s



estimators = []
estimators.append(('standarize',StandardScaler()))
estimators.append(('mlp', KerasClassifier(build_fn=baseline_model,nb_epoch=20,verbose=1)))
pipeline = Pipeline(estimators)
# kfold = StratifiedKFold(n_splits=2, shuffle=True)

# results = cross_val_score(pipeline, X, y, cv=kfold)

# print results.mean() * 100
# print results.std() * 100



validationFileName = "../../data/Quarter/nyc-encoded-2009.csv"
zeroValidation = "../../data/Quarter/nyc-zero-encoded-2009.csv"

d1 = np.loadtxt(fname = validationFileName, delimiter = ',')
d2 = np.loadtxt(fname = zeroValidation, delimiter = ',')

d3 = np.concatenate((d1,d2))

X_test = d3[:,0:9]
y_test = d3[:,12]







pipeline.fit(X,y)
print '\n'

from sklearn.metrics import classification_report
from sklearn.metrics import confusion_matrix

y_true = y_test
y_pred = pipeline.predict(X_test)
print '\n'


print(classification_report(y_true, y_pred))

print confusion_matrix(y_true, y_pred)
# print pipeline.predict(X_test[0:30,:])

y_scores = pipeline.predict_proba(X_test)

fpr = dict()
tpr = dict()
roc_auc = dict()

print y_scores[:,0]
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
import numpy as np
import pandas
from keras.models import Sequential
from keras.layers import Dense
from keras.wrappers.scikit_learn import KerasRegressor
from sklearn.model_selection import cross_val_score
from sklearn.model_selection import KFold
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn import preprocessing
from keras.optimizers import SGD
from sklearn.preprocessing import StandardScaler



def baseline_model():
	# create model
	model = Sequential()
	model.add(Dense(32, input_dim=7, init='normal', activation='relu'))
	model.add(Dense(16, init='normal', activation='relu'))
	model.add(Dense(1, init='normal'))
	# Compile model
	# sgd = SGD(lr=.000001, decay=1e-6, momentum=0.9, nesterov=True)
	#ad  = Adam(lr=0.001, beta_1=0.9, beta_2=0.999, epsilon=1e-08, decay=0.0)
	model.compile(loss='mean_squared_error', optimizer='adam', metrics=['fmeasure','precision','recall'])
	return model



filename = "../../data/balanced/2006.csv"
zeroes = "../../data/balanced/zeros2006.csv"
dataset = np.loadtxt(fname = filename, delimiter = ',')
dataset2 = np.loadtxt(fname = zeroes, delimiter = ',')


dta =  np.concatenate((dataset,dataset2))
np.random.shuffle(dta)

X = dta[:,0:7]
y = dta[:,9]







# X = preprocessing.normalize(X, norm='l2')


scalerX = StandardScaler().fit(X)
# scalery = StandardScaler().fit(y)

X = scalerX.transform(X)
# y = scalery.transform(y)

model = baseline_model()



validationFileName = "../../data/balanced/2007.csv"
zeroValidation = "../../data/balanced/zeros2007.csv"

d1 = np.loadtxt(fname = validationFileName, delimiter = ',')
d2 = np.loadtxt(fname = zeroValidation, delimiter = ',')

d3 = np.concatenate((d1,d2))
np.random.shuffle(d3)

x_test = d3[:,0:7]
y_test = d3[:,9]
X_test = scalerX.transform(x_test)


model.fit(X, y, verbose=1, nb_epoch=6)

#print X[0]
print model.predict(X_test[0:30,:])

score = model.evaluate(X_test, y_test)
print score


#estimator = KerasRegressor(build_fn=baseline_model, nb_epoch=10, batch_size=5, verbose=1)

# fix random seed for reproducibility
#seed = 7
#np.random.seed(seed)
	
#kfold = KFold(n_splits=2, random_state=seed)
#results = cross_val_score(estimator, X, y, cv=kfold)
#print("Results: %.2f (%.2f) MSE" % (results.mean(), results.std()))
/**
 * This module constructs a Stats object with the maximum and 
 * minimum number of crimes and crime rate to maintain statistics
 * about the crimes currently occurring.
 */
 
module.exports = function Stats(max, min, crimeAverage) {

	var maxNumOfCrimes = max;
	var minNumOfCrimes = min;
	var crimeRate = crimeAverage;
	
	/**
	 * Gets the maximum number of incidents.
	 *
	 * @return int: the maximum number of incidents records.
	 */
	this.getMaxNumOfCrimes = function() {
		return maxNumOfCrimes;
	};
	
	/**
	 * Gets the minimum number of incidents.
	 *
	 * @return int: the minimum number of incidents records.
	 */
	this.getMinNumOfCrimes = function() {
		return minNumOfCrimes;
	};
	
	/**
	 * Gets the crimes rate.
	 *
	 * @return double: the crime rate
	 */
	this.getCrimeRate = function() {
		return crimeRate;
	};

};
/**
 * ClassificationStrategy module is i charge of classify each tile
 * that will become GeoZone
 */

/**
 * Module imports
 */
var numbers = require('numbers');

/**
 * @Constructor Get the strategy to be used
 */
module.exports = function ClassificationStrategy (log) {

	var level;
	var dictionaryArr;
	var median;
	var strategyLog = log;
	var upperThreshold;
	var lowerThreshold;

	/**
	 * This method calculate level of each tile
	 * @param max: is the maximun number of crime in a zone.
	 * @param min: is the minimun number of crime in a zone.
	 * @param count: is the crime count in a zone.
	 * @param strategy_callback: Callback function to return the linear quantization of the crime.
	 */
	this.classify = function(count, strategy_callback) {
		if(count > upperThreshold) {
			strategyLog.notice('The level of the crime count ' + count + ' is ', 10);
			strategy_callback(10, count, lowerThreshold, upperThreshold);
		}
		else if (count < lowerThreshold) {
			strategyLog.notice('The level of the crime count ' + count + ' is ', 1);
			strategy_callback(1, count, lowerThreshold, upperThreshold);
		}
		else {
			level = 1 + Math.round(((count-lowerThreshold)/(upperThreshold-lowerThreshold))*9);
			strategyLog.notice('The level of the crime count ' + count + ' is ', level);
			strategy_callback(level, count, lowerThreshold, upperThreshold);
		}
	}

	/**
	 * This method calculate the upper and lower bound threshold for the classification
	 * @param crimeDictionaryArr: is the array of distinct crime counter within zones.
	 * @param MAD: Median Absolute Deviation
	 * @param parameter_callback: Callback use when parameter are ready.
	 */
	this.findThreshold = function(crimeDictionaryArr, MAD, parameter_callback) {
		dictionaryArr = crimeDictionaryArr;
		median = numbers.statistic.median(crimeDictionaryArr);
		subtractMedian(function(found) {
			var newMedian = numbers.statistic.median(found);
			var k = newMedian * 1.4826;
			upperThreshold = median + (MAD*k);
			lowerThreshold = median - (MAD*k);
			console.log('The upper bound threshold was ' + upperThreshold + ' and the lower bound threshold was', lowerThreshold);
			strategyLog.notice('The upper bound threshold was' + upperThreshold + ' and the lower bound threshold was', lowerThreshold);
			parameter_callback();
		});
	}

	/**
	 * This method is use subtract the median from the crime counter (e.g [i-median, i+1-median, i+2-median]).
	 * @param subtract_callback: Callback use when subtractiong finished.
	 */
	var subtractMedian = function(subtract_callback) {
		var subtrationArr = [];
		for(var i = 0; i < dictionaryArr.length; i++) {
			subtrationArr.push(Math.abs(dictionaryArr[i] - median));
		}
		subtract_callback(subtrationArr.sort(function(a, b){return a-b}));
	}
}
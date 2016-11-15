/**
 * GridPoint module create point to be access as an object
 */

module.exports = function GridPoint (x, y, z) {

	var xPoint = x;
	var yPoint = y;
	var zPoint = z;

	/**
	 * This method return the value of X.
	 * @return Return the X point.
	 */
	this.getX = function() {
		return xPoint;

	}

	/**
	 * This method return the value of Y.
	 * @return Return the Y point.
	 */
	this.getY = function() {
		return yPoint;
	}

	/**
	 * This method return the value of Z.
	 * @return Return the Z point.
	 */
	this.getZ = function() {
		return zPoint;
	}
}
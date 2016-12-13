# turf-geometrycollection

[![build status](https://secure.travis-ci.org/Turfjs/turf-geometrycollection.png)](http://travis-ci.org/Turfjs/turf-geometrycollection)

turf geometrycollection module


### `turf.geometrycollection(geometries, properties)`

Creates a Feature based on a
coordinate array. Properties can be added optionally.


### Parameters

| parameter    | type                          | description                                                   |
| ------------ | ----------------------------- | ------------------------------------------------------------- |
| `geometries` | Array\.\<\{ Geometry: \* \}\> | an array of GeoJSON Geometries                                |
| `properties` | Object                        | _optional:_ an Object of key-value pairs to add as properties |


### Example

```js
var pt = { 
    "type": "Point",
      "coordinates": [100, 0]
    };
var line = {
    "type": "LineString",
    "coordinates": [ [101, 0], [102, 1] ]
  };
var collection = turf.geometrycollection([[0,0],[10,10]]);

//=collection
```


**Returns** `Feature.<GeometryCollection>`, a geometrycollection feature

## Installation

Requires [nodejs](http://nodejs.org/).

```sh
$ npm install turf-geometrycollection
```

## Tests

```sh
$ npm test
```



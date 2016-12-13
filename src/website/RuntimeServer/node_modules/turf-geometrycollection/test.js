var test = require('tape');
var geometrycollection = require('./')

test('geometrycollection', function(t){
  var pt = { 
        "type": "Point",
        "coordinates": [100, 0]
      };
  var line = { 
      "type": "LineString",
      "coordinates": [ [101, 0], [102, 1] ]
    };
  var gc = geometrycollection([pt, line]);

  t.deepEqual(gc, {
    "type": "Feature",
    "properties": {},
    "geometry": { 
        "type": "GeometryCollection",
        "geometries": [
          { 
            "type": "Point",
            "coordinates": [100, 0]
          },
          { 
            "type": "LineString",
            "coordinates": [ [101, 0], [102, 1] ]
          }
        ]
      }
    }, 'creates a GeometryCollection');

  var gcWithProps = geometrycollection([pt, line], {a: 23});
  t.deepEqual(gcWithProps, {
    "type": "Feature",
    "properties": {a: 23},
    "geometry": { 
        "type": "GeometryCollection",
        "geometries": [
          { 
            "type": "Point",
            "coordinates": [100, 0]
          },
          { 
            "type": "LineString",
            "coordinates": [ [101, 0], [102, 1] ]
          }
        ]
      }
    }, 'creates a GeometryCollection with properties');

  t.end();
});

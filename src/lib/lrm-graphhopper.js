(function () {
  "use strict";

  var L = require("leaflet");
  var polyline = require("polyline");

  L.Routing = L.Routing || {};

  L.Routing.GraphHopper = L.Evented.extend({
    initialize: function (apiKey, options) {
      this._apiKey = apiKey;
      L.Util.setOptions(this, options);
      this.options = {
        ...options,
        serviceUrl: "https://graphhopper.com/api/1/route",
        timeout: 30 * 1000,
        urlParameters: {},
      };
    },

    route: function (waypoints, callback, context, options) {
      var timedOut = false,
        wps = [],
        url,
        timer,
        wp,
        i;

      options = options || {};
      url = this.buildRouteUrl(waypoints, options);

      timer = setTimeout(function () {
        timedOut = true;
        callback.call(context || callback, {
          status: -1,
          message: "GraphHopper request timed out.",
        });
      }, this.options.timeout);

      // Create a copy of the waypoints, since they
      // might otherwise be asynchronously modified while
      // the request is being processed.
      for (i = 0; i < waypoints.length; i++) {
        wp = waypoints[i];
        wps.push({
          latLng: wp.latLng,
          name: wp.name,
          options: wp.options,
        });
      }

      var xhr = new XMLHttpRequest();
      xhr.open("POST", url, true); // Open the POST request
      xhr.setRequestHeader("Content-Type", "application/json"); // Set the content type to JSON

      // Set up the onreadystatechange callback to handle the response
      xhr.onreadystatechange = L.bind(function () {
        if (xhr.readyState === 4) {
          // When the request is complete
          clearTimeout(timer);
          if (!timedOut) {
            // Ensure we handle the response correctly
            var fired = xhr.status !== 200 ? { status: xhr.status } : xhr;
            this.fire("response", {
              status: fired.status,
              limit: Number(xhr.getResponseHeader("X-RateLimit-Limit")),
              remaining: Number(xhr.getResponseHeader("X-RateLimit-Remaining")),
              reset: Number(xhr.getResponseHeader("X-RateLimit-Reset")),
              credits: Number(xhr.getResponseHeader("X-RateLimit-Credits")),
            });

            if (xhr.status === 200) {
              try {
                var data = JSON.parse(xhr.response); // Parse the JSON response
                this._routeDone(data, wps, callback, context); // Handle the response data
              } catch (e) {
                callback.call(context || callback, {
                  status: -1,
                  message: "Failed to parse response.",
                  response: xhr.responseText,
                });
              }
            } else {
              var finalResponse;
              try {
                finalResponse = JSON.parse(xhr.responseText);
              } catch (e) {
                finalResponse = xhr.responseText;
              }

              callback.call(context || callback, {
                status: -1,
                message: "HTTP request failed: " + xhr.status,
                response: finalResponse,
              });
            }
          }
        }
      }, this);

      var avoid = [];

      if (this.options.avoid) {
        for (let i = 0; i < this.options.avoid.length; i++) {
          if (avoid.toString().length < 12500) {
            if (this.options.avoid[i]) {
              avoid.push([this.options.avoid[i][0], this.options.avoid[i][1]]);
            }
          }
        }
      }

      console.log(avoid);

      console.log(
        this.options.avoid.map(function (point) {
          return [
            [point[1] + 0.01, point[0] + 0.01],
            [point[1] + 0.01, point[0] - 0.01],
            [point[1] - 0.01, point[0] - 0.01],
            [point[1] - 0.01, point[0] + 0.01],
            [point[1] + 0.01, point[0] + 0.01],
          ];
        })
      );

      var requestBody = {
        points: waypoints.map(function (wp) {
          return [wp.latLng.lng, wp.latLng.lat];
        }),
        profile: "foot",
        elevation: true,
        instructions: true,
        locale: "en_US",
        points_encoded: false,
        custom_model: {
          priority: [{ if: "in_avoid", multiply_by: "0" }],
          areas: {
            avoid: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Polygon",
                coordinates: [
                  avoid.map(function (point) {
                    return [
                      [point[0] + 1, point[1] + 1],
                      [point[0] + 1, point[1] - 1],
                      [point[0] - 1, point[1] - 1],
                      [point[0] - 1, point[1] + 1],
                      [point[0] + 1, point[1] + 1],
                    ];
                  }),
                ],
              },
            },
          },
        },
        "ch.disable": true,
        "alternative_route.max_paths": 3,
        algorithm: "alternative_route",
      };

      var requestBodyString = JSON.stringify(requestBody);

      // Send the POST request with the stringified JSON body
      xhr.send(requestBodyString);

      return this;
    },

    _routeDone: function (response, inputWaypoints, callback, context) {
      var alts = [],
        mappedWaypoints,
        coordinates,
        i,
        path;

      context = context || callback;
      if (
        response.info &&
        response.info.errors &&
        response.info.errors.length
      ) {
        callback.call(context, {
          // TODO: include all errors
          status: response.info.errors[0].details,
          message: response.info.errors[0].message,
        });
        return;
      }

      for (i = 0; i < response.paths.length; i++) {
        path = response.paths[i];
        coordinates = this._decodePolyline(path.points);
        if (path.points_order) {
          var tempWaypoints = [];
          for (i = 0; i < path.points_order.length; i++) {
            tempWaypoints.push(inputWaypoints[path.points_order[i]]);
          }
          inputWaypoints = tempWaypoints;
        }
        mappedWaypoints = this._mapWaypointIndices(
          inputWaypoints,
          path.instructions,
          coordinates
        );

        alts.push({
          name: "",
          coordinates: coordinates,
          instructions: this._convertInstructions(path.instructions),
          summary: {
            totalDistance: path.distance,
            totalTime: path.time / 1000,
            totalAscend: path.ascend,
          },
          inputWaypoints: inputWaypoints,
          actualWaypoints: mappedWaypoints.waypoints,
          waypointIndices: mappedWaypoints.waypointIndices,
        });
      }

      callback.call(context, null, alts);
    },

    _decodePolyline: function (geometry) {
      var coords = geometry.coordinates,
        latlngs = new Array(coords.length),
        i;
      for (i = 0; i < coords.length; i++) {
        latlngs[i] = new L.LatLng(coords[i][0], coords[i][1]);
        latlngs[i] = new L.LatLng(coords[i][1], coords[i][0]);
      }
      // console.log({latlngs})

      return latlngs;
    },

    _toWaypoints: function (inputWaypoints, vias) {
      var wps = [],
        i;
      for (i = 0; i < vias.length; i++) {
        wps.push({
          latLng: L.latLng(vias[i]),
          name: inputWaypoints[i].name,
          options: inputWaypoints[i].options,
        });
      }

      return wps;
    },

    buildRouteUrl: function (waypoints, options) {
      var baseUrl = this.options.serviceUrl;

      return (
        baseUrl +
        L.Util.getParamString(
          L.extend(
            {
              key: this._apiKey,
            },
            this.options.urlParameters
          ),
          baseUrl
        )
      );
    },

    _convertInstructions: function (instructions) {
      var signToType = {
          "-7": "SlightLeft",
          "-3": "SharpLeft",
          "-2": "Left",
          "-1": "SlightLeft",
          0: "Straight",
          1: "SlightRight",
          2: "Right",
          3: "SharpRight",
          4: "DestinationReached",
          5: "WaypointReached",
          6: "Roundabout",
          7: "SlightRight",
        },
        result = [],
        type,
        i,
        instr;

      for (i = 0; instructions && i < instructions.length; i++) {
        instr = instructions[i];
        if (i === 0) {
          type = "Head";
        } else {
          type = signToType[instr.sign];
        }
        result.push({
          type: type,
          modifier: type,
          text: instr.text,
          distance: instr.distance,
          time: instr.time / 1000,
          index: instr.interval[0],
          exit: instr.exit_number,
        });
      }

      return result;
    },

    _mapWaypointIndices: function (waypoints, instructions, coordinates) {
      var wps = [],
        wpIndices = [],
        i,
        idx;

      wpIndices.push(0);
      wps.push(new L.Routing.Waypoint(coordinates[0], waypoints[0].name));

      for (i = 0; instructions && i < instructions.length; i++) {
        if (instructions[i].sign === 5) {
          // VIA_REACHED
          idx = instructions[i].interval[0];
          wpIndices.push(idx);
          wps.push({
            latLng: coordinates[idx],
            name: waypoints[wps.length + 1].name,
          });
        }
      }

      wpIndices.push(coordinates.length - 1);
      wps.push({
        latLng: coordinates[coordinates.length - 1],
        name: waypoints[waypoints.length - 1].name,
      });

      return {
        waypointIndices: wpIndices,
        waypoints: wps,
      };
    },
  });

  L.Routing.graphHopper = function (apiKey, options) {
    return new L.Routing.GraphHopper(apiKey, options);
  };

  module.exports = L.Routing.GraphHopper;
})();

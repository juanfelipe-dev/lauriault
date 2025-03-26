import React, { useEffect, useCallback, useState, useRef } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "@vis.gl/react-maplibre";
import { ScatterplotLayer, HeatmapLayer, H3ClusterLayer } from "deck.gl";
import { PickingInfo } from "@deck.gl/core";
import { geoToH3, h3ToGeo } from "h3-js";

// Internal Imports
import { MapState } from "./types/map";
import { loadCSV } from "./lib/loaders";
import Select from "./components/select";

const App = () => {
  const [queryParams, setQueryParams] = useState(
    new URLSearchParams(window.location.search)
  );

  useEffect(() => {
    const handleUrlChange = () => {
      setQueryParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener("popstate", handleUrlChange);

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, []);

  // Choose an H3 resolution (lower numbers give larger cells)
  const resolution = queryParams.get("resolution")
    ? parseInt(queryParams.get("resolution") || "8")
    : 8;

  const popuNorm = queryParams.get("popuNorm")
    ? parseInt(queryParams.get("popuNorm") || "5")
    : 5;

  const topK = queryParams.get("topK")
    ? parseInt(queryParams.get("topK") || "10")
    : 10;

  const attPopuScaling = queryParams.get("attPopuScaling")
    ? parseInt(queryParams.get("attPopuScaling") || "2")
    : 2;

  const attOCScaling = queryParams.get("attOCScaling")
    ? parseInt(queryParams.get("attOCScaling") || "50")
    : 50;

  const popuOCScaling = queryParams.get("popuOCScaling")
    ? parseInt(queryParams.get("popuOCScaling") || "2")
    : 2;

  const [viewState] = useState<MapState>({
    latitude: 45.424721,
    longitude: -75.695,
    zoom: 11,
    maxZoom: 18,
    pitch: 60,
    bearing: 0,
  });

  // Aggregates data points by computing an H3 index for each point at the given resolution.
  const aggregateH3 = (
    data: any[],
    resolution: number
  ): Record<string, { count: number }> => {
    const bins: Record<string, { count: number }> = {};
    data.forEach((d) => {
      let lat: number | undefined, lon: number | undefined;
      if (d.Area) {
        lat = parseFloat(d.Area.Position.Latitude);
        lon = parseFloat(d.Area.Position.Longitude);
      } else if (d.POI) {
        lat = parseFloat(d.POI.Position.Latitude);
        lon = parseFloat(d.POI.Position.Longitude);
      } else if (d.Vehicle) {
        lat = parseFloat(d.Vehicle.Position.Latitude);
        lon = parseFloat(d.Vehicle.Position.Longitude);
      }
      if (lat === undefined || lon === undefined) return;
      const h3Index = geoToH3(lat, lon, resolution);
      if (!bins[h3Index]) {
        bins[h3Index] = { count: 0 };
      }

      if (d.Area) {
        bins[h3Index].count += d.message / popuNorm;
      } else {
        bins[h3Index].count++;
      }
    });
    return bins;
  };

  // Computes differences between two aggregated H3 datasets.
  function computeDiffH3(binA, binB) {
    const diffBins = {};
    const keys = new Set([...Object.keys(binA), ...Object.keys(binB)]);
    keys.forEach((key) => {
      const countA = binA[key] ? binA[key].count : 0;
      const countB = binB[key] ? binB[key].count : 0;

      // Difference Metrics
      // const diff = Math.abs(countA - countB);
      const diff = countA - countB;
      // const diff = (Math.abs(countA - countB) / ((countA + countB) / 2)) * 100;

      diffBins[key] = { diff: diff, h3Index: key };
    });
    return diffBins;
  }

  // Tooltip callback remains unchanged
  const getTooltip = useCallback(({ object }: PickingInfo) => {
    if (!object) return;
    // console.log(object);
    return object && object.message;
  }, []);

  const [currentLayer, setCurrentLayer] = useState<any>([]);

  // Use a ref to accumulate processed data points (instead of layers)
  const OCdataRef = useRef<any[]>([]);
  const [OCdataPoints, setOCDataPoints] = useState<ScatterplotLayer[]>([]);

  const attDataRef = useRef<any[]>([]);
  const [attDataPoints, setAttDataPoints] = useState<ScatterplotLayer[]>([]);

  const popuDataRef = useRef<any[]>([]);
  const [popuDataPoints, setPopuDataPoints] = useState<ScatterplotLayer[]>([]);

  // Difference
  const [attPopuData, setAttPopuData] = useState<any[]>([]);

  const [attOCData, setAttOCData] = useState<any[]>([]);

  const [popuOCData, setPopuOCData] = useState<any[]>([]);

  // Top K
  const [topAttPopu, setTopAttPopu] = useState<any[]>([]);
  const [topAttOC, setTopAttOC] = useState<any[]>([]);
  const [topPopuOC, setTopPopuOC] = useState<any[]>([]);

  // Throttle updates to state so we don't update for every single data point
  useEffect(() => {
    const interval = setInterval(() => {
      if (OCdataRef.current.length > 0) {
        setOCDataPoints([...OCdataRef.current]);
      }
      if (attDataRef.current.length > 0) {
        setAttDataPoints([...attDataRef.current]);
      }
      if (popuDataRef.current.length > 0) {
        setPopuDataPoints([...popuDataRef.current]);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Process geojson in batches
  useEffect(() => {
    loadCSV("/data/population/population_dissemination_areas.csv").then(
      (res: any) => {
        for (const row of res.data) {
          if (
            // Ottawa area
            row["latitude"] < 45.5292 &&
            row["latitude"] > 45.2275 &&
            row["longitude"] < -75.2444 &&
            row["longitude"] > -75.9342
          ) {
            popuDataRef.current.push({
              message: row["count"],
              Area: {
                Position: {
                  Latitude: parseFloat(row["latitude"]),
                  Longitude: parseFloat(row["longitude"]),
                },
              },
            });
          }
        }
      }
    );
    loadCSV("/data/entertainment/local_entertainment.csv").then((res: any) => {
      for (const row of res.data) {
        attDataRef.current.push({
          message: row["Name"],
          POI: {
            Position: {
              Latitude: parseFloat(row["latitude"]),
              Longitude: parseFloat(row["longitude"]),
            },
          },
        });
      }
    });
    loadCSV("/data/transportation/oc_transpo.csv").then((res: any) => {
      for (const row of res.data) {
        OCdataRef.current.push({
          message: row["vehicle id"],
          Vehicle: {
            Position: {
              Latitude: parseFloat(row["latitude"]),
              Longitude: parseFloat(row["longitude"]),
            },
          },
        });
      }
    });
  }, []);

  // Once both datasets are loaded, aggregate using H3 and compute the difference
  useEffect(() => {
    if (
      popuDataPoints.length > 0 &&
      attDataPoints.length > 0 &&
      OCdataPoints.length > 0
    ) {
      const popuBins = aggregateH3(popuDataPoints, resolution);
      const attBins = aggregateH3(attDataPoints, resolution);
      const ocBins = aggregateH3(OCdataPoints, resolution);

      const attPopuBins = computeDiffH3(popuBins, attBins);
      const attOCBins = computeDiffH3(ocBins, attBins);
      const popuOCBins = computeDiffH3(ocBins, popuBins);

      // Convert diffBins into an array and compute the center coordinates for each H3 cell.
      const attPopuDiff = Object.keys(attPopuBins).map((key) => {
        // h3ToGeo returns [lat, lon]. For Deck.gl we need [lon, lat]
        const center = h3ToGeo(key);
        return {
          h3Index: [key],
          diff: attPopuBins[key].diff * attPopuScaling,
          coordinates: [center[1], center[0]],
        };
      });
      const attOCDiff = Object.keys(attOCBins).map((key) => {
        // h3ToGeo returns [lat, lon]. For Deck.gl we need [lon, lat]
        const center = h3ToGeo(key);
        return {
          h3Index: [key],
          diff: attOCBins[key].diff * attOCScaling,
          coordinates: [center[1], center[0]],
        };
      });
      const popuOCDiff = Object.keys(popuOCBins).map((key) => {
        // h3ToGeo returns [lat, lon]. For Deck.gl we need [lon, lat]
        const center = h3ToGeo(key);
        return {
          h3Index: [key],
          diff: popuOCBins[key].diff * popuOCScaling,
          coordinates: [center[1], center[0]],
        };
      });

      // Get top 10 hexagons values clone the array
      const topAttPopu = attPopuDiff.sort(
        (a, b) => Math.abs(a.diff) - Math.abs(b.diff)
      );
      const topAttOC = attOCDiff.sort(
        (a, b) => Math.abs(a.diff) - Math.abs(b.diff)
      );
      const topPopuOC = popuOCDiff.sort(
        (a, b) => Math.abs(a.diff) - Math.abs(b.diff)
      );

      // Print top K hexagons
      setTopAttPopu(topAttPopu.slice(0, topK));
      setTopAttOC(topAttOC.slice(0, topK));
      setTopPopuOC(topPopuOC.slice(0, topK));

      setAttOCData(attOCDiff);
      setPopuOCData(popuOCDiff);
      setAttPopuData(attPopuDiff);
    }
  }, [
    popuDataPoints,
    attDataPoints,
    OCdataPoints,
    resolution,
    attOCScaling,
    attPopuScaling,
    popuOCScaling,
  ]);

  // Create a single HeatmapLayer using the aggregated dataPoints.
  const ocHeatmapLayer = new HeatmapLayer({
    id: "ocHeatmap-layer",
    data: OCdataPoints,
    // Convert each data point to a [longitude, latitude] coordinate.
    getPosition: (d: any) => [
      d.Vehicle?.Position?.Longitude || 0,
      d.Vehicle?.Position?.Latitude || 0,
    ],
    // Adjust these parameters as needed:
    radiusPixels: 70,
    intensity: 2,
    threshold: 0.005,
    colorRange: [
      [254, 196, 79, 150],
      [254, 153, 41, 150],
      [236, 112, 20, 150],
      [204, 76, 2, 150],
      [153, 52, 4, 150],
      [102, 37, 6, 150],
    ],
  });

  // Create a single HeatmapLayer using the aggregated dataPoints.
  const attHeatmapLayer = new HeatmapLayer({
    id: "attHeatmap-layer",
    data: attDataPoints,
    // Convert each data point to a [longitude, latitude] coordinate.
    getPosition: (d: any) => [
      d.POI?.Position?.Longitude || 0,
      d.POI?.Position?.Latitude || 0,
    ],
    // Adjust these parameters as needed:
    radiusPixels: 70,
    intensity: 2,
    threshold: 0.01,
    colorRange: [
      [161, 217, 155, 150],
      [116, 196, 118, 150],
      [65, 171, 93, 150],
      [35, 139, 69, 150],
      [0, 109, 44, 150],
      [0, 68, 27, 150],
    ],
  });

  // Create a single HeatmapLayer using the aggregated dataPoints.
  const popuHeatmapLayer = new HeatmapLayer({
    id: "popuHeatmap-layer",
    data: popuDataPoints,
    // Convert each data point to a [longitude, latitude] coordinate.
    getPosition: (d: any) => [
      d.Area?.Position?.Longitude || 0,
      d.Area?.Position?.Latitude || 0,
    ],
    getWeight: (d: any) => d.message,
    // Adjust these parameters as needed:
    radiusPixels: 70,
    intensity: 2,
    threshold: 0.01,
    colorRange: [
      [158, 202, 225, 150],
      [107, 174, 214, 150],
      [66, 146, 198, 150],
      [33, 113, 181, 150],
      [8, 81, 156, 150],
      [8, 48, 107, 150],
    ],
  });

  // Create an H3ClusterLayer to visualize the aggregated differences.
  const attPopuLayer = new H3ClusterLayer({
    id: "attPopuLayer",
    data: attPopuData,
    resolution,
    // Return the array of hexIds for each data object.
    getHexagons: (d) => d.h3Index,
    // Extrude each cell based on the absolute difference value.
    extruded: true,
    // Here you can use a constant weight or compute a value from d.diff
    getElevationWeight: (d) => Math.abs(d.diff),
    getFillColor: (d) => [255, (Math.abs(d.diff) / 500) * 255, 0, 150],
    elevationAggregation: "SUM",
    elevationScale: 0,
  });

  const attOCLayer = new H3ClusterLayer({
    id: "attOCLayer",
    data: attOCData,
    resolution,
    // Return the array of hexIds for each data object.
    getHexagons: (d) => d.h3Index,
    // Extrude each cell based on the absolute difference value.
    extruded: true,
    // Here you can use a constant weight or compute a value from d.diff
    getElevationWeight: (d) => Math.abs(d.diff),
    getFillColor: (d) => [255, (Math.abs(d.diff) / 500) * 255, 0, 150],
    elevationAggregation: "SUM",
    elevationScale: 0,
  });

  const popuOCLayer = new H3ClusterLayer({
    id: "popuOCLayer",
    data: popuOCData,
    resolution,
    // Return the array of hexIds for each data object.
    getHexagons: (d) => d.h3Index,
    // Extrude each cell based on the absolute difference value.
    extruded: true,
    // Here you can use a constant weight or compute a value from d.diff
    getElevationWeight: (d) => Math.abs(d.diff),
    getFillColor: (d) => [255, (Math.abs(d.diff) / 500) * 255, 0, 150],
    elevationAggregation: "SUM",
    elevationScale: 0,
  });

  const topKPopuOC = new ScatterplotLayer({
    id: "topKPopuOC",
    data: topPopuOC,
    filled: true,

    stroked: true,
    getPosition: (d) => d.coordinates,
    getRadius: 10,
    getFillColor: [255, 255, 255],
    getLineColor: [0, 0, 0],
    getLineWidth: 10,
    radiusScale: 6,
  });

  const topKAttOC = new ScatterplotLayer({
    id: "topKAttOC",
    data: topAttOC,
    filled: true,

    stroked: true,
    getPosition: (d) => d.coordinates,
    getRadius: 10,
    getFillColor: [255, 255, 255],
    getLineColor: [0, 0, 0],
    getLineWidth: 10,
    radiusScale: 6,
  });

  const topKAttPopu = new ScatterplotLayer({
    id: "topKAttPopu",
    data: topAttPopu,
    filled: true,

    stroked: true,
    getPosition: (d) => d.coordinates,
    getRadius: 10,
    getFillColor: [255, 255, 255],
    getLineColor: [0, 0, 0],
    getLineWidth: 10,
    radiusScale: 6,
  });

  const data = [
    {
      name: "Default",
      desc: "",
      onClick: () => {
        setCurrentLayer([]);
      },
      legend: "",
      label: ["", ""],
    },
    {
      name: "Transportation Heatmap",
      desc: "2.1 million datapoints indicating the Density of OC Transpo Buses over a week",
      onClick: () => {
        setCurrentLayer([ocHeatmapLayer]);
      },
      legend: "bg-gradient-to-r from-amber-300 to-yellow-800",
      label: ["Low Visits", "High Visits"],
    },
    {
      name: "Entertainment Heatmap",
      desc: "Density Heatmap of Local Entertainment Locations in Ottawa (Plotted using Google Maps Places API & Google My Maps)",
      onClick: () => {
        setCurrentLayer([attHeatmapLayer]);
      },
      legend: "bg-gradient-to-r from-green-300 to-green-900",
      label: ["Less Venues", "Many Venues"],
    },
    {
      name: "Population Heatmap",
      desc: "Density Heatmap of Population in Ottawa by Dissemination Area (Plotted using 2021 Census Data)",
      onClick: () => {
        setCurrentLayer([popuHeatmapLayer]);
      },
      legend: "bg-gradient-to-r from-blue-300 to-blue-900",
      label: ["Low Density", "High Density"],
    },
    {
      name: "Entertainment Population Difference Map",
      desc: "Clustered using H3 indexing to show the difference in density between Local Entertainment and Ottawa Population Habitation Density",
      onClick: () => {
        setCurrentLayer([attPopuLayer, topKAttPopu]);
      },
      legend: "bg-gradient-to-r from-yellow-200 to-red-800",
      label: ["Low Interest", "High Interest"],
    },
    {
      name: "Entertainment Transport Difference Map",
      desc: "Clustered using H3 indexing to show the difference in density between Local Entertainment and OC Transpo (Public Transportation)",
      onClick: () => {
        setCurrentLayer([attOCLayer, topKAttOC]);
      },
      legend: "bg-gradient-to-r from-yellow-200 to-red-800",
      label: ["Low Interest", "High Interest"],
    },
    {
      name: "Population Transport Difference Map",
      desc: "Clustered using H3 indexing to show the difference in density between Ottawa Population Habitation Density and OC Transpo (Public Transportation)",
      onClick: () => {
        setCurrentLayer([popuOCLayer, topKPopuOC]);
      },
      legend: "bg-gradient-to-r from-yellow-200 to-red-800",
      label: ["Low Interest", "High Interest"],
    },
  ];

  return (
    <>
      <div className="hidden lg:block">
        <div className="fixed w-screen z-50">
          <Select data={data} />
        </div>
        <DeckGL
          layers={[currentLayer]}
          initialViewState={viewState}
          controller={true}
          getTooltip={getTooltip}
        >
          <Map
            mapStyle={`https://api.maptiler.com/maps/dataviz/style.json?key=${process.env.MAPTILER_API}`}
          />
        </DeckGL>
      </div>
      <div className="lg:hidden flex justify-center items-center h-screen bg-black p-2">
        <h1 className="text-2xl text-center font-serif text-white">
          Please view this on a larger screen
        </h1>
      </div>
    </>
  );
};

export default App;

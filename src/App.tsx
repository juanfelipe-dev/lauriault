import React, { useEffect, useCallback } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "@vis.gl/react-maplibre";
import { useState } from "react";

// Internal Imports
import { MapState } from "./types/map";
import {
  csvToIconLayer,
  csvToScatterPlotLayer,
} from "./components/layers/scatterPlotLayer";
import { loadCSV } from "./lib/loaders";
import { IconLayer, ScatterplotLayer, TripsLayer } from "deck.gl";
import { PickingInfo } from "@deck.gl/core";

function App() {
  const [viewState] = useState<MapState>({
    latitude: 45.424721,
    longitude: -75.695,
    zoom: 11,
    maxZoom: 18,
    pitch: 60,
    bearing: 0,
  });

  // Callback to populate the default tooltip with content
  const getTooltip = useCallback(({ object }: PickingInfo) => {
    if (!object) return;
    console.log(object);
    return object && object.message;
  }, []);

  const [scatterPlotLayer, setScatterPlotLayer] = useState<ScatterplotLayer>();
  const [iconLayer, setIconLayer] = useState<IconLayer>();

  useEffect(() => {
    setInterval(function () {
      fetch("/api/VehiclePositions?format=json", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          "Ocp-Apim-Subscription-Key": "c9e66b56ed1d4c319884a4a8a3bc891c",
        },
      })
        .then((response) => {
          console.log(response.status);
          return response.json();
        })
        .then((response) => {
          console.log(response);
          setScatterPlotLayer(csvToScatterPlotLayer(response.Entity));
        })
        .catch((err) => console.error(err));
    }, 20000);

    fetch("/api/VehiclePositions?format=json", {
      method: "GET",
      headers: {
        "Cache-Control": "no-cache",
        "Ocp-Apim-Subscription-Key": "c9e66b56ed1d4c319884a4a8a3bc891c",
      },
    })
      .then((response) => {
        console.log(response.status);
        return response.json();
      })
      .then((response) => {
        console.log(response);
        setScatterPlotLayer(csvToScatterPlotLayer(response.Entity));
      })
      .catch((err) => console.error(err));
    // loadCSV("/data/healthcare/odhf.csv").then((res) => {
    //   setScatterPlotLayer(csvToScatterPlotLayer(res.data));
    //   setIconLayer(csvToIconLayer(res.data));
    // });
  }, []);

  return (
    <DeckGL
      layers={[scatterPlotLayer]}
      initialViewState={viewState}
      controller={true}
      getTooltip={getTooltip}
    >
      <Map mapStyle="https://api.maptiler.com/maps/dataviz/style.json?key=j64fvxSlRObnZH923Gap" />
    </DeckGL>
  );
}

export default App;

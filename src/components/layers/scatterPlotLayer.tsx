// External Imports
import { IconLayer, ScatterplotLayer } from "@deck.gl/layers";

// Internal Imports
import { DefaultIcon } from "../../types/icon";

// NOTE: Change type to tightly coupled value
const csvToIconLayer = (data: Array<any>) => {
  const layer = new IconLayer<any>({
    id: "IconLayer",
    data: data,
    getIcon: () => "marker-warning",
    getPosition: (d) => [d.longitude, d.latitude],
    getSize: 20,
    iconAtlas:
      "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
    iconMapping:
      "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.json",
    pickable: true,
  });
  return layer;
};

// const csvToScatterPlotLayer = (data: Array<any>) => {
//   const layer = new ScatterplotLayer<any>({
//     id: "ScatterplotLayer",
//     data: data,
//     getColor: () => [155, 40, 0],
//     getPosition: (d) => [d.longitude, d.latitude],
//     getRadius: 20,
//     radiusMinPixels: 2,
//   });
//   return layer;
// };

// NOTE: THIS ONE IS FOR OC
const csvToScatterPlotLayer = (data: Array<any>) => {
  const layer = new ScatterplotLayer<any>({
    id: "ScatterplotLayer",
    data: data,
    getColor: () => [155, 40, 0],
    getPosition: (d) => [
      d.Vehicle.Position.Longitude,
      d.Vehicle.Position.Latitude,
    ],
    getRadius: 10,
    radiusMinPixels: 2,
  });
  return layer;
};

export { csvToIconLayer, csvToScatterPlotLayer };

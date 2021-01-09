import React from 'react';
import DeckGL from '@deck.gl/react';
import { StaticMap } from 'react-map-gl';
import { GeoJsonLayer } from '@deck.gl/layers';
import { PathStyleExtension } from '@deck.gl/extensions';
import * as d3 from 'd3';

import stationData from '../data/tokyo_moving60.geojson';
import railData from '../data/N02-19_RailroadSection.geojson';

import { railColor, railDashArray } from '../color';


// Initial viewport settings
const initialViewState = {
  longitude: 139.7,
  latitude: 35.7,
  zoom: 11,
  pitch: 0,
  bearing: 0
};

const colorScale = d3.interpolateTurbo;


// Layers can be child component or "layer" prop of <DeckGL>
const RailwayMap = () => (
  <DeckGL
    initialViewState={initialViewState}
    controller={true}
  >
    <StaticMap mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN} />
    <GeoJsonLayer
      id="rail-layer"
      data={railData}
      getLineWidth={2}
      getLineColor={railColor}
      lineWidthScale={30}
      lineWidthMinPixels={2}
      opacity={0.4}
      getDashArray={railDashArray}
      dashJustified={false}
      highPrecisionDash={true}
      extensions={[new PathStyleExtension({dash: true})]}
    />
    <GeoJsonLayer
      id="station-layer"
      data={stationData}
      getRadius={100}
      pointRadiusMinPixels={5}
      filled={true}
      stroked={false}
      opacity={0.8}
      getFillColor={f => {
        const color = d3.color(colorScale(parseInt(f.properties.time) / 60));
        return [color.r, color.g, color.b];
      }}
    />
  </DeckGL>
);


export default RailwayMap;

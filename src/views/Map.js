import React, { useEffect, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { StaticMap } from 'react-map-gl';
import { GeoJsonLayer } from '@deck.gl/layers';
import { PathStyleExtension } from '@deck.gl/extensions';
import * as d3 from 'd3';
import {
  Box,
  Divider,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Select,
  HStack
} from '@chakra-ui/react';

import stationData from '../data/tokyo_moving60.geojson';
import railData from '../data/N02-19_RailroadSection.geojson';

import { railColor, railDashArray, colorInterpolates } from '../color';


// Initial viewport settings
const initialViewState = {
  longitude: 139.7,
  latitude: 35.7,
  zoom: 11,
  pitch: 0,
  bearing: 0
};


const RailwayMap = () => {
  const initMaxMinutes = 30;
  const [maxMinutes, setMaxMinutes] = useState(initMaxMinutes);
  const [layers, setLayers] = useState([]);
  const [adaptive, setAdaptive] = useState(false);
  const [colorScaleName, setColorScaleName] = useState(Object.keys(colorInterpolates)[0]);
  const colorInterpolate = colorInterpolates[colorScaleName];
  const colorRange = adaptive ? maxMinutes : 60;
  const colorScale = time => d3.color(colorInterpolate(parseInt(time) / colorRange));

  useEffect(() => {
    setLayers([
      new GeoJsonLayer({
        id: "rail-layer",
        data: railData,
        getLineWidth: 2,
        getLineColor: railColor,
        lineWidthScale: 30,
        lineWidthMinPixels: 2,
        opacity: 0.4,
        getDashArray: railDashArray,
        dashJustified: false,
        highPrecisionDash: true,
        extensions: [new PathStyleExtension({ dash: true })]
      }),
      new GeoJsonLayer({
        id: "station-layer",
        data: stationData,
        getRadius: 100,
        updateTriggers: {
          getFillColor: [maxMinutes, adaptive, colorScaleName]
        },
        pointRadiusMinPixels: 5,
        filled: true,
        stroked: false,
        opacity: 0.8,
        getFillColor: f => {
          const reachable = parseInt(f.properties.time) <= maxMinutes;
          const color = colorScale(f.properties.time);
          return [color.r, color.g, color.b, (reachable ? 255 : 0)];
        }
      })
    ]);
  }, [maxMinutes, adaptive, colorScaleName])


  return (
    <>
      <DeckGL
        initialViewState={initialViewState}
        controller={true}
        layers={layers}
      >
        <StaticMap mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN} />
      </DeckGL>
      <Box
        w="300px"
        h="250px"
        boxShadow="md"
        rounded="md"
        bg="white"
        zIndex={999}
        pos="absolute"
        top="10"
        left="10"
        p="4"
      >
        <div>Maximum minutes: <b>{maxMinutes}</b> [min]</div>
        <Slider
          aria-label="slider-ex-1"
          defaultValue={initMaxMinutes}
          min={0}
          max={60}
          onChange={value => setMaxMinutes(value)}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>

        <Divider m="2" />
        <HStack spacing="0px">
          <Box pr="2">0</Box>
          {d3.range(maxMinutes).map(d => {
            return <Box h="20px" w="4px" key={d} bg={colorScale(d)?.formatHex()} />
          })}
          <Box pl="2">{maxMinutes}</Box>
        </HStack>

        <Divider m="2" />
        <Select
          variant="filled"
          onChange={event => setColorScaleName(event.target.value)}
        >
          {Object.entries(colorInterpolates).map((d, i) => (
            <option value={d[0]} key={i}>Color scale: {d[0]}</option>
          ))}
        </Select>

        <Divider m="2" />
        <Box textAlign="right">
          <span>Adaptive color scale</span>
          <Switch
            ml={4}
            isChecked={adaptive}
            onChange={event => setAdaptive(event.target.checked)}
          />
        </Box>

      </Box>
    </>
  )
};


export default RailwayMap;

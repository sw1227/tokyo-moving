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
import { mapStyles } from '../constants';


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
  const initMaxTransit = 1;
  const [maxMinutes, setMaxMinutes] = useState(initMaxMinutes);
  const [maxTransit, setMaxTransit] = useState(initMaxTransit);
  const [layers, setLayers] = useState([]);
  const [hoverInfo, setHoverInfo] = useState();
  const [adaptive, setAdaptive] = useState(false);
  const [mapStyle, setMapStyle] = useState(Object.values(mapStyles)[0]);
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
        extensions: [new PathStyleExtension({ dash: true })],
        pickable: true,
        onHover: setHoverInfo
      }),
      new GeoJsonLayer({
        id: "station-layer",
        data: stationData,
        getRadius: 100,
        updateTriggers: {
          getFillColor: [maxMinutes, adaptive, colorScaleName, maxTransit]
        },
        pointRadiusMinPixels: 5,
        filled: true,
        stroked: false,
        opacity: 0.8,
        getFillColor: f => {
          const reachable = parseInt(f.properties.time) <= maxMinutes;
          const isTransitOk = parseInt(f.properties.transit_count) <= maxTransit;
          const color = colorScale(f.properties.time);
          return [color.r, color.g, color.b, (reachable && isTransitOk ? 255 : 0)];
        },
        pickable: true,
        onHover: setHoverInfo
      })
    ]);
  }, [maxMinutes, maxTransit, adaptive, colorScaleName])


  return (
    <>
      <DeckGL
        initialViewState={initialViewState}
        controller={true}
        layers={layers}
      >
        <StaticMap
          mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          mapStyle={mapStyle}
        />
        {hoverInfo?.object && (
          <Box
            pos="absolute"
            zIndex={999}
            pointerEvents="none"
            top={hoverInfo.y}
            left={hoverInfo.x}
            boxShadow="md"
            rounded="xs"
            bg="rgba(255, 255, 255, 0.8)"
            fontSize="0.8rem"
            p="1"
          >
            {(hoverInfo.layer.id === "station-layer") && (
              <>
                { hoverInfo.object.properties.name}
                < br />
                { hoverInfo.object.properties.time}[min]
                /
                乗り換え{hoverInfo.object.properties.transit_count}回
              </>
            )}
            {(hoverInfo.layer.id === "rail-layer") && (
              <>
                {hoverInfo.object.properties["路線名"]}
              </>
            )}
          </Box>
        )}
      </DeckGL>
      <Box
        w="300px"
        h="500px"
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
          step={5}
          onChange={setMaxMinutes}
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

        <Divider m="2" />
        <Box>
          <Select
            variant="filled"
            onChange={event => setMapStyle(event.target.value)}
          >
            {Object.entries(mapStyles).map((d, i) => (
              <option value={d[1]} key={i}>Map style: {d[0]}</option>
            ))}
          </Select>
        </Box>

        <Divider m="2" />
        <Box>
          <div>Transit count ≦ <b>{maxTransit}</b></div>
          <Slider
            aria-label="slider-ex-1"
            defaultValue={initMaxTransit}
            min={0}
            max={1}
            onChange={setMaxTransit}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </Box>

      </Box>
    </>
  )
};


export default RailwayMap;

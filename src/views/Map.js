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
  Select,
  HStack,
  VStack,
  Checkbox,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  Slider, SliderTrack, SliderFilledTrack, SliderThumb,
  Table, Thead, Tbody, Tr, Th, Td
} from '@chakra-ui/react';

import stationData from '../data/tokyo_moving60.geojson';
import railData from '../data/N02-19_RailroadSection.geojson';
import priceTokyo from '../data/L01-20_13.geojson';

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
  const [stations, setStations] = useState([]);
  const [layers, setLayers] = useState([]);
  const [hoverInfo, setHoverInfo] = useState();
  const [adaptive, setAdaptive] = useState(false);
  const [checkedLayers, setCheckedLayers] = useState({
    station: true,
    railway: true,
    price: false
  });
  const [mapStyle, setMapStyle] = useState(Object.values(mapStyles)[0]);
  const [colorScaleName, setColorScaleName] = useState(Object.keys(colorInterpolates)[0]);
  const colorInterpolate = colorInterpolates[colorScaleName];
  const colorRange = adaptive ? maxMinutes : 60;
  const colorScale = time => d3.color(colorInterpolate(parseInt(time) / colorRange));

  // Checks if the given station feature is visible under the current setting
  const visible = feature => {
    const reachable = parseInt(feature.properties.time) <= maxMinutes;
    const isTransitOk = parseInt(feature.properties.transit_count) <= maxTransit;
    return reachable && isTransitOk;
  };
  const visibleStations = stations.filter(visible);

  // Load station features from GeoJSON
  useEffect(() => {
    (async () => {
      const stationJson = await d3.json(stationData);
      setStations(stationJson.features);
    })();
  }, []);

  // Update layers
  useEffect(() => {
    const newLayers = [];
    if (checkedLayers.railway) {
      newLayers.push(
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
        })
      );
    }
    if (checkedLayers.station) {
      newLayers.push(
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
            const color = colorScale(f.properties.time);
            return [color.r, color.g, color.b, (visible(f) ? 255 : 0)];
          },
          pickable: true,
          onHover: setHoverInfo
        })
      );
    }
    if (checkedLayers.price) {
      newLayers.push(
        new GeoJsonLayer({
          id: "landprice-layer",
          data: priceTokyo,
          getRadius: 100,
          pointRadiusMinPixels: 5,
          filled: true,
          stroked: false,
          opacity: 0.8,
          getFillColor: f => {
            // TODO: Data-driven Quantile Normalization
            const color = d3.color(colorScale(parseInt(f.properties.L01_006)/100000));
            return [color.r, color.g, color.b];
          }
        })
      );
    }

    setLayers(newLayers);
  }, [maxMinutes, maxTransit, adaptive, colorScaleName, checkedLayers])


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
        h="100vh"
        boxShadow="md"
        rounded="md"
        bg="white"
        zIndex={999}
        pos="absolute"
        top="0"
        left="0"
        p="4"
        overflow="scroll"
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

        <Divider m="2" />
        <Box>
          <Accordion allowToggle>
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  Layers
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <VStack align="stretch">
                  <Checkbox
                    isChecked={checkedLayers.station}
                    onChange={e => setCheckedLayers({ ...checkedLayers, station: e.target.checked })}
                  >
                    Station
                  </Checkbox>
                  <Checkbox
                    isChecked={checkedLayers.railway}
                    onChange={e => setCheckedLayers({ ...checkedLayers, railway: e.target.checked })}
                  >
                    Railway
                  </Checkbox>
                  <Checkbox
                    isChecked={checkedLayers.price}
                    onChange={e => setCheckedLayers({ ...checkedLayers, price: e.target.checked })}
                  >
                    Land Price
                  </Checkbox>
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Box>

        <Divider m="2" />
        <Box>
          <div>Stations: {visibleStations.length}</div>
          <br />
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Station</Th>
                <Th isNumeric>Min</Th>
                <Th isNumeric>#</Th>
              </Tr>
            </Thead>
            <Tbody>
              {visibleStations
                .sort((a, b) => d3.ascending(a.properties.time, b.properties.time))
                .map((station, i) => (
                  <Tr
                    key={i}
                    _hover={{
                      background: "#eff",
                      color: "teal.500",
                    }}
                  >
                    <Td>{station.properties.name}</Td>
                    <Td isNumeric>{station.properties.time}</Td>
                    <Td isNumeric>{station.properties.transit_count}</Td>
                  </Tr>
                ))
              }
            </Tbody>
          </Table>
        </Box>

      </Box>
    </>
  )
};


export default RailwayMap;

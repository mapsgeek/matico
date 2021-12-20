import React, { useContext, useEffect, useMemo } from "react";
import { GeomType } from "../../../Datasets/Dataset";
import { MaticoDataContext } from "../../../Contexts/MaticoDataContext/MaticoDataContext";
import {
  AutoVariableInterface,
  useAutoVariable,
} from "../../../Hooks/useAutoVariable";
import { ScatterplotLayer, PathLayer, PolygonLayer } from "@deck.gl/layers";
import {
  convertPoint,
  convertLine,
  expandMultiAndConvertPoly,
  generateColorVar,
  generateNumericVar,
} from "./LayerUtils";
import { useSubVariables } from "../../../Hooks/useSubVariables";

interface MaticoLayerInterface {
  name: string;
  source: { name: string; filters?: any };
  style: any;
  onUpdate: (layerState) => void;
  mapName: string;
}

export const MaticoMapLayer: React.FC<MaticoLayerInterface> = ({
  source,
  style,
  name,
  mapName,
  onUpdate,
}) => {
  const { state: dataState } = useContext(MaticoDataContext);
  const [hoverVariable, updateHoverVariable] = useAutoVariable({
    name: `${mapName}_map_${name}_hover`,
    type: "any",
    initialValue: null,
    bind: true,
  } as AutoVariableInterface);

  const [clickVariable, updateClickVariable] = useAutoVariable({
    name: `${mapName}_map_${name}_click`,
    type: "any",
    initialValue: null,
    bind: true,
  } as AutoVariableInterface);

  const dataset = dataState.datasets.find((d) => {
    return d.name === source.name;
  });

  const datasetReady = dataset ? dataset.isReady() : false;

  const [mappedFilters, filtersReady] = useSubVariables(source.filters);
  const [mappedStyle, styleReady] = useSubVariables(style);

  const preparedData = useMemo(() => {
    if (!datasetReady || !filtersReady || !styleReady) {
      return [];
    }

    const data = dataset.getDataWithGeo(mappedFilters);

    switch (dataset.geometryType()) {
      case GeomType.Point:
        return data.map((d) => ({ ...d, geom: convertPoint(d.geom) }));
      case GeomType.Polygon:
        return expandMultiAndConvertPoly(data);
      case GeomType.Line:
        return data.map((d) => ({ ...d, geom: convertLine(d.geom) }));
    }
  }, [
    source.name,
    datasetReady,
    JSON.stringify(mappedFilters),
    styleReady,
    filtersReady,
  ]);

  useEffect(() => {
    if (!dataset || !dataset.isReady() || !styleReady || !mappedStyle) {
      return;
    }
    console.log("RE REDNERING map style")
    console.log("Mapped style is ", mappedStyle, styleReady);
    let layer = undefined;

    const fillColor = generateColorVar(mappedStyle.fillColor) ?? [
      255, 0, 0, 100,
    ];
    const lineColor = generateColorVar(mappedStyle.lineColor) ?? [
      0, 255, 0, 100,
    ];
    const lineWidth = generateNumericVar(mappedStyle.lineWidth) ?? 10;
    const elevation = generateNumericVar(mappedStyle.elevation) ?? 0;

    const shouldExtrude = elevation !== null && elevation > 0;
    const shouldStroke = lineWidth !== null && lineWidth > 0;
    const common = {
      getFillColor: fillColor,
      getLineColor: lineColor,
      getLineWidth: lineWidth,
      extruded: shouldExtrude,
      stroked: shouldStroke,
      onHover: (hoverTarget) => updateHoverVariable(hoverTarget.object),
      onClick: (clickTarget) => updateClickVariable(clickTarget.object),
      pickable: true,
      id: name,
      data: preparedData,
      updateTriggers: {
         getFillColor: [JSON.stringify(new Date())],
        getLineColor: [JSON.stringify(lineColor)],
        getRadius: [JSON.stringify(mappedStyle.size)],
        getElevation: [JSON.stringify(elevation)],
        getLineWidth: [JSON.stringify(lineWidth)],
        extruded: [JSON.stringify(shouldExtrude)],
        stroked: [JSON.stringify(shouldStroke)],
      },
      _legend: {
        name: name,
        domain: mappedStyle?.fillColor?.domain,
        range: mappedStyle?.fillColor?.range
      } 
    };
    switch (dataset.geometryType()) {
      case GeomType.Point:
        layer = new ScatterplotLayer({
          filled: true,
          radiusUnits: mappedStyle.radiusUnits
            ? mappedStyle.radiusUnits
            : "meters",
          getRadius: generateNumericVar(mappedStyle.size) ?? 20,
          //@ts-ignore
          getPosition: (d) => d.geom,
          ...common,
          //@ts-ignore
        });
        break;
      case GeomType.Line:
        layer = new PathLayer({
          getColor: [0, 255, 0, 100],
          getPath: (d) => d.geom,
          ...common,
        });
        break;
      case GeomType.Polygon:
        layer = new PolygonLayer({
          //@ts-ignore
          getPolygon: (d) => d.geom,
          filled: true,
          ...common,
        });
        break;
    }

    onUpdate(layer);
  }, [
    name,
    JSON.stringify(mappedStyle),
    datasetReady,
    preparedData,
    styleReady,
  ]);

  return <></>;
};
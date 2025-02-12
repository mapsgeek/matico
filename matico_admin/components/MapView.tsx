import DeckGL from "@deck.gl/react";
import { MVTLayer } from "@deck.gl/geo-layers";
import { StaticMap, ViewportProps, WebMercatorViewport } from "react-map-gl"; import { useDatasetColumn } from "../hooks/useDatasetColumns"; import { Source, SourceType, tileUrlForSource } from "../utils/api";
import { useColumnStat } from "../hooks/useColumnStat";
import chroma from "chroma-js";
import { useEffect, useState } from "react";
import { ActionButton, Tooltip, TooltipTrigger } from "@adobe/react-spectrum";
import Vignette from "@spectrum-icons/workflow/Vignette";
import EditIn from "@spectrum-icons/workflow/Edit";
import Save from "@spectrum-icons/workflow/SaveFloppy";
import Cancel from "@spectrum-icons/workflow/Cancel";
import { FlyToInterpolator } from "deck.gl";
import { useMapSelectEditFeature } from "../hooks/useMapSelectEditFeature";
import { Toolbox } from "@nebula.gl/editor";

const INITIAL_VIEW_STATE = {
  longitude: -74.006,
  latitude: 40.7128,
  zoom: 10,
  pitch: 0,
  bearing: 0,
};

const binsForColType = (type: string | undefined | null) => {
  const categories = {
    ValueCounts: {},
  };
  const quantiles = {
    Quantiles: {
      no_bins: 8,
      treat_null_as_zero: true,
    },
  };
  switch (type) {
    case "VARCHAR":
      return categories;
    case "INT4":
    case "INT8":
    case "FLOAT16":
    case "FLOAT8":
    case "NUMERIC":
      return quantiles;
    default:
      return null;
  }
};

const styleForCol = (
  colStats: { [statType: string]: any } | undefined | null,
  visCol: string | null | undefined
) => {
  const statType = colStats ? Object.keys(colStats)[0] : null;
  const common = {
    getLineColor: [255, 255, 255, 50],
    getLineWidth: 1,
    lineWidthUnits: "pixels",
    getFillColor: [226, 125, 96, 200],
    getBorderColor: [200, 200, 200],
    getPointRadius: 10,
    pointRadiusUnits:'pixels',
    stroked: true,
    pickable: true,
    autoHighlight: true,
    radiusUnits: "pixels",
    updateTriggers: {
      getFillColor: [colStats, visCol],
    },
  };
  switch (statType) {
    case "ValueCounts":
      const valueCounts = colStats!.ValueCounts;
      const topCategories = valueCounts.slice(0, 7).map((vc: any) => vc.name);
      const categoryPallet = chroma.brewer.Pastel2;
      return {
        ...common,
        getFillColor: (d: any) => {
          const color =
            categoryPallet[topCategories.indexOf(d.properties[visCol!])];
          return chroma.valid(color) ? chroma(color).rgb() : "gray";
        },
      };
    case "Quantiles":
      const quantileBins = colStats!.Quantiles.map((qb: any) => qb.bin_end);
      const quantileScale = chroma.scale("RdYlBu").domain(quantileBins);
      return {
        ...common,
        getFillColor: (d: any) =>
          quantileScale(d.properties[visCol!])?.rgb() ?? "gray",
      };
    default:
      return common;
  }
};

export interface MapViewInterface {
  source: Source;
  idCol?: string;
  visCol?: string | null;
  extent?: [number, number, number, number];
  selectedFeatureId?: string | number | null;
  onSelectFeature?: (featureId: string | number | null) => void;
}

export const MapView: React.FC<MapViewInterface> = ({
  source,
  visCol,
  extent,
  idCol,
  selectedFeatureId,
  onSelectFeature,
}) => {
  const tileUrl = tileUrlForSource(source);
  const [viewport, setViewport] = useState<any>(INITIAL_VIEW_STATE);
  const [edit, setEdit] = useState<boolean>(false);
  const [mapTileUpdateTrigger, setMapTileUpdateTrigger] = useState(new Date());

  const { selectionLayer, saveGeometry, discardGeometryChanges } =
    useMapSelectEditFeature(source, selectedFeatureId, edit);
  const { column, columnError } = useDatasetColumn(source, visCol);

  const stat = binsForColType(column?.col_type);

  const selectFeature = (feature: any) => {
    if (idCol && onSelectFeature) {
      onSelectFeature(feature.object.properties[idCol]);
    }
  };

  const { data: categories, error: dataSummaryError } = useColumnStat(
    source,
    visCol ?? "",
    stat
  );

  const setViewportWithExtent = (
    extent: [number, number, number, number] | undefined
  ) => {
    if (extent) {
      setTimeout(() => {
        //@ts-ignore
        const newViewport = new WebMercatorViewport(viewport);
        const { longitude, latitude, zoom } = newViewport.fitBounds(
          [
            [extent[0], extent[1]],
            [extent[2], extent[3]],
          ],
          { padding: 30 }
        );
        setViewport({
          ...viewport,
          latitude,
          longitude,
          zoom,
          transitionDuration: 2000,
          transitionInterpolator: new FlyToInterpolator(),
        });
      }, 0);
    }
  };

  const updateGeometry = (newGeom: any) => {
    saveGeometry();
    setEdit(false);
    setMapTileUpdateTrigger(new Date());
  };

  useEffect(() => {
    //@ts-ignore
    setViewportWithExtent(extent);
  }, [extent]);

  const layerStyle = styleForCol(categories, visCol);

  const layer = new MVTLayer({
    data: `${tileUrl}`,
    ...layerStyle,
    onClick: selectFeature,
    updateTriggers: {
      ...layerStyle.updateTriggers,
      getTileData: mapTileUpdateTrigger,
    },
  });

  const layers = [layer, selectionLayer].filter((l) => l);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        margin: "0px",
        padding: "0px",
      }}
    >
      <div
        style={{ position: "absolute", zIndex: 20, right: "20px", top: "20px" }}
      >
        <TooltipTrigger delay={0}>
          <ActionButton
            onPress={() => setViewportWithExtent(extent)}
            staticColor={"white"}
            isQuiet
          >
            <Vignette size="XL" />
          </ActionButton>
          <Tooltip>Zoom to bounds or selected feature</Tooltip>
        </TooltipTrigger>
        {selectedFeatureId &&
          (edit ? (
            <>
              <TooltipTrigger delay={0}>
                <ActionButton
                  onPress={updateGeometry}
                  staticColor={"white"}
                  isQuiet
                >
                  <Save size="XL" />
                </ActionButton>
                <Tooltip>wdit Selected geometry</Tooltip>
              </TooltipTrigger>
              <TooltipTrigger delay={0}>
                <ActionButton
                  onPress={discardGeometryChanges}
                  staticColor={"white"}
                  isQuiet
                >
                  <Cancel size="XL" />
                </ActionButton>
                <Tooltip>wdit Selected geometry</Tooltip>
              </TooltipTrigger>
            </>
          ) : (
            <TooltipTrigger delay={0}>
              <ActionButton
                onPress={() => setEdit(true)}
                staticColor={"white"}
                isQuiet
              >
                <EditIn size="XL" />
              </ActionButton>
              <Tooltip>Edit Selected geometry</Tooltip>
            </TooltipTrigger>
          ))}
      </div>
      <DeckGL
        style={{ position: "absolute" }}
        width="100%"
        height="100%"
        controller={true}
        initialViewState={viewport}
        //@ts-ignore
        onViewStateChange={({ viewState }) => setViewport(viewState)}
        //@ts-ignore
        layers={layers}
      >
        <StaticMap
          mapboxApiAccessToken="pk.eyJ1Ijoic3R1YXJ0LWx5bm4iLCJhIjoiY2t1dThkcG1xM3p2ZzJ3bXhlaHFtdThlYiJ9.rmndXXXrC5HAbxg1Ok8XTg"
          mapStyle="mapbox://styles/mapbox/dark-v10"
          width={"100%"}
          height={"100%"}
        />
      </DeckGL>
    </div>
  );
};

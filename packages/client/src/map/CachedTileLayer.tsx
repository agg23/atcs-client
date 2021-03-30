import { useEffect } from "react";
import { TileLayerProps, useMap } from "react-leaflet";
import { CachedTileLayer as LayerCache } from "@yaga/leaflet-cached-tile-layer";

type CachedTileLayerProps = TileLayerProps & {
  mapStyle: string;
};

export const CachedTileLayer: React.FC<CachedTileLayerProps> = (props) => {
  const map = useMap();

  useEffect(() => {
    const layer = new LayerCache(
      props.url.replace("{mapStyle}", props.mapStyle),
      props
    ).addTo(map);

    return () => {
      layer.remove();
    };
  }, [map]);

  return null;
};

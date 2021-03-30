import { MapContainer, TileLayer, TileLayerProps } from "react-leaflet";

import styles from "./App.module.scss";
import { CachedTileLayer } from "./map/CachedTileLayer";

export const App = () => {
  const tileLayerProps: TileLayerProps & {
    mapStyle: string;
  } = {
    attribution: `Data <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>, Style: <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA 2.0</a> <a href="http://www.openrailwaymap.org/">OpenRailwayMap</a>`,
    url: "https://{s}.tiles.openrailwaymap.org/{mapStyle}/{z}/{x}/{y}.png",
    mapStyle: "standard",
  };

  return (
    <div>
      <MapContainer
        id={styles.map}
        center={[45.631188, -122.686082]}
        zoom={17}
        minZoom={12}
        scrollWheelZoom={true}
      >
        <TileLayer {...tileLayerProps} />
        <CachedTileLayer {...tileLayerProps} />
        {/* <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        /> */}
      </MapContainer>
    </div>
  );
};

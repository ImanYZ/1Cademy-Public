import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import React from "react";

const containerStyle = {
  width: `100%`,
  height: `50vh`,
  margin: "0 auto",
};

const center = {
  lat: 39.3844014,
  lng: -98.408401,
};

function GoogleMapCom(props: any) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "",
  });
  const renderMap = () => {
    return (
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={4} options={{ mapId: "6422800f6b1b1ed4" }}>
        {props.institutions.map((inst: any) => {
          return (
            <Marker
              key={inst.name}
              position={{ lat: inst.lat, lng: inst.lng }}
              icon={{ url: inst.logoURL, scaledSize: new window.google.maps.Size(40, 40) }}
            />
          );
        })}
      </GoogleMap>
    );
  };

  return isLoaded ? renderMap() : <></>;
}

export default React.memo(GoogleMapCom);

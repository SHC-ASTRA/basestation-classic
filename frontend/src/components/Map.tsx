import {
    MapContainer,
    WMSTileLayer,
    useMap,
    Marker,
    Popup,
    Circle,
} from "react-leaflet";
import L, { LatLngTuple, Icon, ControlOptions } from "leaflet";
import "leaflet/dist/leaflet.css";
import useWebSocketSetup from "../lib/webSocket";
import React, { useEffect, useState } from "react";
import { createControlComponent } from "@react-leaflet/core";

const coords: LatLngTuple = [38.4063, -110.7918];
const ZOOM_LEVEL = 15;

const followRoverRef = { current: true };

// Default icon (1x blue marker) using local path
const defaultIcon = new Icon({
    iconUrl: "/images/marker-icon.png",
    shadowUrl: "/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

// --- Existing Custom Controls (FollowControl, CenterControl, GPSInfoControl) ---
// These remain unchanged.
class FollowControl extends L.Control {
    options: ControlOptions = {
        position: "bottomright",
    };

    onAdd() {
        const container = L.DomUtil.create(
            "div",
            "leaflet-control leaflet-control-custom",
        );
        container.style.padding = "5px";
        container.style.backgroundColor = "var(--crust)";
        container.style.color = "var(--text)";
        container.style.borderRadius = "4px";
        container.style.boxShadow = "0 1px 5px rgba(0,0,0,0.4)";
        container.style.marginBottom = "10px";

        const label = L.DomUtil.create("label", "follow-switch-label", container);
        label.style.display = "flex";
        label.style.alignItems = "center";
        label.style.cursor = "pointer";

        const switchInput = L.DomUtil.create(
            "input",
            "follow-switch-input",
            label,
        );
        switchInput.type = "checkbox";
        switchInput.checked = followRoverRef.current;
        switchInput.style.margin = "0 8px 0 0";

        const text = L.DomUtil.create("span", "follow-switch-text", label);
        text.innerHTML = "Follow Rover";
        text.style.fontSize = "12px";
        text.style.fontWeight = "bold";

        L.DomEvent.on(switchInput, "change", function (e) {
            L.DomEvent.stopPropagation(e);
            followRoverRef.current = switchInput.checked;
        });

        L.DomEvent.disableClickPropagation(container);
        return container;
    }
}

class CenterControl extends L.Control {
    options: ControlOptions = {
        position: "bottomright",
    };

    onAdd(map: { flyTo: (arg0: L.LatLngTuple) => void }) {
        const container = L.DomUtil.create(
            "div",
            "leaflet-control leaflet-control-custom",
        );
        container.style.padding = "5px";
        container.style.backgroundColor = "var(--crust)";
        container.style.borderRadius = "4px";
        container.style.boxShadow = "0 1px 5px rgba(0,0,0,0.4)";
        container.style.color = "var(--text)";

        const button = L.DomUtil.create("button", "center-button", container);
        button.innerHTML = "Center";
        button.style.padding = "6px 10px";
        button.style.cursor = "pointer";
        button.style.border = "none";
        button.style.backgroundColor = "var(--surface-1)";
        button.style.color = "var(--text)";
        button.style.borderRadius = "3px";
        button.style.fontWeight = "bold";

        L.DomEvent.on(button, "click", function (e) {
            L.DomEvent.stopPropagation(e);
            map.flyTo(coords);
        });

        L.DomEvent.disableClickPropagation(container);
        return container;
    }
}

class GPSInfoControl extends L.Control {
    options: ControlOptions = {
        position: "topright",
    };

    onAdd() {
        const container = L.DomUtil.create(
            "div",
            "leaflet-control leaflet-control-custom gps-info",
        );
        container.style.padding = "10px";
        container.style.backgroundColor = "var(--crust)";
        container.style.borderRadius = "4px";
        container.style.boxShadow = "0 1px 5px rgba(0,0,0,0.4)";
        container.style.minWidth = "200px";
        container.style.fontSize = "12px";
        container.style.fontFamily = "monospace";
        container.style.color = "var(--text)";
        container.id = "gps-info-container";

        const title = L.DomUtil.create("div", "gps-info-title", container);
        title.innerHTML = "<strong>GPS Information</strong>";
        title.style.marginBottom = "5px";

        const latDiv = L.DomUtil.create("div", "gps-info-lat", container);
        latDiv.id = "gps-info-lat";
        latDiv.innerHTML = "Latitude: ---.-------";

        const lngDiv = L.DomUtil.create("div", "gps-info-lng", container);
        lngDiv.id = "gps-info-lng";
        lngDiv.innerHTML = "Longitude: ---.-------";

        const satDiv = L.DomUtil.create("div", "gps-info-sats", container);
        satDiv.id = "gps-info-sats";
        satDiv.innerHTML = "Satellites: --";

        const altDiv = L.DomUtil.create("div", "gps-info-alt", container);
        altDiv.id = "gps-info-alt";
        altDiv.innerHTML = "Altitude: --";

        L.DomEvent.disableClickPropagation(container);
        return container;
    }
}

const CenterButton = createControlComponent(
    (props) => new CenterControl(props),
);
const FollowSwitch = createControlComponent(
    (props) => new FollowControl(props),
);
const GPSInfo = createControlComponent((props) => new GPSInfoControl(props));

function GPSInfoUpdater() {
    const { coreFeedback } = useWebSocketSetup();

    useEffect(() => {
        if (coreFeedback?.data?.gps_lat && coreFeedback?.data?.gps_long) {
            const latElement = document.getElementById("gps-info-lat");
            const lngElement = document.getElementById("gps-info-lng");
            const satElement = document.getElementById("gps-info-sats");
            const altElement = document.getElementById("gps-info-alt");

            if (latElement) {
                latElement.innerHTML = `Latitude: ${coreFeedback.data.gps_lat.toFixed(
                    7,
                )}`;
            }
            if (lngElement) {
                lngElement.innerHTML = `Longitude: ${coreFeedback.data.gps_long.toFixed(
                    7,
                )}`;
            }
            if (satElement) {
                satElement.innerHTML = `Satellites: ${coreFeedback.data.gps_sats}`;
            }
            if (altElement) {
                altElement.innerHTML = `Altitude: ${Math.round(
                    coreFeedback.data.gps_alt,
                )} m`;
            }
        }
    }, [coreFeedback?.data]);

    return null;
}

function RoverLocationMarker() {
    const { coreFeedback, autoFeedback } = useWebSocketSetup();
    const map = useMap();

    useEffect(() => {
        if (
            coreFeedback?.data?.gps_lat &&
            coreFeedback?.data?.gps_long &&
            followRoverRef.current
        ) {
            map.setView(
                [coreFeedback.data.gps_lat, coreFeedback.data.gps_long],
                map.getZoom(),
            );
        }
    }, [coreFeedback?.data?.gps_lat, coreFeedback?.data?.gps_long, map]);

    if (!coreFeedback?.data?.gps_lat || !coreFeedback?.data?.gps_long) {
        return null;
    }

    const roverOrientation = coreFeedback.data.orientation || 0;
    const roverIcon = new L.DivIcon({
        className: "rover-marker-container",
        html: `
              <div style="
                  width: 50px; 
                  height: 50px; 
                  display: flex; 
                  justify-content: center; 
                  align-items: center;
                  transform: rotate(${roverOrientation}deg);
              ">
                  <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="#0078FF">
                      <path d="M12 2L8 8H16L12 2Z"/>
                      <circle cx="12" cy="14" r="6" stroke="white" stroke-width="2" fill="#0078FF"/>
                  </svg>
              </div>
          `,
        iconSize: [50, 50],
        iconAnchor: [25, 25],
        popupAnchor: [0, -15],
    });

    // Target icon (2x blue marker) using local path.
    // The iconUrl points to the 2x image (marker-icon-2x.png, 50x82px).
    // iconSize is set to [25, 41], so Leaflet will display the 2x image
    // at the size of a 1x image. This is a common way to handle retina assets.
    const targetIcon = new L.Icon({
        iconUrl: "/images/marker-icon-2x.png",
        shadowUrl: "/images/marker-shadow.png",
        iconSize: [25, 41], // Display size (1x dimensions)
        iconAnchor: [12, 41], // Anchor relative to iconSize
        popupAnchor: [1, -34],
        shadowSize: [41, 41], // Size of the shadow
        className: "target-marker",
    });

    return (
        <>
            <Marker
                position={[coreFeedback.data.gps_lat, coreFeedback.data.gps_long]}
                icon={roverIcon}
            >
                <Popup>
                    Rover Current Location
                    <br />
                    Lat: {coreFeedback.data.gps_lat.toFixed(7)}
                    <br />
                    Long: {coreFeedback.data.gps_long.toFixed(7)}
                    <br />
                    Satellites: {coreFeedback.data.gps_sats}
                    <br />
                    Orientation: {coreFeedback.data.orientation}°
                </Popup>
            </Marker>

            {autoFeedback?.data?.target_lat && autoFeedback?.data?.target_long && (
                <Marker
                    position={[
                        autoFeedback.data.target_lat,
                        autoFeedback.data.target_long,
                    ]}
                    icon={targetIcon}
                >
                    <Popup>
                        Target Location
                        <br />
                        Lat: {autoFeedback.data.target_lat.toFixed(7)}
                        <br />
                        Long: {autoFeedback.data.target_long.toFixed(7)}
                        <br />
                        Mission: {autoFeedback.data.mission_type}
                        <br />
                        Remaining: {autoFeedback.data.remaining_distance} m
                    </Popup>
                </Marker>
            )}
        </>
    );
}

interface Waypoint {
    id: number;
    lat: number;
    lng: number;
}

const waypointCircleOptions = {
    color: "red",
    fillColor: "red",
    fillOpacity: 0.5,
    opacity: 0.5,
    weight: 1,
};

export default function MapComponent() {
    const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
    const [newWaypointLat, setNewWaypointLat] = useState<string>("");
    const [newWaypointLng, setNewWaypointLng] = useState<string>("");
    const [inputError, setInputError] = useState<string>("");

    const handleAddWaypoint = () => {
        const lat = parseFloat(newWaypointLat);
        const lng = parseFloat(newWaypointLng);

        if (isNaN(lat) || isNaN(lng)) {
            setInputError("Latitude and Longitude must be valid numbers.");
            return;
        }
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            setInputError("Invalid coordinate range.");
            return;
        }

        setInputError("");
        setWaypoints((prevWaypoints) => [
            ...prevWaypoints,
            { id: Date.now(), lat, lng },
        ]);
        setNewWaypointLat("");
        setNewWaypointLng("");
    };

    const handleRemoveWaypoint = (idToRemove: number) => {
        setWaypoints((prevWaypoints) =>
            prevWaypoints.filter((wp) => wp.id !== idToRemove),
        );
    };

    return (
        <>
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: "calc(100% - 80px)",
                }}
            >
                <MapContainer
                    id="map"
                    center={coords}
                    zoom={ZOOM_LEVEL}
                    scrollWheelZoom={true}
                    zoomControl={true}
                    style={{ width: "100%", height: "100%" }}
                >
                    <WMSTileLayer
                        url="/map"
                        layers="utah_terrain"
                        format="image/png"
                        transparent={true}
                        version="1.3.0"
                        crs={L.CRS.EPSG4326}
                        attribution="Utah Terrain &copy; USGS | Served by QGIS Server"
                    />

                    <RoverLocationMarker />
                    <GPSInfoUpdater />
                    <GPSInfo position="topright" />
                    <FollowSwitch position="bottomright" />
                    <CenterButton position="bottomright" />

                    {waypoints.map((waypoint) => (
                        <React.Fragment key={waypoint.id}>
                            <Marker position={[waypoint.lat, waypoint.lng]}>
                                {/* Waypoint markers will use the defaultIcon (1x blue, local) */}
                                <Popup>
                                    Waypoint
                                    <br />
                                    Lat: {waypoint.lat.toFixed(7)}
                                    <br />
                                    Long: {waypoint.lng.toFixed(7)}
                                    <br />
                                    <button
                                        onClick={() => handleRemoveWaypoint(waypoint.id)}
                                        style={{
                                            marginTop: "5px",
                                            padding: "3px 8px",
                                            cursor: "pointer",
                                            border: "1px solid var(--surface-2)",
                                            backgroundColor: "var(--surface-0)",
                                            color: "var(--text)",
                                            borderRadius: "3px",
                                        }}
                                    >
                                        Remove Waypoint
                                    </button>
                                </Popup>
                            </Marker>
                            <Circle
                                center={[waypoint.lat, waypoint.lng]}
                                pathOptions={waypointCircleOptions}
                                radius={20}
                            />
                        </React.Fragment>
                    ))}
                </MapContainer>
            </div>

            <div
                style={{
                    padding: "10px",
                    backgroundColor: "var(--mantle)",
                    borderTop: "1px solid var(--surface-0)",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    height: "80px",
                    boxSizing: "border-box",
                }}
            >
                <input
                    type="text"
                    placeholder="Latitude"
                    value={newWaypointLat}
                    onChange={(e) => setNewWaypointLat(e.target.value)}
                    style={{
                        padding: "8px",
                        border: "1px solid var(--surface-2)",
                        borderRadius: "4px",
                        backgroundColor: "var(--base)",
                        color: "var(--text)",
                        width: "120px",
                    }}
                />
                <input
                    type="text"
                    placeholder="Longitude"
                    value={newWaypointLng}
                    onChange={(e) => setNewWaypointLng(e.target.value)}
                    style={{
                        padding: "8px",
                        border: "1px solid var(--surface-2)",
                        borderRadius: "4px",
                        backgroundColor: "var(--base)",
                        color: "var(--text)",
                        width: "120px",
                    }}
                />
                <button
                    onClick={handleAddWaypoint}
                    style={{
                        padding: "8px 15px",
                        cursor: "pointer",
                        border: "none",
                        backgroundColor: "var(--blue)",
                        color: "var(--crust)",
                        borderRadius: "4px",
                        fontWeight: "bold",
                    }}
                >
                    Add Waypoint
                </button>
                {inputError && (
                    <span style={{ color: "var(--red)", fontSize: "12px" }}>
                        {inputError}
                    </span>
                )}
            </div>
        </>
    );
}
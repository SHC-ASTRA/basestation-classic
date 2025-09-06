import { useState, useEffect, useCallback } from "react";
import { PtzControlData } from "../../lib/types";
import useWebSocketSetup from "../../lib/webSocket";

// Defines a default structure for PTZ control data messages.
// This is used as a base and then specific control values are merged into it.
const emptyPtzControlData: PtzControlData["data"] = {
    control_mode: 0,
    turn_yaw: 0,
    turn_pitch: 0,
    yaw: 0,
    pitch: 0,
    axis_id: 0,
    angle: 0,
    zoom_level: 0,
    stream_type: 0,
    stream_freq: 0,
    reset: false,
};

export function PTZControls() {
    // Custom hook to manage WebSocket connection and provide a sendMessage function.
    const { sendMessage } = useWebSocketSetup();

    // State for the target yaw and pitch of the PTZ camera.
    const [targetPosition, _setTargetPosition] = useState({ yaw: 0, pitch: 0 });
    // State for the target zoom level of the PTZ camera.
    const [targetZoom, _setTargetZoom] = useState({ zoom_level: 1 });

    // useCallback memoizes this function to prevent unnecessary re-creations.
    // It updates the target position, ensuring yaw and pitch values are within defined limits.
    const setTargetPosition = useCallback(
        (newPosition: { yaw: number; pitch: number }) => {
            // Clamp yaw between -135 and 135 degrees.
            const clampedYaw = Math.max(-135, Math.min(135, newPosition.yaw));
            // Clamp pitch between -90 and 90 degrees.
            const clampedPitch = Math.max(-90, Math.min(90, newPosition.pitch));
            _setTargetPosition({ yaw: clampedYaw, pitch: clampedPitch });
        },
        [_setTargetPosition], // Dependency: _setTargetPosition is a stable setter from useState.
    );

    // useCallback memoizes this function.
    // It updates the target zoom level, ensuring it's within defined limits (1 to 6).
    const setTargetZoom = useCallback(
        (newZoom: { zoom_level: number }) => {
            const clampedZoomLevel = Math.max(1, Math.min(6, newZoom.zoom_level));
            _setTargetZoom({ zoom_level: clampedZoomLevel });
        },
        [_setTargetZoom], // Dependency: _setTargetZoom is a stable setter from useState.
    );

    // This useEffect hook triggers whenever 'targetPosition' changes.
    // It sends a WebSocket message to control the PTZ camera's position.
    // 'control_mode: 1' typically signifies a position control command.
    useEffect(() => {
        const data: PtzControlData = {
            type: "/ptz/control",
            timestamp: Date.now(),
            data: {
                ...emptyPtzControlData,
                ...targetPosition,
                control_mode: 1, // Mode for position control
            },
        };
        sendMessage(JSON.stringify(data));
    }, [sendMessage, targetPosition]); // Runs when sendMessage or targetPosition changes.

    // This useEffect hook triggers whenever 'targetZoom' changes.
    // It sends a WebSocket message to control the PTZ camera's zoom.
    // 'control_mode: 3' typically signifies a zoom control command.
    useEffect(() => {
        const data: PtzControlData = {
            type: "/ptz/control",
            timestamp: Date.now(),
            data: {
                ...emptyPtzControlData,
                ...targetZoom,
                control_mode: 3, // Mode for zoom control
            },
        };
        sendMessage(JSON.stringify(data));
    }, [sendMessage, targetZoom]); // Runs when sendMessage or targetZoom changes.

    // This useEffect hook sets up and cleans up global keyboard event listeners
    // for controlling the PTZ camera.
    useEffect(() => {
        // Handles keydown events for PTZ controls.
        const handleKeyDown = (event: KeyboardEvent) => {
            let handled = true; // Flag to determine if event.preventDefault() should be called.

            switch (event.key.toLowerCase()) {
                case "w": // 'W' key for moving Up (pitch +)
                    setTargetPosition({
                        yaw: targetPosition.yaw,
                        pitch: targetPosition.pitch + 5,
                    });
                    break;
                case "s": // 'S' key for moving Down (pitch -)
                    setTargetPosition({
                        yaw: targetPosition.yaw,
                        pitch: targetPosition.pitch - 5,
                    });
                    break;
                case "a": // 'A' key for moving Left (yaw +)
                    setTargetPosition({
                        yaw: targetPosition.yaw + 5,
                        pitch: targetPosition.pitch,
                    });
                    break;
                case "d": // 'D' key for moving Right (yaw -)
                    setTargetPosition({
                        yaw: targetPosition.yaw - 5,
                        pitch: targetPosition.pitch,
                    });
                    break;
                case "e": // 'E' key for Zoom In (zoom_level +)
                    setTargetZoom({ zoom_level: targetZoom.zoom_level + 0.5 });
                    break;
                case "q": // 'Q' key for Zoom Out (zoom_level -)
                    setTargetZoom({ zoom_level: targetZoom.zoom_level - 0.5 });
                    break;
                case "r": // 'R' key for Resetting position and zoom
                    setTargetPosition({ yaw: 0, pitch: 0 });
                    setTargetZoom({ zoom_level: 0 }); // Will be clamped to 1 by setTargetZoom
                    sendMessage(JSON.stringify({
                        type: "/ptz/control",
                        timestamp: Date.now(),
                        data: {
                            ...emptyPtzControlData,
                            reset: true, // Special flag for reset command
                        },
                    }));
                    break;
                default:
                    handled = false; // Key pressed was not a designated control key.
                    break;
            }

            // If the key was one of our control keys, prevent its default browser action
            // (e.g., scrolling the page, typing in an input field if one was focused).
            if (handled) {
                event.preventDefault();
            }
        };

        // Add the event listener to the window object.
        window.addEventListener("keydown", handleKeyDown);

        // Cleanup function: Remove the event listener when the component unmounts
        // or before the effect re-runs to prevent memory leaks or multiple listeners.
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [
        targetPosition,
        targetZoom,
        setTargetPosition,
        setTargetZoom,
        sendMessage,
    ]); // Dependencies: Re-run effect if these values/functions change.

    return (
        <>
            <div className="vertical-split container">
                <h2>PTZ Controls</h2>
                {/* UI for button-based PTZ controls */}
                <div className="horizontal-split">
                    <div className="vertical-split">
                        <button className="control-button" disabled={true}>
                            &nbsp;
                        </button>
                        <button
                            className="control-button"
                            onClick={() =>
                                setTargetPosition({
                                    yaw: targetPosition.yaw + 5, // Left
                                    pitch: targetPosition.pitch,
                                })
                            }
                        >
                            Left
                        </button>
                        <button className="control-button" disabled={true}>
                            &nbsp;
                        </button>
                    </div>
                    <div className="vertical-split">
                        <button
                            className="control-button"
                            onClick={() =>
                                setTargetPosition({
                                    yaw: targetPosition.yaw,
                                    pitch: targetPosition.pitch + 5, // Up
                                })
                            }
                        >
                            Up
                        </button>
                        <button
                            className="control-button"
                            onClick={() => setTargetPosition({ ...targetPosition })} // No change, "O" button
                        >
                            O
                        </button>
                        <button
                            className="control-button"
                            onClick={() =>
                                setTargetPosition({
                                    yaw: targetPosition.yaw,
                                    pitch: targetPosition.pitch - 5, // Down
                                })
                            }
                        >
                            Down
                        </button>
                    </div>
                    <div className="vertical-split">
                        <button className="control-button" disabled={true}>
                            &nbsp;
                        </button>
                        <button
                            className="control-button"
                            onClick={() =>
                                setTargetPosition({
                                    yaw: targetPosition.yaw - 5, // Right
                                    pitch: targetPosition.pitch,
                                })
                            }
                        >
                            Right
                        </button>
                        <button className="control-button" disabled={true}>
                            &nbsp;
                        </button>
                    </div>
                </div>
                <br />
                <div className="horizontal-split">
                    <button
                        className="control-button"
                        onClick={() =>
                            setTargetZoom({ zoom_level: targetZoom.zoom_level - 0.5 })
                        } // Zoom Out
                    >
                        -
                    </button>
                    <button
                        className="control-button"
                        onClick={() =>
                            setTargetZoom({ zoom_level: targetZoom.zoom_level + 0.5 })
                        } // Zoom In
                    >
                        +
                    </button>
                </div>
                <br />
                {/* Display current PTZ state */}
                <div className="horizontal-split">
                    <h2>yaw: {targetPosition.yaw}</h2>
                    <h2>pitch: {targetPosition.pitch}</h2>
                    <h2>zoom: {targetZoom.zoom_level}</h2>
                </div>
                <br />
                {/* Button to reset PTZ position and zoom */}
                <button
                    className="control-button"
                    onClick={() => {
                        setTargetPosition({ yaw: 0, pitch: 0 });
                        setTargetZoom({ zoom_level: 0 }); // Will be clamped to 1 by setTargetZoom
                        // Send a specific reset command via WebSocket.
                        const data: PtzControlData = {
                            type: "/ptz/control",
                            timestamp: Date.now(),
                            data: {
                                ...emptyPtzControlData,
                                reset: true,
                            },
                        };
                        sendMessage(JSON.stringify(data));
                    }}
                >
                    Reset Position
                </button>
            </div>
        </>
    );
}
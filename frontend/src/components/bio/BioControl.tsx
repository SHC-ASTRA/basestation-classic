import { useContext, useEffect, useState, useRef } from "react";
import useWebSocketSetup from "../../lib/webSocket";
import { BioSelector, BioSetter } from "./BioComponents";
import ResetLSS from "../anchor/ResetLSS";
import GamepadContext from "../../lib/gamepadContext";
import GradientIndicator from "../indicators/GradientIndicator";
import { CORE_POLLING_INTERVAL } from "../../config";
import { BioControlData } from "src/lib/types";

const SPEED_ADJUSTMENT = 5;
const INITIAL_DRILL_SPEED = 10;

export default function BioControl() {
    const { sendMessage } = useWebSocketSetup();
    const gamepadState = useContext(GamepadContext);
    const [laserEnabled, setLaserEnabled] = useState(false);
    const [drillSpeed, setDrillSpeed] = useState(INITIAL_DRILL_SPEED);
    const lastUpdate = useRef(Date.now());

    // id-value pairs
    const [pumpId, setPumpId] = useState(0);
    const [pumpAmount, setPumpAmount] = useState(0);
    const [fanId, setFanId] = useState(0);
    const [fanDuration, setFanDuration] = useState(0);
    const servoId = useRef(0);

    useEffect(() => {
        if (gamepadState.b) setLaserEnabled((b) => !b);

        if (gamepadState.dpad.up) {
            setDrillSpeed((prev) => Math.min(100, prev + SPEED_ADJUSTMENT));
        } else if (gamepadState.dpad.down) {
            setDrillSpeed((prev) => Math.max(0, prev - SPEED_ADJUSTMENT));
        }
    }, [gamepadState.b, gamepadState.dpad.up, gamepadState.dpad.down])

    // Update servo and drill based on gamepad sticks
    useEffect(() => {
        // Only update at polling rate
        if (Date.now() - lastUpdate.current < CORE_POLLING_INTERVAL) {
            return;
        }

        lastUpdate.current = Date.now();

        const data: BioControlData = {
            type: "/bio/control",
            timestamp: lastUpdate.current,
            data: {
                bio_arm: Math.round(gamepadState.left_stick.y * 100),
                drill_arm: Math.round(gamepadState.right_stick.yDigital * 100),
                drill: ((gamepadState.right_bumper ? 1 : 0) - (gamepadState.left_bumper ? 1 : 0)) * drillSpeed,
                vibration_motor: gamepadState.a ? 1 : 0,
                laser: laserEnabled ? 1 : 0,
                pump_id: pumpId,
                pump_amount: pumpAmount,
                fan_id: fanId,
                fan_duration: fanDuration,
                servo_id: servoId.current,
                servo_state: gamepadState.x,
            }
        };

        sendMessage(JSON.stringify(data));

        // reset controls
        if (pumpId) setPumpId(() => 0);
        if (pumpAmount) setPumpAmount(() => 0);
        if (fanId) setFanId(() => 0);
        if (fanDuration) setFanDuration(() => 0);
    }, [gamepadState, drillSpeed, laserEnabled, pumpId, pumpAmount, fanId, fanDuration, sendMessage]);

    return <>
        <div className="container vertical-split">
            <BioSetter label="Pumps" min={-Infinity} step={0.01} precise={true} max={Infinity} placeholder="amount (mL)" onSubmission={(id, value) => {
                setPumpId(id);
                setPumpAmount(value);
            }}>
                <option value={1}>(1) Water</option>
                <option value={2}>(2) BCA</option>
                <option value={3}>(3) Acetic</option>
                <option value={4} style={{ color: "var(--blue)" }}>(4) Meth</option>
            </BioSetter>
            <BioSetter label="Fans" min={0} max={Infinity} placeholder="duration (ms)" onSubmission={(id, value) => {
                setFanId(id);
                setFanDuration(value);
            }}>
                <option value={1}>(1) Right Fan</option>
                <option value={2}>(2) Center Fan</option>
                <option value={3}>(3) Left Fan</option>
            </BioSetter>

            <div className="horizontal-split container">
                <BioSelector label="Target Servo" onChange={(e) => {
                    servoId.current = parseInt(e.target.value);
                }}>
                    <option value={2}>(2) Left Servo</option>
                    <option value={1}>(1) Center Servo</option>
                    <option value={3}>(3) Right Servo</option>
                </BioSelector>
                {/* show whether the x button is pressed */}
                <h2 style={{ justifyContent: "center", alignContent: "center" }}>
                    Servo State: <span style={{ color: gamepadState.x ? "var(--green)" : "var(--red)" }}>
                        {(gamepadState.x && servoId.current) ? "on" : "off"}
                    </span>
                </h2>
            </div>

            {/* laser and drill spin indicators */}
            <div className="horizontal-split indicator-subsection">
                <div className="horizontal-split container">
                    <h2 style={{ justifyContent: "center", alignContent: "center" }}>
                        Laser Status: <span style={{ color: laserEnabled ? "var(--green)" : "var(--red)" }}>{laserEnabled ? "on" : "off"}</span>
                    </h2>
                </div>
                <div className="horizontal-split container">
                    <h2 style={{ justifyContent: "center", alignContent: "center" }}>Drill ({drillSpeed}%)</h2>
                    <GradientIndicator
                        scale={1}
                        value={(gamepadState.right_bumper ? 1 : 0) - (gamepadState.left_bumper ? 1 : 0)}
                        color="var(--sapphire)"
                        direction="to right"
                    />
                </div>
            </div>

            {/* Gamepad control indicators */}
            <div className="horizontal-split indicator-subsection" style={{ flexGrow: 4 }}>
                <div style={{ display: "flex", flexDirection: "column" }} className="container">
                    <h3 style={{ textAlign: "center" }}>
                        Vacuum Arm{gamepadState.a ? " (vibrating)" : ""}
                    </h3>
                    <div className="indicator-subsection" style={{ flexGrow: 1 }}>
                        <GradientIndicator
                            scale={1}
                            value={gamepadState.left_stick.y}
                            color="var(--sapphire)"
                            direction="to top"
                        />
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }} className="container">
                    <h3 style={{ textAlign: "center" }}>Drill Arm</h3>
                    <div className="indicator-subsection" style={{ flexGrow: 1 }}>
                        <GradientIndicator
                            scale={1}
                            value={gamepadState.right_stick.yDigital * 100}
                            color="var(--sapphire)"
                            direction="to top"
                        />
                    </div>
                </div>
            </div>
            <div style={{ flexGrow: 0, height: "auto" }}>
                <ResetLSS label="Reset Vacuum Arm" />
            </div>
        </div>
    </>;
}
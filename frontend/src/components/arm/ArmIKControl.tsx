import { useState, useContext, useEffect, useRef } from "react";
import GradientIndicator from "../indicators/GradientIndicator";
import GamepadContext from "../../lib/gamepadContext";
import useWebSocketSetup from "../../lib/webSocket";
import { ArmIKData, Vector3 } from "../../lib/types";
import { ARM_POLLING_INTERVAL } from "../../config";

function AxisControl(props: { label: string, value: number }) {
    return <div className="horizontal-split container indicator-subsection">
        <h1 className="subsection-indicator-label">{props.label}</h1>
        <GradientIndicator value={props.value} scale={1} direction="to top" color="var(--green)" />
    </div>;
}

export default function ArmIKControl() {
    const lastUpdate = useRef(Date.now());
    const { sendMessage } = useWebSocketSetup();
    const [laserEnabled, setLaserEnabled] = useState(false);
    const [armManualControl, setArmManualControl] = useState<ArmIKData["data"]>({
        movement_vector: new Vector3(0, 0, 0), // Assuming Vector3 has x, y, z properties
        gripper: 0,
        linear_actuator: 0,
        laser: 0,
        effector_roll: 0,
        effector_yaw: 0,
    });
    const gamepadState = useContext(GamepadContext);

    useEffect(() => {
        const data: ArmIKData = {
            type: "/arm/control/ik",
            timestamp: Date.now(),
            data: {
                ...(!gamepadState.right_bumper ? { // regular mode
                    movement_vector: new Vector3(
                        gamepadState.left_stick.xDigital,
                        gamepadState.left_stick.yDigital,
                        gamepadState.right_stick.yDigital,
                    ),
                    effector_roll: 0,
                    effector_yaw: 0,
                } : { // right bumper mode
                    movement_vector: new Vector3(0, 0, 0),
                    effector_roll: gamepadState.right_stick.xDigital,
                    effector_yaw: gamepadState.left_stick.xDigital,
                }),
                gripper: Math.round(gamepadState.right_trigger) - Math.round(gamepadState.left_trigger),
                linear_actuator: (gamepadState.x ? -1 : 0) + (gamepadState.y ? 1 : 0),
                laser: laserEnabled ? 1 : 0,
            }
        };

        setArmManualControl(data.data);

        // only send data at the polling rate
        if (Date.now() - lastUpdate.current < ARM_POLLING_INTERVAL) {
            return;
        }

        lastUpdate.current = Date.now();
        sendMessage(JSON.stringify(data));
    }, [gamepadState, laserEnabled, sendMessage]);

    return <>
        <div className="horizontal-split">
            <AxisControl label={"roll"} value={armManualControl.effector_yaw} />
            <AxisControl label={"yaw"} value={armManualControl.effector_roll} />
        </div>
        <div className="horizontal-split">
            <AxisControl label={"gripper"} value={armManualControl.gripper} />
            <AxisControl label={"actuator"} value={armManualControl.linear_actuator} />
            <div className="horizontal-split container indicator-subsection">
                <h1 className="subsection-indicator-label">laser</h1>
                <input type="checkbox" onChange={e => setLaserEnabled(e.target.checked)} />
            </div>
        </div>
    </>;
}
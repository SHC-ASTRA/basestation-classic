import { useState, useContext, useEffect, useRef, CSSProperties } from "react";
import GamepadContext from "../../lib/gamepadContext";
import { ArmManualData } from "../../lib/types";
import useWebSocketSetup from "../../lib/webSocket";
import GradientIndicator from "../indicators/GradientIndicator";
import { ARM_POLLING_INTERVAL } from "../../config";
import ResetLSS from "../anchor/ResetLSS";

function AxisControl(props: { label: string, style?: CSSProperties, value: number, direction?: string }) {
	let direction = props.direction;
	if (!direction) {
		direction = "to top";
	}

	return <div className="horizontal-split container indicator-subsection" style={props.style}>
		<h1 className="subsection-indicator-label">{props.label}</h1>
		<GradientIndicator value={props.value} scale={1} direction={direction} color="var(--green)" />
	</div>;
}

export default function ArmManualControl() {
	const lastUpdate = useRef(Date.now());
	const { sendMessage } = useWebSocketSetup();
	const [laserEnabled, setLaserEnabled] = useState(false);
	const [armManualControl, setArmManualControl] = useState<ArmManualData["data"]>({
		axis0: 0,
		axis1: 0,
		axis2: 0,
		axis3: 0,
		brake: false,
		effector_roll: 0,
		effector_yaw: 0,
		gripper: 0,
		linear_actuator: 0,
		laser: 0
	});
	const gamepadState = useContext(GamepadContext);

	useEffect(() => {
		const data: ArmManualData = {
			type: "/arm/control/manual",
			timestamp: Date.now(),
			data: {
				...(!gamepadState.right_bumper ? { // regular mode
					axis0: gamepadState.dpad.xDigital,
					axis1: gamepadState.left_stick.xDigital,
					axis2: gamepadState.left_stick.yDigital,
					axis3: gamepadState.right_stick.yDigital,
					brake: gamepadState.b,
					effector_roll: 0,
					effector_yaw: 0,
				} : { // right bumper mode
					axis0: 0,
					axis1: 0,
					axis2: 0,
					axis3: 0,
					brake: false,
					effector_roll: gamepadState.right_stick.xDigital,
					effector_yaw: gamepadState.left_stick.xDigital,
				}),
				gripper: Math.round(gamepadState.right_trigger - gamepadState.left_trigger),
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

	const brakeStyle: CSSProperties = {
		borderColor: gamepadState.b ? "var(--red)" : "var(--text)"
	}

	return <>
		<div className="horizontal-split">
			{!gamepadState.right_bumper ? <>
				<AxisControl label={"axis0"} style={brakeStyle} value={armManualControl.axis0} direction={"to right"} />
				<AxisControl label={"axis1"} style={brakeStyle} value={armManualControl.axis1} direction={"to right"} />
				<AxisControl label={"axis2"} style={brakeStyle} value={armManualControl.axis2} />
				<AxisControl label={"axis3"} style={brakeStyle} value={armManualControl.axis3} />
			</> : <>
				<AxisControl label={"roll"} value={armManualControl.effector_yaw} direction={"to right"} />
				<AxisControl label={"yaw"} value={armManualControl.effector_roll} direction={"to right"} />
			</>}
		</div>
		<div className="horizontal-split">
			<AxisControl label={"gripper"} value={armManualControl.gripper} direction={"to right"} />
			<AxisControl label={"actuator"} value={armManualControl.linear_actuator} />
			<div className="horizontal-split container indicator-subsection">
				<h1 className="subsection-indicator-label">laser</h1>
				<input type="checkbox" onChange={e => setLaserEnabled(e.target.checked)} />
			</div>
		</div>
		<ResetLSS label="Reset Wrist" />
	</>;
}

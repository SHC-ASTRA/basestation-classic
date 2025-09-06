import { useContext, useEffect, useRef, useState } from "react";
import useWebSocketSetup from "../../lib/webSocket";
import GamepadContext from "../../lib/gamepadContext";
import { CoreControlData } from "../../lib/types";
import GradientIndicator from "../indicators/GradientIndicator";
import { CORE_POLLING_INTERVAL } from "../../config";

const INITIAL_BASE_SPEED = 40;
const SPEED_ADJUSTMENT = 10; // 10% adjustment

export default function CoreDrivingControl() {
	const { sendMessage } = useWebSocketSetup();
	const lastUpdate = useRef(Date.now());

	const gamepadState = useContext(GamepadContext);

	const [baseSpeed, setBaseSpeed] = useState(INITIAL_BASE_SPEED);

	// Handle D-pad speed adjustments
	useEffect(() => {
		if (gamepadState.left_trigger) return;

		if (gamepadState.dpad.up) {
			setBaseSpeed((prev) => Math.min(100, prev + SPEED_ADJUSTMENT));
		} else if (gamepadState.dpad.down) {
			setBaseSpeed((prev) => Math.max(0, prev - SPEED_ADJUSTMENT));
		}
	}, [gamepadState.dpad.up, gamepadState.dpad.down, gamepadState.left_trigger]);

	useEffect(() => {
		const data: CoreControlData = {
			type: "/core/control",
			timestamp: Date.now(),
			data: {
				max_speed: Math.max(0, Math.min(100, Math.round(
					baseSpeed + gamepadState.left_trigger * Math.max(0, 80 - baseSpeed)
				))),
				brake: gamepadState.b,
				left_stick:
					gamepadState.right_trigger < 0.5
						? gamepadState.left_stick.y
						: gamepadState.right_stick.y,
				right_stick: gamepadState.right_stick.y,
				turn_to_enable: false,
				turn_to: 0,
				turn_to_timeout: 0,
			},
		};

		// only send data at the polling rate
		if (Date.now() - lastUpdate.current < CORE_POLLING_INTERVAL) {
			return;
		}

		lastUpdate.current = Date.now();
		sendMessage(JSON.stringify(data));
	}, [baseSpeed, gamepadState, sendMessage]);

	const col = gamepadState.b ? { borderColor: "var(--red)" } : {};

	return (
		<>
			<div style={{ flexGrow: 2 }}>
				<h1>Core Driving</h1>
				<div className="horizontal-split indicator-subsection">
					<div />
					<div
						className="container indicator-subsection stick-slider"
						style={col}
					>
						<GradientIndicator
							scale={1}
							value={gamepadState.left_stick.y}
							color="var(--sapphire)"
							direction="to top"
						/>
					</div>
					<div
						className="container indicator-subsection stick-slider"
						style={col}
					>
						<GradientIndicator
							scale={1}
							value={gamepadState.right_stick.y}
							color="var(--sapphire)"
							direction="to top"
						/>
					</div>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: "2rem",
							color: (gamepadState.left_trigger) ? "var(--sapphire)" : undefined,
						}}
					>
						{Math.round(baseSpeed + gamepadState.left_trigger * Math.max(0, 80 - baseSpeed))}%
					</div>
				</div>
			</div>
		</>
	);
}
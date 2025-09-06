import useWebSocketSetup from "../../lib/webSocket";
import AngleIndicator from "../indicators/AngleIndicator";
import { VoltageIndicator_12, VoltageIndicator_5, VoltageIndicator_battery } from "../indicators/VoltageIndicator";

export default function ArmDigitFeedback() {
	const { digitFeedback } = useWebSocketSetup();

	return <div className="container indicator-subsection">
		<h2 className="indicator-subsection-label">Wrist</h2>
		<div className="horizontal-split">
			<div>
				<VoltageIndicator_5 voltage={digitFeedback?.data.voltage_5} />
				<VoltageIndicator_12 voltage={digitFeedback?.data.voltage_12} />
				<VoltageIndicator_battery voltage={digitFeedback?.data.bat_voltage} />
			</div>
			<AngleIndicator label={"Wrist"} current_angle={digitFeedback?.data.wrist_angle} />
		</div>
	</div>;
}
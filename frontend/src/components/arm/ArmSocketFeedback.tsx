import useWebSocketSetup from "../../lib/webSocket";
import MotorTempIndicator from "../indicators/MotorTempIndicator";
import { VoltageIndicator_12, VoltageIndicator_3_3, VoltageIndicator_5, VoltageIndicator_battery } from "../indicators/VoltageIndicator";
import { BaseCurrentIndicator } from "../indicators/CurrentIndicators";
import AngleIndicator from "../indicators/AngleIndicator";
import { SocketFeedbackData } from "src/lib/types";
import ArmDigitFeedback from "./ArmDigitFeedback";

type AxisData = SocketFeedbackData["data"] & {
	[key: string]: number;
};

function AxisFeedback({ axis, data }: { axis: number, data?: AxisData }) {
	return <div className="container indicator-subsection">
		<h2 className="indicator-subsection-label">Axis {axis}</h2>
		<div className="horizontal-split">
			<div>
				<MotorTempIndicator temperature={data && data[`axis${axis}_temp`]} />
				<VoltageIndicator_battery voltage={data && data[`axis${axis}_voltage`]} />
				<BaseCurrentIndicator current={data && data[`axis${axis}_current`]} />
			</div>
			<AngleIndicator label={`Axis${axis}`} current_angle={data && data[`axis${axis}_angle`]} />
		</div>
	</div>;
}

export default function ArmSocketFeedback() {
	const { socketFeedback } = useWebSocketSetup();

	return <>
		<div className="container indicator-subsection">
			<h2>Arm Feedback</h2>
			<div>
				<div className="horizontal-split">
					<AxisFeedback axis={0} data={socketFeedback?.data} />
					<AxisFeedback axis={1} data={socketFeedback?.data} />
				</div>

				<div className="horizontal-split">
					<AxisFeedback axis={2} data={socketFeedback?.data} />
					<AxisFeedback axis={3} data={socketFeedback?.data} />
				</div>

				<div className="horizontal-split">
					<ArmDigitFeedback />
					<div className="container indicator-subsection">
						<h2 className="indicator-subsection-label">System Voltages</h2>
						<div className="horizontal-split">
							<div>
								<VoltageIndicator_battery label="Battery" voltage={socketFeedback?.data.bat_voltage} />
								<VoltageIndicator_12 label="12V" voltage={socketFeedback?.data.voltage_12} />
							</div>
							<div>
								<VoltageIndicator_5 label="5V" voltage={socketFeedback?.data.voltage_5} />
								<VoltageIndicator_3_3 label="3V" voltage={socketFeedback?.data.voltage_3} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</>;
}
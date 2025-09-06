import useWebSocketSetup from "../../lib/webSocket";

export default function CoreDrivingFeedback() {
	const { coreFeedback } = useWebSocketSetup();

	return <>
		<div style={{ flexGrow: 1 }}>
			<p>Orientation: {coreFeedback?.data.orientation}</p>

			<p>Temp: {coreFeedback?.data.bmp_temp}</p>
			<p>Altitude: {coreFeedback?.data.bmp_alt}</p>
			<p>Pressure: {coreFeedback?.data.bmp_pres}</p>

			<p>Battery Voltage: {coreFeedback?.data.bat_voltage}</p>
			<p>Voltage 12: {coreFeedback?.data.voltage_12}</p>
			<p>Voltage 5: {coreFeedback?.data.voltage_5}</p>
			<p>Voltage 3: {coreFeedback?.data.voltage_3}</p>
		</div>
	</>;
}
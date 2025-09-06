import useWebSocketSetup from "../../lib/webSocket";

import { VoltageIndicator_12, VoltageIndicator_5, VoltageIndicator_battery } from "../indicators/VoltageIndicator";

export default function CitadelVoltages() {
    const { bioFeedback } = useWebSocketSetup();

    return <div><div className="container indicator-subsection">
        <h2 className="indicator-subsection-label">Voltages</h2>
        <VoltageIndicator_5 label={"5V"} voltage={bioFeedback?.data.voltage_5} />
        <VoltageIndicator_12 label={"12V"} voltage={bioFeedback?.data.voltage_12} />
        <VoltageIndicator_battery label={"Battery"} voltage={bioFeedback?.data.bat_voltage} />
    </div></div>
}
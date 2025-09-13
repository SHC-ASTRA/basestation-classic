import { useState } from "react";
import ArmManualControl from "./ArmManualControl";
import ArmIKControl from "./ArmIKControl";

export default function ArmControl() {
    const [ikMode, setIkMode] = useState(false);

    return <div className="container indicator-subsection vertical-split">
        <div className="indicator-subsection vertcal-split grow-1">
            <h2>
                {ikMode ? "Arm IK Control" : "Arm Manual Control"}
            </h2>
            <button className="button" onClick={() => setIkMode(!ikMode)}>
                {ikMode ? "Switch to Manual" : "Switch to IK"}
            </button>
            {ikMode ? <ArmIKControl /> : <ArmManualControl />}
        </div>
    </div>;
}
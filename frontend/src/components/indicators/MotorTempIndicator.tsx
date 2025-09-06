import ColoredIndicator from "./ColoredIndicator";

export default function MotorTempIndicator({ label, temperature }: { label?: string, temperature?: number }) {
    return <>
        <ColoredIndicator label={label ?? "Temperature"} good_value={80} bad_value={90} current_value={temperature} precision={1} unit="°C" />
    </>
}
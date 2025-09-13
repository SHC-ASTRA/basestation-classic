import ColoredIndicator from "./ColoredIndicator";

export function BaseVoltageIndicator({ label, voltage, good_value, bad_value, precision }: { label?: string, voltage?: number, good_value: number, bad_value: number, precision: number }) {
    return <>
        <ColoredIndicator label={label ?? "Voltage"} bad_value={bad_value} good_value={good_value} current_value={voltage} precision={precision} unit="V" />
    </>
}

export function VoltageIndicator_3_3({ label, voltage }: { label?: string, voltage?: number }) {
    return <>
        <BaseVoltageIndicator label={label} bad_value={3} good_value={3.2} precision={2} voltage={voltage} />
    </>
}
export function VoltageIndicator_5({ label, voltage }: { label?: string, voltage?: number }) {
    return <>
        <BaseVoltageIndicator label={label} bad_value={4.5} good_value={4.75} voltage={voltage} precision={1} />
    </>
}
export function VoltageIndicator_12({ label, voltage }: { label?: string, voltage?: number }) {
    return <>
        <BaseVoltageIndicator label={label} bad_value={11} good_value={11.5} voltage={voltage} precision={1} />
    </>
}
export function VoltageIndicator_battery({ label, voltage }: { label?: string, voltage?: number }) {
    return <>
        <BaseVoltageIndicator label={label} bad_value={14.5} good_value={14.8} voltage={voltage} precision={1} />
    </>
}
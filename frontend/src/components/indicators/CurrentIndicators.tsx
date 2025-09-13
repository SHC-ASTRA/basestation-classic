import ColoredIndicator from "./ColoredIndicator";

export function BaseCurrentIndicator({ label, current }: { label?: string, current?: number }) {
    return <>
        <ColoredIndicator label={label ?? "Current"} good_value={15} bad_value={40} current_value={current} precision={1} unit="A" />
    </>
}
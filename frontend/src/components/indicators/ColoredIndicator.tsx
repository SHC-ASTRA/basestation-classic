import { useState, useEffect } from "react";

export default function ColoredIndicator({ label, bad_value, good_value, current_value, precision, unit }: { label: string, bad_value: number, good_value: number, current_value?: number, precision?: number, unit?: string }) {
    const [color, setColor] = useState('var(--green)');

    useEffect(() => {
        if (current_value === undefined) {
            setColor('var(--blue)');
            return;
        }

        if (bad_value < good_value) {
            if (current_value < bad_value) {
                setColor('var(--red)');
            } else if (current_value < good_value) {
                setColor('var(--yellow)');
            } else {
                setColor('var(--green)');
            }
        } else if (good_value < bad_value) {
            if (current_value < good_value) {
                setColor('var(--green)');
            } else if (current_value < bad_value) {
                setColor('var(--yellow)');
            } else {
                setColor('var(--red)');
            }
        } else {
            // shouldn't get here, so make it weirdo
            setColor('var(--blue)');
        }
    }, [bad_value, good_value, current_value]);

    return (
        <div className="colored-indicator">
            <p className="colored-indicator-label">{label}</p>
            <p className="colored-indicator-value" style={{ color: color }}>{current_value?.toFixed(precision) ?? "no data "}{unit
                ? unit
                : null}</p>
        </div>
    );
}

import { ChangeEvent, ChangeEventHandler, PropsWithChildren, useEffect, useState } from "react";
import SubmitButton from "../indicators/SubmitButton";

export function BioSetter(props: PropsWithChildren<{ label: string, max: number, step?: number, precise?: boolean, min: number, placeholder: string, onSubmission: (id: number, value: number) => void }>) {
    const [inputValue, setInputValue] = useState("");
    const [selectedOption, setSelectedOption] = useState(NaN);
    const [disabled, setDisabled] = useState(true);
    const [id, setId] = useState<number>(0);

    useEffect(() => {
        setSelectedOption(props.precise ? parseFloat(inputValue) : parseInt(inputValue))
    }, [inputValue, props.precise]);

    useEffect(() => {
        setDisabled(
            isNaN(selectedOption)
            || selectedOption < props.min
            || selectedOption > props.max
            || isNaN(id)
            || id <= 0
        );
    }, [id, props.max, props.min, selectedOption])

    function onSelect(event: ChangeEvent<HTMLSelectElement>) {
        setId(parseInt(event.target.value));
    }

    function onChange(event: ChangeEvent<HTMLInputElement>) {
        setInputValue(event.target.value);
    }

    function onClick() {
        if (disabled) return;

        props.onSubmission(id, selectedOption);

        setInputValue("");
    }

    return <SubmitButton label={props.label} disabled={disabled} color="var(--crust)" callback={onClick}>
        <select value={id} onChange={onSelect}>
            <option value={0}>Select...</option>
            {props.children}
        </select>
        <input type="number" step={props.step === undefined ? 1 : props.step} value={inputValue} placeholder={props.placeholder} onChange={onChange} />
    </SubmitButton>
}

export function BioSwitch({ label, onChange, disabled }: { label: string; onChange: ChangeEventHandler<HTMLInputElement>, disabled?: boolean }) {
    return (
        <div className="indicator-subsection horizontal-split">
            <h2 style={{ justifyContent: "center", alignContent: "center" }}>{label}</h2>
            <input type="checkbox" onChange={onChange} disabled={disabled} />
        </div>
    );
}

export function BioSelector({ label, onChange, children }: { label: string; onChange: ChangeEventHandler<HTMLSelectElement>, disabled?: boolean, children: React.ReactNode }) {
    return (
        <div className="indicator-subsection horizontal-split">
            <h2 style={{ justifyContent: "center", alignContent: "center" }}>{label}</h2>
            <select onChange={onChange}>
                <option value={0}>Select...</option>
                {children}
            </select>
        </div>
    );
}
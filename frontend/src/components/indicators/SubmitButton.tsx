import React from "react";

/**
 * SubmitButton is a component that allows the user to input a number and submit it to the backend.
 * 
 * @param {string} label - The label for the input field. Renders as an <h2> element.
 * @param {string} color - The color of the input field. Renders as the border color of the button field.
 * @param {function} bounds - A function that takes a number and returns a boolean indicating whether the number is valid (can check int for those that need that)
 * @param {number} initial - The initial value of the input field. Will be reset to this value after a successful submission.
 * @param {function} callback - A function that takes a number and sends it to the backend by using useWebSocketSetup.
 */
export default function SubmitButton(props: React.PropsWithChildren<{ label?: string, color: string, disabled?: boolean, callback: (r: React.MouseEvent<HTMLButtonElement>) => void }>) {
    return <div className="indicator-subsection horizontal-split">
        {props.label && <h2 className="indicator-subsection-label">{props.label}</h2>}
        {props.children}
        <button onClick={props.callback} disabled={props.disabled ?? false} className="submit-button" style={{ backgroundColor: props.color }}>Submit</button>
    </div>
}
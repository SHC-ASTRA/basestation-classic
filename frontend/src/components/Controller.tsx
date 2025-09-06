import { useContext, useEffect, useState } from "react";
import GamepadContext from "../lib/gamepadContext";
import { Vector2 } from "../lib/types";

function ControllerDisplay({ className, style }: { className?: string, style?: React.CSSProperties }) {
	const gamepad = useContext(GamepadContext);

	const base_color = "var(--text)";
	const base_secondary_color = "var(--subtext-1)";
	const base_tertiary_color = "var(--subtext-0)";
	const default_color = "var(--base)";
	const default_pressed_color = "var(--mauve)";

	const [buttonA, setButtonA] = useState(default_color);
	const [buttonB, setButtonB] = useState(default_color);
	const [buttonX, setButtonX] = useState(default_color);
	const [buttonY, setButtonY] = useState(default_color);
	const [dpadUp, setDpadUp] = useState(default_color);
	const [dpadDown, setDpadDown] = useState(default_color);
	const [dpadLeft, setDpadLeft] = useState(default_color);
	const [dpadRight, setDpadRight] = useState(default_color);
	const [buttonSelect, setButtonSelect] = useState(default_color);
	const [buttonStart, setButtonStart] = useState(default_color);
	const [buttonLeftPress, setButtonLeftPress] = useState(default_color);
	const [buttonRightPress, setButtonRightPress] = useState(default_color);
	const [stickLeft, setStickLeft] = useState(new Vector2(0, 0));
	const [stickRight, setStickRight] = useState(new Vector2(0, 0));
	const buttonHome = default_color;

	useEffect(() => {
		setButtonA(gamepad.a ? "var(--green)" : default_color);
		setButtonB(gamepad.b ? "var(--red)" : default_color);
		setButtonX(gamepad.x ? "var(--blue)" : default_color);
		setButtonY(gamepad.y ? "var(--yellow)" : default_color);

		setDpadUp(gamepad.dpad.up ? default_pressed_color : default_color);
		setDpadDown(gamepad.dpad.down ? default_pressed_color : default_color);
		setDpadLeft(gamepad.dpad.left ? default_pressed_color : default_color);
		setDpadRight(gamepad.dpad.right ? default_pressed_color : default_color);

		setButtonSelect(gamepad.select ? default_pressed_color : default_color);
		setButtonStart(gamepad.start ? default_pressed_color : default_color);

		setButtonLeftPress(gamepad.left_stick.pressed ? default_pressed_color : default_color);
		setButtonRightPress(gamepad.right_stick.pressed ? default_pressed_color : default_color);

		setStickLeft(gamepad.left_stick);
		setStickRight(gamepad.right_stick);
	}, [gamepad]);

	// TODO: add indicators for buttons and triggers :)

	return (
		<div style={style} className={className}>
			{
				<svg
					viewBox="0 0 36 36"
					version="1.1"
					id="svg10"
					xmlns="http://www.w3.org/2000/svg">
					<defs
						id="defs10" />
					<path
						fill={base_tertiary_color}
						d="M2.13 14.856l-.004-.002S.075 27.271.075 29.061c0 1.824 1.343 3.302 3 3.302.68 0 1.3-.258 1.803-.678l10.166-8.938L2.13 14.856zm31.69 0l.004-.002s2.051 12.417 2.051 14.207c0 1.824-1.343 3.302-3 3.302-.68 0-1.3-.258-1.803-.678l-10.166-8.938 12.914-7.891z"
						id="path1" />
					<g
						fill={base_color}
						id="g2">
						<circle
							cx="25.975"
							cy="15.551"
							r="8.5"
							id="circle1" />
						<circle
							cx="9.975"
							cy="15.551"
							r="8.5"
							id="circle2" />
						<path
							d="M9.975 7.051h16v16.87h-16z"
							id="path2" />
					</g>
					<circle
						fill={base_secondary_color}
						cx="13.075"
						cy="23.301"
						r="5"
						id="circle3" />
					<circle
						fill={base_secondary_color}
						cx="22.875"
						cy="23.301"
						r="5"
						id="circle4" />
					<circle
						fill={buttonRightPress}
						cx="22.875"
						cy="23.301"
						r="3"
						id="stickRight"
						style={{ fill: buttonRightPress, fillOpacity: 1, transform: `translate(${stickRight.x}px, ${stickRight.y}px)` }} />
					<circle
						fill={buttonHome}
						cx="17.9"
						cy="16.445"
						id="buttonHome"
						style={{ strokeWidth: 0.5, fill: buttonHome, fillOpacity: 1 }}
						r="1.5" />
					<circle
						fill={buttonLeftPress}
						cx="13.075"
						cy="23.301"
						r="3"
						id="stickLeft"
						style={{ fill: buttonLeftPress, fillOpacity: 1, transform: `translate(${stickLeft.x}px, ${stickLeft.y}px)` }} />
					<ellipse
						fill={buttonStart}
						cx="20.9"
						cy="10"
						id="buttonStart"
						style={{ strokeWidth: 0.408248, fill: buttonStart, fillOpacity: 1 }}
						rx="1.5"
						ry="1" />
					<ellipse
						fill={buttonSelect}
						cx="14.9"
						cy="10"
						id="buttonSelect"
						style={{ strokeWidth: 0.408248, fill: buttonSelect, fillOpacity: 1 }}
						rx="1.5"
						ry="1" />
					<circle
						fill={buttonY}
						cx="27.735001"
						cy="11.133"
						r="1.603"
						id="buttonY"
						style={{ fill: buttonY, fillOpacity: 1 }} />
					<circle
						fill={buttonA}
						cx="27.735001"
						cy="17.607"
						r="1.603"
						id="buttonA"
						style={{ fill: buttonA, fillOpacity: 1 }} />
					<circle
						fill={buttonX}
						cx="24.497999"
						cy="14.369999"
						r="1.603"
						id="buttonX"
						style={{ fill: buttonX, fillOpacity: 1 }} />
					<circle
						fill={buttonB}
						cx="30.972"
						cy="14.369999"
						r="1.603"
						id="buttonB"
						style={{ fill: buttonB, fillOpacity: 1 }} />
					<path
						d="M 9.148,12.514 V 10.346 C 9.148,10.067 8.922,9.841 8.643,9.841 H 7.085 c -0.279,0 -0.505,0.226 -0.505,0.505 v 2.168 l 1.284,1.285 z m -2.569,3.63 v 2.168 c 0,0.279 0.226,0.505 0.505,0.505 h 1.558 c 0.279,0 0.505,-0.226 0.505,-0.505 V 16.144 L 7.863,14.859 Z m 5.269,-3.1 H 9.68 l -1.285,1.285 1.285,1.285 h 2.168 c 0.279,0 0.505,-0.227 0.505,-0.505 V 13.55 c 0,-0.279 -0.226,-0.506 -0.505,-0.506 z m -5.799,0 H 3.88 c -0.279,0 -0.505,0.227 -0.505,0.505 v 1.558 c 0,0.279 0.226,0.505 0.505,0.505 h 2.168 l 1.285,-1.285 z"
						fill={dpadLeft}
						id="dpadLeft"
						style={{ fill: dpadLeft, fillOpacity: 1 }} />
					<path
						d="M 9.148,12.514 V 10.346 C 9.148,10.067 8.922,9.841 8.643,9.841 H 7.085 c -0.279,0 -0.505,0.226 -0.505,0.505 v 2.168 l 1.284,1.285 z m -2.569,3.63 v 2.168 c 0,0.279 0.226,0.505 0.505,0.505 h 1.558 c 0.279,0 0.505,-0.226 0.505,-0.505 V 16.144 L 7.863,14.859 Z m 5.269,-3.1 H 9.68 l -1.285,1.285 1.285,1.285 h 2.168 c 0.279,0 0.505,-0.227 0.505,-0.505 V 13.55 c 0,-0.279 -0.226,-0.506 -0.505,-0.506 z"
						fill={dpadRight}
						id="dpadRight"
						style={{ fill: dpadRight, fillOpacity: 1 }} />
					<path
						d="M 9.148,12.514 V 10.346 C 9.148,10.067 8.922,9.841 8.643,9.841 H 7.085 c -0.279,0 -0.505,0.226 -0.505,0.505 v 2.168 l 1.284,1.285 z m -2.569,3.63 v 2.168 c 0,0.279 0.226,0.505 0.505,0.505 h 1.558 c 0.279,0 0.505,-0.226 0.505,-0.505 V 16.144 L 7.863,14.859 Z"
						fill={dpadDown}
						id="dpadDown"
						style={{ fill: dpadDown, fillOpacity: 1 }} />
					<path
						d="M 9.148,12.514 V 10.346 C 9.148,10.067 8.922,9.841 8.643,9.841 H 7.085 c -0.279,0 -0.505,0.226 -0.505,0.505 v 2.168 l 1.284,1.285 z"
						fill={dpadUp}
						id="dpadUp"
						style={{ fill: dpadUp, fillOpacity: 1 }} />
				</svg>}
		</div>);
}
export default ControllerDisplay;
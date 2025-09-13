import { useState } from "react";
import GamepadContext from "./gamepadContext";
import { GamepadState } from "./types";

/**
 * Provider for the GamepadContext. This component should wrap the root of the app.
 * @returns 
 */
const GamepadProvider = ({ children }: { children: React.ReactNode }) => {
	const [gamepadState, setGamepadState] = useState(new GamepadState(null));
	let gamepad: Gamepad | null = null;

	let requestId: number;

	const updateGamepad = () => {
		setGamepadState(new GamepadState(gamepad));
		requestId = requestAnimationFrame(updateGamepad);
	};

	window.addEventListener("gamepadconnected", ((event: GamepadEvent) => {
		// when a gamepad connects, set it as the current gamepad if there isn't one already
		if (gamepad === null) {
			gamepad = event.gamepad;
			requestId = requestAnimationFrame(updateGamepad);
		}
	}));

	window.addEventListener("gamepaddisconnected", (() => {
		// when a gamepad disconnects, get the most recent gamepad that's still connected and make that main gamepad
		const first_gamepad = navigator.getGamepads()[0];
		if (first_gamepad) {
			gamepad = first_gamepad;
		} else {
			// but if there isn't another gamepad, we just set it to null
			gamepad = null;
			cancelAnimationFrame(requestId);
		}
	}));

	return (
		<GamepadContext.Provider value={gamepadState} children={children} />
	);
}

export default GamepadProvider;

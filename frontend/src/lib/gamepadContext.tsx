import { createContext } from "react";
import { GamepadState } from "./types";

/**
 * You probably shouldn't be using this directly. See GamepadProvider in gamepad.tsx.
 */
const GamepadContext = createContext(new GamepadState(null));

export default GamepadContext;

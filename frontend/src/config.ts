export const ARM_POLLING_RATE = 60;
export const CORE_POLLING_RATE = 20;

export const ARM_POLLING_INTERVAL = 1000 / ARM_POLLING_RATE;
export const CORE_POLLING_INTERVAL = 1000 / CORE_POLLING_RATE;

export const STICK_DEAD_ZONE = 0.1; // the minimum value for a stick to read more than zero
export const STICK_DIGITAL_THRESHOLD = 0.4; // the point at which sticks are considered "on" in a digital context
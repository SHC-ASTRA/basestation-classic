import { STICK_DEAD_ZONE, STICK_DIGITAL_THRESHOLD } from "../config";

export abstract class Vector {
    abstract get unit(): Vector;
    abstract get magnitude(): number;

    static calc_magnitude(...args: number[]): number {
        return Math.sqrt(args.reduce((sum, x) => sum + x * x, 0));
    }
}

export class Vector2 extends Vector {
    x: number;
    y: number;

    get magnitude() {
        return Vector.calc_magnitude(this.x, this.y);
    }

    get angle() {
        return Math.atan2(this.y, this.x);
    }

    get unit() {
        return new Vector2(this.x / this.magnitude, this.y / this.magnitude);
    }

    static from_polar(angle: number, magnitude: number) {
        return new Vector2(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
    }

    constructor(x: number, y: number) {
        super();
        this.x = x;
        this.y = y;
    }
}

export class Vector3 extends Vector {
    x: number;
    y: number;
    z: number;

    get magnitude() {
        return Vector.calc_magnitude(this.x, this.y, this.z);
    }

    get unit() {
        return new Vector3(this.x / this.magnitude, this.y / this.magnitude, this.z / this.magnitude);
    }

    constructor(x: number, y: number, z: number) {
        super();
        this.x = x;
        this.y = y;
        this.z = z;
    }
}


export interface WebSocketData {
    type: string;
    timestamp: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export interface CoreFeedbackData extends WebSocketData {
    type: '/core/feedback';
    data: {
        // GPS Data
        gps_lat: number;
        gps_long: number;
        gps_sats: number;
        gps_alt: number;

        // BNO055 Sensor Data
        bno_gyro: Vector3;
        bno_accel: Vector3;

        // Rover Orientation
        orientation: number;
        imu_calib: number;

        // BMP Sensor Data
        bmp_temp: number;
        bmp_alt: number;
        bmp_pres: number;

        // Voltage Readings
        bat_voltage: number;
        voltage_12: number;
        voltage_5: number;
        voltage_3: number;

        // REV Motor Feedback

        /// Front Left (1)
        fl_temp: number;
        fl_voltage: number;
        fl_current: number;

        /// Back Left (2)
        bl_temp: number;
        bl_voltage: number;
        bl_current: number;

        /// Front Right (3)
        fr_temp: number;
        fr_voltage: number;
        fr_current: number;

        /// Back Right (4)
        br_temp: number;
        br_voltage: number;
        br_current: number;
    };
}

export interface CoreControlData extends WebSocketData {
    type: '/core/control';
    data: {
        left_stick: number;
        right_stick: number;

        max_speed: number;

        brake: boolean;

        turn_to_enable: boolean;
        turn_to: number;
        turn_to_timeout: number;
    };
}
export interface AutoFeedbackData extends WebSocketData {
    type: '/core/auto';
    data: {
        mission_type: number

        target_lat: number;
        target_long: number;

        remaining_distance: number;

        update: string;
        current_job: string;
        warning: string;
    };
}


export interface SocketFeedbackData extends WebSocketData {
    type: '/arm/feedback/socket';
    data: {
        axis0_angle: number;
        axis0_temp: number;
        axis0_voltage: number;
        axis0_current: number;

        axis1_angle: number;
        axis1_temp: number;
        axis1_voltage: number;
        axis1_current: number;

        axis2_angle: number;
        axis2_temp: number;
        axis2_voltage: number;
        axis2_current: number;

        axis3_angle: number;
        axis3_temp: number;
        axis3_voltage: number;
        axis3_current: number;

        bat_voltage: number;
        voltage_12: number;
        voltage_5: number;
        voltage_3: number;
    };
}
export interface ArmManualData extends WebSocketData {
    type: '/arm/control/manual';
    data: {
        axis0: number;
        axis1: number;
        axis2: number;
        axis3: number;

        brake: boolean;

        effector_roll: number;
        effector_yaw: number;

        gripper: number;
        linear_actuator: number;

        laser: number;
    };
}
export interface ArmIKData extends WebSocketData {
    type: '/arm/control/ik';
    data: {
        movement_vector: Vector3;

        gripper: number;
        linear_actuator: number;

        laser: number;

        effector_roll: number;
        effector_yaw: number;
    };
}
export interface DigitFeedbackData extends WebSocketData {
    type: '/arm/feedback/digit';
    data: {
        wrist_angle: number;

        bat_voltage: number;
        voltage_12: number;
        voltage_5: number;
    };
}
export interface BioFeedbackData extends WebSocketData {
    type: '/bio/feedback';
    data: {
        bat_voltage: number;
        voltage_12: number;
        voltage_5: number;

        drill_temp: number;
        drill_humidity: number;
    };
}

export interface BioControlData extends WebSocketData {
    type: '/bio/control';
    data: {
        pump_id: number;
        pump_amount: number;

        fan_id: number;
        fan_duration: number;

        servo_id: number;
        servo_state: boolean;

        bio_arm: number;

        laser: number;

        drill: number;
        drill_arm: number;

        vibration_motor: number;
    };
}

export interface AnchorRelayData extends WebSocketData {
    type: '/anchor/relay',
    data: {
        data: string
    }
}

export interface PtzControlData extends WebSocketData {
    type: '/ptz/control';
    data: {
        control_mode: number,
        turn_yaw: number,
        turn_pitch: number,
        yaw: number,
        pitch: number,
        axis_id: number,
        angle: number,
        zoom_level: number,
        stream_type: number,
        stream_freq: number,
        reset: boolean,
    };
}

export interface AntennaControlData extends WebSocketData {
    type: 'antenna',
    data: {
        message: string;
    }
}

export interface AntennaFeedbackData extends WebSocketData {
    type: 'antenna/feedback',
    data: {
        lat: number,
        lon: number,
        sat: number,
        heading: number,
        calib: number,
    }
}

export class AllFeedbackData {
    coreFeedback: CoreFeedbackData | null = null;
    autoFeedback: AutoFeedbackData | null = null;
    digitFeedback: DigitFeedbackData | null = null;
    bioFeedback: BioFeedbackData | null = null;
    socketFeedback: SocketFeedbackData | null = null;
}

export class ControllerStick extends Vector2 {
    pressed: boolean;

    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;

    xDigital: number;
    yDigital: number;

    constructor(x: number, y: number, pressed: boolean) {
        function applyDeadzone(value: number): number {
            if (Math.abs(value) < STICK_DEAD_ZONE) {
                return 0;
            }
            return value;
        }

        super(applyDeadzone(x), applyDeadzone(y));
        this.pressed = pressed;

        this.up = y > STICK_DIGITAL_THRESHOLD;
        this.down = y < -STICK_DIGITAL_THRESHOLD;
        this.right = x > STICK_DIGITAL_THRESHOLD;
        this.left = x < -STICK_DIGITAL_THRESHOLD;

        this.xDigital = (this.right ? 1 : 0) - (this.left ? 1 : 0);
        this.yDigital = (this.up ? 1 : 0) - (this.down ? 1 : 0);
    }
};

export class GamepadState {
    gamepadConnected: boolean = false;

    a: boolean = false;
    b: boolean = false;
    x: boolean = false;
    y: boolean = false;

    left_bumper: boolean = false;
    right_bumper: boolean = false;

    left_trigger: number = 0.0;
    right_trigger: number = 0.0;

    select: boolean = false;
    start: boolean = false;

    left_stick: ControllerStick = new ControllerStick(0, 0, false);
    right_stick: ControllerStick = new ControllerStick(0, 0, false);

    /**
     * D-Pad as a stick. x is left/right, y is up/down.
     */
    dpad: ControllerStick = new ControllerStick(0, 0, false);

    constructor(gamepad: Gamepad | null) {
        if (gamepad === null) {
            return;
        }

        this.gamepadConnected = true;

        this.a = gamepad.buttons[0].pressed;
        this.b = gamepad.buttons[1].pressed;
        this.x = gamepad.buttons[2].pressed;
        this.y = gamepad.buttons[3].pressed;

        this.left_bumper = gamepad.buttons[4].pressed;
        this.right_bumper = gamepad.buttons[5].pressed;

        this.left_trigger = gamepad.axes[4] ? (gamepad.axes[4] + 1) / 2 : gamepad.buttons[6].value;
        this.right_trigger = gamepad.axes[5] ? (gamepad.axes[5] + 1) / 2 : gamepad.buttons[7].value;

        this.select = gamepad.buttons[8].pressed;
        this.start = gamepad.buttons[9].pressed;

        this.left_stick = new ControllerStick(gamepad.axes[0], -gamepad.axes[1], gamepad.buttons[10].pressed);
        this.right_stick = new ControllerStick(gamepad.axes[2], -gamepad.axes[3], gamepad.buttons[11].pressed);

        const up = gamepad.buttons[12].pressed;
        const down = gamepad.buttons[13].pressed;
        const left = gamepad.buttons[14].pressed;
        const right = gamepad.buttons[15].pressed;

        this.dpad = new ControllerStick(
            (right ? 1 : 0) - (left ? 1 : 0),
            (up ? 1 : 0) - (down ? 1 : 0),
            false
        );
    }
}

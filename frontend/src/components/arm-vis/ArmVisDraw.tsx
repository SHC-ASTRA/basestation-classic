import { ArmVis } from "./pkg/rust_wasm_vis"
import turret from "../../assets/models/_Turret_Assembly.stl?raw"
import axis0 from "../../assets/models/_AXIS_0.stl?raw"
import axis1 from "../../assets/models/_AXIS_1.stl?raw"
import axis2 from "../../assets/models/_AXIS_2.stl?raw"
import axis3 from "../../assets/models/_AXIS_3.stl?raw"
import axis4 from "../../assets/models/_AXIS_4.stl?raw"
import endEffector from "../../assets/models/_END_EFFECTOR.stl?raw"
import urdf from "../../assets/models/arm11.urdf?raw"
import vert from "../../assets/shaders/vert.glsl?raw"
import frag from "../../assets/shaders/frag.glsl?raw"
import { useContext, useEffect, useRef, useState } from "react";
import useWebSocketSetup from "../../../src/lib/webSocket"
import React from "react"
import ArmVisualContext from "./ArmVisualContext"


class ArmVisState extends React.Component {
    static myVis: ArmVis;
    static init = false;


    push_sources() {
        ArmVisState.myVis.load_shaders(vert, frag);
        ArmVisState.myVis.push_model_sources(turret)
        ArmVisState.myVis.push_model_sources(axis0);
        ArmVisState.myVis.push_model_sources(axis1);
        ArmVisState.myVis.push_model_sources(axis2);
        ArmVisState.myVis.push_model_sources(axis3);
        ArmVisState.myVis.push_model_sources(axis4);
        ArmVisState.myVis.push_urdf_source(urdf);
    };

    renderCall() {
        ArmVisState.myVis.main()
    }
}

export class ArmVisClass {
    static vis: ArmVis;
    static constructed = false;
    static angle_data = [0.0, 0.0, 0.0, 0.0, 0.0];
    static canvas: React.RefObject<HTMLCanvasElement | null>;
    static isInit = false;

    static new(ctx: WebGL2RenderingContext): void {
        if (!this.constructed) {
            this.vis = ArmVis.new(ctx);
        }
    }

    static push(): void {
        this.vis.load_shaders(vert, frag);
        this.vis.push_model_sources(turret)
        this.vis.push_model_sources(axis0);
        this.vis.push_model_sources(axis1);
        this.vis.push_model_sources(axis2);
        this.vis.push_model_sources(axis3);
        this.vis.push_model_sources(axis4);
        this.vis.push_urdf_source(urdf);

    }

    static update(encoder_data: number[]): void {
        this.angle_data = encoder_data;
    }

    static isNull(): boolean {
        console.log("HELPME")
        if (this.canvas == null) { return true }
        else { return false }
    }
}

let testVar = 14;

export function testVarInc() {
    testVar += 6
    console.log("INC")
}


//import ArmVis from "./pkg/rust_wasm_vis"


export default function ArmVisDraw(props: { canvasCtx: WebGL2RenderingContext }) {
    //console.log(frag);
    const [visInit, setVisInit] = useState(false);
    const [sourcesPushed, setSourcesPushed] = useState(false);
    const { socketFeedback } = useWebSocketSetup();
    const { digitFeedback } = useWebSocketSetup();

    useEffect(() => {
        if (!ArmVisClass.isInit) {
            ArmVisClass.new(props.canvasCtx);
            ArmVisClass.push();
            ArmVisClass.vis.init();
            ArmVisClass.isInit = true;
            return
        } else {
            ;
        }
        const socket = socketFeedback?.data;
        const digit = digitFeedback?.data;
        const angle_data = [socket?.axis0_angle ?? 0,
        socket?.axis1_angle ?? 0,
        socket?.axis2_angle ?? 0,
        socket?.axis3_angle ?? 0,
        digit?.wrist_angle ?? 0]
        ArmVisClass.update(angle_data)
        const pass = new Float32Array(ArmVisClass.angle_data);
        ArmVisClass.vis.update_joint_angles(pass)
        ArmVisClass.vis.main();
    }, [digitFeedback?.data, props.canvasCtx, socketFeedback?.data]);

    return <></>
}



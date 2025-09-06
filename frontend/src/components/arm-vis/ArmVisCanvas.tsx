import React, { createContext, useEffect, useRef, useState } from "react"
import ArmVisDraw, { ArmVisClass } from "./ArmVisDraw"
import ArmVisRoverFeedback from "./ArmVisRoverFeedback";
import ArmVisTest from "./ArmVisTest";



export default function ArmVisCanvas() {

    const vis_canvas = useRef<HTMLCanvasElement>(null)
    if (vis_canvas.current == null) {
        ArmVisClass.isInit = false;
    }

    const [contextInit, setContextInit] = useState(false);

    useEffect(() => {
        const cas = vis_canvas.current
        setContextInit(true);
        ArmVisClass.canvas = vis_canvas;

    }, [vis_canvas]);

    return <div className="arm-vis-div">

        <canvas ref={vis_canvas} width={800} height={900}>
            {contextInit ? <ArmVisDraw canvasCtx={vis_canvas.current?.getContext("webgl2")} /> : null}</canvas>
    </div>

}


import { useRef } from "react";
import useWebSocketSetup from "../../lib/webSocket";
import SubmitButton from "../indicators/SubmitButton";

export default function ResetAntenna() {
    const { sendMessage } = useWebSocketSetup();
    const msg = useRef("");

    function resetAntenna() {
        sendMessage(JSON.stringify({
            type: 'antenna',
            timestamp: Date.now(),
            data: {
                message: msg.current
            }
        }));
    }

    return <>
        <SubmitButton color={"var(--red)"} callback={resetAntenna}>
            <input type="text" onChange={(e) => {
                msg.current = e.target.value;
            }}>
            </input>
        </SubmitButton>
    </>
}
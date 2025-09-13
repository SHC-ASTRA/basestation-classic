import useWebSocketSetup from "../../lib/webSocket";

export default function ResetLSS({ label }: { label?: string }) {
    const { sendMessage } = useWebSocketSetup();

    function resetLSS() {
        sendMessage(JSON.stringify({
            type: '/anchor/relay',
            timestamp: Date.now(),
            data: {
                data: "can_relay_tovic,broadcast,29,1\n"
            }
        }));
    }

    return <>
        <button className="submit-button" onClick={resetLSS} style={{ width: "100%", flexGrow: 0 }}>
            {label || "Reset LSS"}
        </button>
    </>
}
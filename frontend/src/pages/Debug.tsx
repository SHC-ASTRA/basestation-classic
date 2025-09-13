import { WebSocketData } from "../lib/types";
import useWebSocketSetup from "../lib/webSocket";
import ResetAntenna from "../components/anchor/Antenna";

/**
 * Function to format WebSocket data into a YAML-like string.
 * @param data data from the websocket
 * @returns string formatted in a YAML-like style
 */
function formatData(data: object | null, level: number = 0): string {
	if (!data) return "null";

	// recursive function to format the data
	let result = "";
	for (const [key, value] of Object.entries(data)) {
		if (typeof value === 'object' && value !== null) {
			result += `${'  '.repeat(level)}${key}:\n${formatData(value, level + 1)}`;
		} else {
			result += `${'  '.repeat(level)}${key}: ${value}\n`;
		}
	}
	return result;
}

function FeedbackSection({ title, data }: { title: string, data: WebSocketData | null }) {
	return (
		<div className="container">
			<h2>{title}</h2>
			<div className="horizontal-split">
				<p>Timestamp: {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : "No data"}</p>
				<p>Type: {data?.type || "No data"}</p>
			</div>
			<pre>{formatData(data?.data)}</pre>
		</div>
	);
}

export default function DebugPage() {
	const { autoFeedback, coreFeedback, digitFeedback, bioFeedback, socketFeedback, antennaFeedback } = useWebSocketSetup();

	return <>
		<div className="vertical-split">
			<div className="horizontal-split">
				<FeedbackSection title="Auto Feedback" data={autoFeedback} />
				<FeedbackSection title="Core Feedback" data={coreFeedback} />
				<FeedbackSection title="Digit Feedback" data={digitFeedback} />
			</div>
			<div className="horizontal-split">
				<FeedbackSection title="Bio Feedback" data={bioFeedback} />
				<FeedbackSection title="Socket Feedback" data={socketFeedback} />
				<div className="container">
					<FeedbackSection title="Antenna Feedback" data={antennaFeedback} />
					<ResetAntenna />
				</div>
			</div>
		</div>
	</>
}
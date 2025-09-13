import useWebSocketSetup from "../../lib/webSocket";

export default function CoreAutoFeedback() {
	const { autoFeedback } = useWebSocketSetup();

	return <>
		<h1>Core Autonomy</h1>
		{autoFeedback && (
			<>
				<p>Mission: {autoFeedback.data.mission_type}</p>
				<p>Target latitude: {autoFeedback.data.target_lat}</p>
				<p>Target longitude: {autoFeedback.data.target_long}</p>
				<p>Remaining distance: {autoFeedback.data.remaining_distance}</p>
				<p>Update: {autoFeedback.data.update}</p>
				<p>Current Job: {autoFeedback.data.current_job}</p>
				<p>Warning: {autoFeedback.data.warning}</p>
			</>
		) || <p>No Core Autonomy</p>}
	</>;
}
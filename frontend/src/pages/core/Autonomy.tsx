import CoreDrivingFeedback from '../../components/core/CoreDrivingFeedback';
import MapComponent from '../../components/Map';
import CoreAutoFeedback from '../../components/core/CoreAutoFeedback';

export default function CoreAutonomyPage() {
	return <>
		<div className="container feedback">
			<CoreAutoFeedback />
			<CoreDrivingFeedback />

		</div>
		<div className="container autonomy">
			<MapComponent />
		</div>
	</>
}
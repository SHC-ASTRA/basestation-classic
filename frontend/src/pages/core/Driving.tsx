import CoreDrivingFeedback from '../../components/core/CoreDrivingFeedback';
import MapComponent from '../../components/Map';
import CoreDrivingControl from '../../components/core/CoreDrivingControl';
import { PTZControls } from '../../components/core/PtzControl';

export default function CoreDrivingPage() {
	return <>
		<div className="container feedback">
			<div className="horizontal-split">
				<CoreDrivingFeedback />
				<CoreDrivingControl />
			</div>
			<PTZControls />
		</div>
		<div className="container control">
			<MapComponent />
		</div>
	</>;
}
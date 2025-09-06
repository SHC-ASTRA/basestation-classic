import CitadelVoltages from '../../components/bio/CitadelVoltages';
import BioControl from '../../components/bio/BioControl';
import BioGimbal from '../../components/bio/BioGimbal';
import { ControlContainer, FeedbackContainer } from '../../components/MainContainers';

export default function ArmBioPage() {
	return <>
		<ControlContainer >
			<CitadelVoltages />
			<BioControl />
		</ControlContainer>
		<FeedbackContainer>
			<BioGimbal />
		</FeedbackContainer>
	</>
}
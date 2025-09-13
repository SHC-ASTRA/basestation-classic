import '../home/overlay.css'
import ControllerDisplay from "../../components/Controller";
export default function ArmOverlay() {
	return (<>
		<div className='overlay'>
			<ControllerDisplay />
			<div className="l-Div" style={{ top: "85%", right: "100%", rotate: "-25deg" }}>
				<a className="sideways" style={{ rotate: "25deg" }}>←Axis1→
					<p className="upright" style={{ bottom: "2.9em", right: "5.2em" }}>↑Ax s2↓</p>
				</a>
				<div className="r-Line" style={{ bottom: "88%", left: "100%", width: "100%" }} />
			</div>
			<div className="r-Div" style={{ bottom: "30%", left: "100%" }}>
				<div className="l-Line" style={{ right: "160%" }} />
				<p className="sideways">↑Axis1↓</p>
			</div>
			<span className="sectionHighlight">
				<div className="l-Div" style={{ right: "75%" }}>
					<div className="l-Line" style={{ right: "25px", rotate: "45deg", width: "100px" }} />
					<div className="l-Div" style={{ rotate: "45deg", right: "30px", bottom: "-25px" }}>
						<p className="sideways">Axis0</p>
					</div>
				</div>
			</span>
		</div >
	</>);
}
import { Outlet } from "react-router";
import { useNavigate } from "react-router";

export default function Home() {
	const navigate = useNavigate();
	return <>
		<div className='container feedback'>
			<button className="home-button" onClick={() => navigate("/home/arm")}>
				Arm
			</button>
			<button className="home-button" onClick={() => navigate("/home/core")}>
				Core
			</button>
			<div className="home-controller">
				<Outlet />
			</div>
		</div>
	</>;
}
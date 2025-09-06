import "../App.css"
import { useState } from 'react';
import { useLocation, useNavigate } from "react-router";
import { coreDrivingPath, armBioPath, armDigitPath, autonomyPath, debugPath, doomGamePath } from '../main.tsx';
import useWebSocketSetup from "../lib/webSocket.tsx";

function ImageBannerButton(props: { path: string, img: string, additionalClasses?: string }) {
	const navigate = useNavigate();
	const currentLocation = useLocation();

	return <button onClick={() => navigate(props.path)} className={`banner-button ${(currentLocation.pathname.includes(props.path)) && "banner-button-active"} ${props.additionalClasses}`}>
		<img src={props.img} alt="External Image" className="banner-button-image" />
	</button>
}

function BannerButton(props: { path: string, img: string, color?: string }) {
	const navigate = useNavigate();
	const currentLocation = useLocation();

	return <button onClick={() => navigate(props.path)} className={`banner-button ${(currentLocation.pathname == props.path) && "banner-button-active"}`}>
		<div style={{ maskImage: `url(${props.img})`, maskComposite: "subtract", maskRepeat: "no-repeat", maskSize: "100%" }}>
			<div className="banner-button-image" style={{ backgroundColor: props.color }} />
		</div>
	</button >
}

export default function Banner() {
	const [iconAdr, setIconAdr] = useState("/favicon.webp");
	const { readyState } = useWebSocketSetup();

	return <>
		<div className="banner">
			<button onClick={() => setIconAdr(iconAdr == '/favicon.webp' ? '../src/assets/serious.png' : '/favicon.webp')} className="lImg" >
				<img src={iconAdr} alt="Astra Logo" className="logo" />
			</button>

			<div style={{ flexGrow: 1 }}></div>

			<BannerButton path="/" img={"../src/assets/banner_icons/root.webp"} color={readyState === 1 ? undefined : "var(--red)"} />
			<BannerButton path={coreDrivingPath} img="../src/assets/banner_icons/rover.webp" />
			<BannerButton path={armBioPath} img="../src/assets/banner_icons/bio.webp" />
			<BannerButton path={armDigitPath} img="../src/assets/banner_icons/arm.webp" />
			<BannerButton path={autonomyPath} img="../src/assets/banner_icons/autonomy.webp" />
			<BannerButton path={debugPath} img="../src/assets/banner_icons/debug.webp" />
			<ImageBannerButton path={doomGamePath} img="../src/assets/banner_icons/doom.webp" additionalClasses="hidden doom" />

			<div style={{ flexGrow: 1 }}></div>

			<div className="clucky" onClick={() => { document.querySelector(".doom")?.classList.toggle("hidden"); }} >
				<img className="clucky-image" src="../src/assets/clucky.png" alt="Clucky!" />
			</div>
		</div>
	</>
}
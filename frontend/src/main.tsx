import App from './App.tsx';
import { createContext, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router";
import ArmBioPage from './pages/arm/Bio.tsx';
import ArmDigitPage from './pages/arm/Digit.tsx';
import CoreDrivingPage from './pages/core/Driving.tsx';
import DebugPage from './pages/Debug.tsx';
import CoreAutonomyPage from './pages/core/Autonomy.tsx';
import BSDooM from './components/BSDooM.tsx';
import Home from './pages/home/Home.tsx';
import ArmOverlay from './pages/home/ArmOverlay.tsx';
import { Redirect } from './pages/Redirect.tsx';

export const coreDrivingPath = "/core/driving";
export const coreFeedbackPath = "/core/feedback";
export const armBioPath = "/arm/bio";
export const armDigitPath = "/arm/digit";
export const autonomyPath = "/autonomy";
export const debugPath = "/debug";
export const doomGamePath = "/doom";

createContext({});

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route element={<App />}>
					<Route path="/" element={<Home />} >
						<Route index path="/home/arm" element={<ArmOverlay />} />
						<Route path="/home/core" element={<Home />} />
					</Route>
					<Route path="/redirect" element={<Redirect to="http://localhost:8080" />} />
					<Route path={armBioPath} element={<ArmBioPage />} />
					<Route path={armDigitPath} element={<ArmDigitPage />} />
					<Route path={coreDrivingPath} element={<CoreDrivingPage />} />
					<Route path={autonomyPath} element={<CoreAutonomyPage />} />

					<Route path={debugPath} element={<DebugPage />} />
					<Route path={doomGamePath} element={<BSDooM />} />
				</Route>
			</Routes>
		</BrowserRouter>
	</StrictMode>
)
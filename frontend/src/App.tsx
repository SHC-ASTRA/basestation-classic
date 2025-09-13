import { Outlet } from 'react-router';
import './App.css'
import Banner from './components/Banner';
import GamepadProvider from './lib/gamepad';
import { ErrorBoundary } from 'react-error-boundary';

export default function App() {
	return <>
		<GamepadProvider>
			<div className="basestation">
				<Banner />
				<div className="display horizontal-split">
					<ErrorBoundary fallback={<p>Something went wrong! Check the console for more details.</p>}>
						<Outlet />
					</ErrorBoundary>
				</div>
			</div>
		</GamepadProvider>
	</>;
}
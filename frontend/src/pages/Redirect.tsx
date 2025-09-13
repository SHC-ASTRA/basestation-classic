export function Redirect({ to }: { to: string }) {
    window.location.href = to;

    return (
        <div className="container feedback">
            <h1>Redirecting...</h1>
            <p>If you are not redirected, click below.</p>
            <button className="home-button" onClick={() => {
                window.location.href = to;
            }}>
                Go to {to}
            </button>
        </div>
    );
}
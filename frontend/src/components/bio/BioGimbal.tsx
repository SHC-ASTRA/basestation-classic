import useWebSocketSetup from "../../lib/webSocket";

function Readouts() {
    const { coreFeedback, bioFeedback } = useWebSocketSetup();

    return <>
        <div className="horizontal-split">
            <div className="vertical-split container">
                <h2>GNSS</h2>
                <div className="vertical-split">
                    <h3>
                        Latitude:&nbsp;
                        <span>{coreFeedback ? coreFeedback.data.gps_lat.toFixed(7) : "no data"}&nbsp;&deg;N</span>
                    </h3>
                    <h3>
                        Longitude:&nbsp;
                        <span>{coreFeedback ? coreFeedback.data.gps_long.toFixed(7) : "no data"}&nbsp;&deg;E</span>
                    </h3>
                </div>
            </div>
            <div className="vertical-split container">
                <h2>Altitude</h2>
                <h3>{coreFeedback ? coreFeedback.data.gps_alt : "no data"}&nbsp;m</h3>
            </div>
        </div>
        <div className="horizontal-split">
            <div className="vertical-split container">
                <h2>Temperature</h2>
                <h3>
                    {bioFeedback ? bioFeedback.data.drill_temp.toFixed(1) : "no data"}&nbsp;&deg;C
                </h3>
            </div>
            <div className="vertical-split container">
                <h2>Humidity</h2>
                <h3>{bioFeedback ? bioFeedback.data.drill_humidity.toFixed(1) : "no data"}&nbsp;%</h3>
            </div>
        </div>
    </>
}

export default function BioGimbal() {

    return <>
        {/* put the gnss & the altitude */}
        <div className="vertical-split">
            <Readouts />
        </div>
    </>;
}
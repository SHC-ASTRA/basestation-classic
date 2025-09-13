import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { AutoFeedbackData, CoreFeedbackData, DigitFeedbackData, BioFeedbackData, SocketFeedbackData, WebSocketData, AntennaFeedbackData } from "./types";

/**
 * Custom hook to setup the websocket connection and handle incoming messages. Doing it this way makes
 * it so that dependent components only update when the data they care about changes.
 * 
 * @returns an object with the websocket connection state a function to send messages and the feedback data (split into different types)
 */
export default function useWebSocketSetup() {
    // storing data in state to trigger re-renders
    const [autoFeedback, setAutoFeedback] = useState<null | AutoFeedbackData>(null);
    const [coreFeedback, setCoreFeedback] = useState<null | CoreFeedbackData>(null);
    const [digitFeedback, setDigitFeedback] = useState<null | DigitFeedbackData>(null);
    const [bioFeedback, setBioFeedback] = useState<null | BioFeedbackData>(null);
    const [socketFeedback, setSocketFeedback] = useState<null | SocketFeedbackData>(null);
    const [antennaFeedback, setAntennaFeedback] = useState<null | AntennaFeedbackData>(null);
    const [lastUpdate, setLastUpdate] = useState<null | number>(null);

    // determine the websocket url based on the current url
    const host = window.location.host;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${host}/api/ws`;

    // use the react-use-websocket hook to handle the websocket connection
    const { sendMessage, lastMessage, readyState } = useWebSocket(
        url, {
        shouldReconnect: (closeEvent) => {
            console.log("websocket closed: ", closeEvent.reason);
            return true;
        }
    });

    // do a thing when lastMessage changes (when we get a websocket message)
    useEffect(() => {
        // make sure we actually have a message
        if (lastMessage !== null) {
            // parse the data from the message
            let data: WebSocketData;
            try {
                data = JSON.parse(lastMessage.data);
            } catch (e: unknown) {
                console.error(e);
                console.log(lastMessage.data)
                return;
            }
            setLastUpdate(data.timestamp);

            // put the data in the right place based on the type
            switch (data.type) {
                case '/auto/feedback':
                    setAutoFeedback(data as AutoFeedbackData);
                    break;
                case '/core/feedback':
                    setCoreFeedback(data as CoreFeedbackData);
                    break;
                case '/bio/feedback':
                    setBioFeedback(data as BioFeedbackData);
                    break;
                case '/arm/feedback/digit':
                    setDigitFeedback(data as DigitFeedbackData);
                    break;
                case '/arm/feedback/socket':
                    setSocketFeedback(data as SocketFeedbackData);
                    break;
                case 'antenna/feedback':
                    setAntennaFeedback(data as AntennaFeedbackData);
            }
        }
    }, [lastMessage]);

    // return the data and the function to send messages
    // each of the feedback types is returned separately so that components can choose which ones they want to use
    return {
        sendMessage,
        readyState,
        autoFeedback,
        coreFeedback,
        digitFeedback,
        bioFeedback,
        socketFeedback,
        antennaFeedback,
        lastUpdate,
    };
}

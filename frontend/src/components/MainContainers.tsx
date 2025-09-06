export function ControlContainer(props: React.PropsWithChildren) {
    return <div className="container control">
        {props.children}
    </div>
}

export function FeedbackContainer(props: React.PropsWithChildren) {
    return <div className="container feedback">
        {props.children}
    </div>
}
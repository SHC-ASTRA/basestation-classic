export default function GradientIndicator({ className, scale, value, color, direction }: { className?: string, scale?: number, value: number, color: string, direction?: string }) {
    const lowerPercentage = (value < 0 ? (1 + value / (scale ?? 1)) : 1) * 50;
    const upperPercentage = (value > 0 ? (1 + value / (scale ?? 1)) : 1) * 50;

    return <div className={"gradient-indicator " + (className ?? "")} style={{
        background: `linear-gradient(${direction ?? "to right"}, transparent 0%, transparent ${lowerPercentage}%, ${color} ${lowerPercentage}%, ${color} ${upperPercentage}%, transparent ${upperPercentage}%, transparent 100%)`, height: "100%"
    }}>
    </div>;
}
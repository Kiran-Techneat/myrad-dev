interface CardProgressProps {
    value: number | 'done' | 'error' | 'reading' | 'completing' | undefined
}

const CardProgress = ({ value }: CardProgressProps) => {
    if (value === undefined) return null
    const isDone = value === 'done'
    const isError = value === 'error'
    const isReading = value === 'reading'
    const isCompleting = value === 'completing'
    const pct = isDone || isError || isCompleting ? 100 : isReading ? 0 : (value as number)
    const cls = isDone ? 'done' : isError ? 'error' : isCompleting ? 'completing' : ''

    return (
        <div className={`sc-prog ${cls}`}>
            <i style={{ width: `${pct}%` }} />
        </div>
    )
}

export default CardProgress

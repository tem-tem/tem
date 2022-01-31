const KeystrokeData = ({ availableKeystrokes }) => {
    let os = availableKeystrokes?.Windows && 'Windows';
    if (availableKeystrokes?.Mac) os = availableKeystrokes?.Mac && 'Mac';
    const browsers = ['Chrome', 'Safari'];
    return (
        <div className="keystroke-description">
            {browsers.map((b) => {
                if (availableKeystrokes?.[b]) {
                    return <div className="message">{`${b} (${os}): ${availableKeystrokes[b]}`}</div>;
                }
            })}
        </div>
    );
};

export default KeystrokeData;

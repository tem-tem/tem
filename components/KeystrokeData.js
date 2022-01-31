import { BROWSERS } from './Keys';

const KeystrokeData = ({ availableKeystrokes }) => {
    let os = availableKeystrokes?.Windows && 'Windows';
    if (availableKeystrokes?.Mac) os = availableKeystrokes?.Mac && 'Mac';
    return (
        <div className="keystroke-description">
            {BROWSERS.map((b) => {
                if (availableKeystrokes?.[b]) {
                    return <div className="message">{`${b} (${os}): ${availableKeystrokes[b]}`}</div>;
                }
            })}
        </div>
    );
};

export default KeystrokeData;

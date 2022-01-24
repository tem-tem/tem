import keystrokes from '../utils/keystrokes.json';

const KeysPresentation = ({ pressedKey }) => {
    const pressedKeys = [];
    let done = false;
    if (pressedKey.metaKey) pressedKeys.push('Meta');
    if (pressedKey.ctrlKey) pressedKeys.push('Ctrl');
    if (pressedKey.altKey) pressedKeys.push('Alt');
    if (pressedKey.shiftKey) pressedKeys.push('Shift');

    let availableKeystrokes = keystrokes;
    pressedKeys.map((optKey) => {
        availableKeystrokes = availableKeystrokes?.[optKey];
    });

    if (!['Ctrl', 'Meta', 'Alt', 'Shift', 'Control'].includes(pressedKey.key)) {
        if (Number(pressedKey?.keyCode) > 64 && Number(pressedKey?.keyCode) < 91) {
            const letterKey = String.fromCharCode(pressedKey?.keyCode)?.toLocaleLowerCase();
            pressedKeys.push(letterKey);
            availableKeystrokes = availableKeystrokes?.[letterKey];
        } else {
            pressedKeys.push(pressedKey.key?.toLocaleLowerCase());
            availableKeystrokes = availableKeystrokes?.[pressedKey.key?.toLocaleLowerCase()];
        }
        done = true;
    }

    const isKeystroke =
        availableKeystrokes?.Chrome ||
        availableKeystrokes?.Mac ||
        availableKeystrokes?.desc ||
        availableKeystrokes?.Windows;
    const available = !isKeystroke && pressedKeys.length > 1 && done;

    const getKeyDisplay = (key) => {
        if (key === 'arrowleft') return '←';
        if (key === 'arrowright') return '→';
        if (key === 'arrowup') return '↑';
        if (key === 'arrowdown') return '↓';
        return key;
    };

    const getNextKeys = () => {
        const availableKeystrokeKeys = Object.keys(availableKeystrokes || {});
        const shift = pressedKeys.length * 80 + pressedKeys.length * 20;
        return (
            <div className="next-keys-container">
                {availableKeystrokeKeys.map((key) => {
                    return (
                        <div className="next-key" key={`ak-${key}`} style={{ marginLeft: shift }}>
                            <div className="key-button">{getKeyDisplay(key)}</div>
                            {/* <div>{JSON.stringify(availableKeystrokes[key])}</div> */}
                        </div>
                    );
                })}
            </div>
        );
    };

    const getKeystrokeData = () => {
        let os = availableKeystrokes?.Windows && 'Windows';
        if (availableKeystrokes?.Mac) os = availableKeystrokes?.Mac && 'Mac';
        return (
            <div className="keystroke-description">
                <div className="message">
                    Chrome ({os}): {availableKeystrokes?.Chrome}
                </div>
            </div>
        );
    };

    const getAvailableMessage = () => {
        return (
            <div className="keystroke-description">
                <div className="green-message">The keystroke is available.</div>
            </div>
        );
    };

    return (
        <div className="keys-presentation-container">
            <div className="keystroke-description">
                <div className="green-message">
                    Press a keystroke to check its availability (currently only for chrome keystrokes).
                </div>
            </div>
            <div className={`keys-container ${available && 'available'}`}>
                {Object.keys(pressedKey || {})?.length !== 0 &&
                    pressedKeys.map((key) => {
                        return (
                            <span key={key} className="key-button">
                                {getKeyDisplay(key)?.toLowerCase()}
                            </span>
                        );
                    })}
            </div>
            <div>{!isKeystroke && getNextKeys()}</div>
            <div>{isKeystroke && getKeystrokeData()}</div>
            <div>{!isKeystroke && available && getAvailableMessage()}</div>
        </div>
    );
};

export default KeysPresentation;

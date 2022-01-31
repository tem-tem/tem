import keystrokes from '../utils/keystrokes.json';
import KeystrokeData from './KeystrokeData';
import KeySuggestions from './KeySuggestions';

export const getKeyDisplay = (key) => {
    if (key === 'arrowleft') return '←';
    if (key === 'arrowright') return '→';
    if (key === 'arrowup') return '↑';
    if (key === 'arrowdown') return '↓';
    return key;
};

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
            <div>
                {!isKeystroke && <KeySuggestions availableKeystrokes={availableKeystrokes} pressedKeys={pressedKeys} />}
            </div>
            <div>{isKeystroke && <KeystrokeData availableKeystrokes={availableKeystrokes} />}</div>
            <div>{!isKeystroke && available && getAvailableMessage()}</div>
        </div>
    );
};

export default KeysPresentation;

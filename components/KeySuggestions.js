import { getKeyDisplay } from './KeysPresentation';

const KeySuggestions = ({ availableKeystrokes, pressedKeys }) => {
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

export default KeySuggestions;

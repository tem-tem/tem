import keystrokes from '../utils/keystrokes.json';

const KeysPresentation = ({ pressedKey }) => {
    console.log('pressedKeu', pressedKey);
    const options = [];
    let keystrokeDesc = keystrokes;
    if (pressedKey.ctrlKey) options.push('Ctrl');
    if (pressedKey.metaKey) options.push('Meta');
    if (pressedKey.altKey) options.push('Alt');
    if (pressedKey.shiftKey) options.push('Shift');
    options.map((optKey) => {
        keystrokeDesc = keystrokeDesc?.[optKey];
        // console.log('keystrokeDesc', keystrokeDesc);
    });

    // console.log('keystrokeDesc', pressedKey?.key?.toLowerCase(), letterKey);

    if (!['Ctrl', 'Meta', 'Alt', 'Shift'].includes(pressedKey.key)) {
        const letterKey = String.fromCharCode(pressedKey?.keyCode)?.toLocaleLowerCase();

        if (letterKey) {
            options.push(letterKey);
            keystrokeDesc = keystrokeDesc?.[letterKey];
        } else {
            options.push(pressedKey.key);
            keystrokeDesc = keystrokeDesc?.[pressedKey.key];
        }
    }

    const pressedKeyStroke = options.join(' + ');

    return (
        <div>
            <div>
                {pressedKeyStroke}: {keystrokeDesc?.desc ? JSON.stringify(keystrokeDesc) : ''}
            </div>
        </div>
    );
};

export default KeysPresentation;

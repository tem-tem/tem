const KeysPresentation = ({ pressedKey }) => {
    // console.log('pressedKeu', pressedKey);
    const options = [];
    if (pressedKey.ctrlKey) options.push('Control');
    if (pressedKey.metaKey) options.push('Meta');
    if (pressedKey.altKey) options.push('Alt');
    if (pressedKey.shiftKey) options.push('Shift');
    if (!['Control', 'Alt', 'Meta', 'Shift'].includes(pressedKey.key)) options.push(pressedKey.key);

    return <div>{options.join(' + ')}</div>;
};

export default KeysPresentation;

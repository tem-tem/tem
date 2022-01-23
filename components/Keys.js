import { useState } from 'react';
import KeysPresentation from './KeysPresentation';
// import hotkeys from 'hotkeys-js';
import { useHotkeys } from 'react-hotkeys-hook';

const Keys = () => {
    const [active, setActive] = useState({});
    const handleKey = (keyData) => {
        setActive(keyData);
    };
    useHotkeys('*', handleKey);

    return <KeysPresentation pressedKey={active} />;
};

export default Keys;

import { useState } from 'react';
import KeysPresentation from './KeysPresentation';
import { useHotkeys } from 'react-hotkeys-hook';

export const BROWSERS = ['Chrome', 'Safari'];
const Keys = () => {
    const [active, setActive] = useState({});
    const handleKey = (keyData) => {
        keyData.preventDefault();
        setActive(keyData);
    };
    useHotkeys('*', handleKey, { filterPreventDefault: true });

    return <KeysPresentation pressedKey={active} />;
};

export default Keys;

import { getKeyDisplay } from './KeysPresentation';
// import Image from 'next/image';
// import { BROWSERS } from './Keys';

const KeySuggestions = ({ availableKeystrokes, pressedKeys }) => {
    const availableKeystrokeKeys = Object.keys(availableKeystrokes || {});
    const shift = pressedKeys.length * 80 + pressedKeys.length * 20;

    // const getBrowsers = (obj) => {
    //     if (!obj) return <div>...</div>;
    //     return (
    //         <div className="browsers">
    //             {BROWSERS.map((b) => {
    //                 if (obj?.[b]?.length) {
    //                     return <Image src={`/${b}.png`} alt={b} width="20px" height="20px" />;
    //                 }
    //             })}
    //         </div>
    //     );
    // };

    return (
        <div className="next-keys-container">
            {availableKeystrokeKeys.map((key) => {
                return (
                    <div className="next-key" key={`ak-${key}`} style={{ marginLeft: shift }}>
                        <div className="key-button">{getKeyDisplay(key)?.toUpperCase()}</div>
                        {/* <div>{getBrowsers(availableKeystrokes[key])}</div> */}
                    </div>
                );
            })}
        </div>
    );
};

export default KeySuggestions;

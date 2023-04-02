import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import indexStyles from '../styles/index.module.css';
import useD3 from '../src/hooks/useD3';

export default function Home() {
    const photos = [
        // 'https://d2w9rnfcy7mm78.cloudfront.net/17185727/original_e1300e1b2c3c999b2f85b0e67d40b251.jpg?1657649516?bc=0',
        'https://d2w9rnfcy7mm78.cloudfront.net/17185808/original_4f8ddf4924c99595dc1b8883b5333993.jpg?1657649543?bc=0'
    ];

    function getRandomPhoto() {
        return photos[Math.floor(Math.random() * photos.length)];
    }
    function generateBackgroundStyle() {
        const photo = getRandomPhoto();
        return {
            background: `url(${photo})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        };
    }
    // useD3();
    return (
        <>
            <div className={indexStyles.background} style={generateBackgroundStyle()}></div>
            <section className={indexStyles.sectionWrapper}>
                <h1>
                    <span className={indexStyles.textBG}>
                        tem ab - software engineer <a rel="noreferrer" href='https://twitter.com/bedrockcomputer' target='_blank'>@bedrockcomputer</a>
                    </span>
                </h1>
                <article>
                    <h2>
                        <span className={indexStyles.textBG}>
                            links
                        </span>
                    </h2>
                    <ul>
                        <li>
                            
                    <span className={indexStyles.textBG}>
                            <a rel="noreferrer" href='https://github.com/tem-tem'>@github</a>
                    </span>
                        </li>
                        <li>
                    <span className={indexStyles.textBG}>
                            <a rel="noreferrer" href='https://twitter.com/tttteeeemmmm'>@twitter</a>
                    </span>
                        </li>
                    </ul>
                </article>
                <article>
                    <h2>
                    <span className={indexStyles.textBG}>
                    side projects
                    </span>
                    </h2>
                    <ul>
                        <li>
                    <span className={indexStyles.textBG}>
                            <a rel="noreferrer" href='https://defaultshortcuts.com' target='_blank'>defaultshortcuts</a>  - browser default shortcuts look up
                    </span>
                        </li>
                        <li>
                    <span className={indexStyles.textBG}>
                            <a rel="noreferrer" href='https://www.google.com/url?q=https%3A%2F%2Fapps.apple.com%2Fus%2Fapp%2Flogs-pure-expense-tracker%2Fid6445955890&sa=D&sntz=1&usg=AOvVaw2-V019ktERWM_I6klZQVbP' target='_blank'>logs</a> - expense logger for ios
                    </span>
                        </li>
                        <li>
                    <span className={indexStyles.textBG}>
                            <a rel="noreferrer" href='https://apps.apple.com/us/app/stop-working-back-hurts/id6446755293?mt=12' target='_blank'>stop working</a> - pomodoro timer for mac
                    </span>
                        </li>
                    </ul>
                </article>
                <article>
                    <h3>
                    <span className={indexStyles.textBG}>
                    other
                    </span>
                    </h3>
                    <ul>
                        <li>
                    <span className={indexStyles.textBG}>
                            <a rel="noreferrer" href='https://www.behance.net/12tem' target='_blank'>behance</a> - visual design experiments
                    </span>
                        </li>
                        <li>
                    <span className={indexStyles.textBG}>
                            <a rel="noreferrer" href='https://www.are.na/tem-ab' target='_blank'>are.na</a> - photography
                    </span>
                        </li>
                    </ul>
                </article>
                
            </section>
        </>
    );
}

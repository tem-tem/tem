import indexStyles from '../styles/index.module.css';

const projects = [
    {
        title: "Default Shortcuts",
        link: "https://defaultshortcuts.com",
        description: "List of major browsers' default shortcuts.",
        tools: [
            "python",
            "svelte",
            "typescript"
        ],
        platform: "Web"
    },
    {
        title: "Stop Working",
        link: "https://apps.apple.com/us/app/stop-working-break-reminder/id6446755293?mt=12",
        description: "Break reminder (pomodoro timer with good UI).",
        tools: [
            "swift",
            "swiftui",
            "appkit"
        ],
        platform: "MacOS"
    },
    {
        title: "Gas",
        link: "https://apps.apple.com/us/app/gas-eth-alerts/id6446234870",
        description: "Ethereum gas price alerts.",
        tools: [
            "flask",
            "redis",
            "python",
            "swift",
            "swift ui"
        ],
        platform: "iOS"
    },
    {
        title: "Logs",
        link: "https://apps.apple.com/us/app/logs-pure-expense-tracker/id6445955890",
        description: "Expense logger with rapid UX (works offline).",
        tools: [
            "swift",
            "swift ui"
        ],
        platform: "iOS"
    },
]


export default function Home() {
    // useD3();
    return (
        <>
            <section className={indexStyles.sectionWrapper}>
                <h1>
                    <span className={indexStyles.textBG}>
                        Tem Ab - Software Engineer <a rel="noreferrer" href='https://twitter.com/bedrockcomputer' target='_blank'>@bedrockcomputer</a>
                    </span>
                </h1>

                <article>
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
                    <h3>
                        <span className={indexStyles.textBG}>
                            Projects
                        </span>
                    </h3>
                    <div className={indexStyles.projects}>
                        {
                            projects.map(p => (
                                <div className={indexStyles.project}>
                                    <div className={indexStyles.projectTitle}>
                                        <a rel="noreferrer" href={p.link}>{p.title}</a>
                                        <span>{p.description}</span>
                                    </div>
                                    <div className={indexStyles.projectMetadata}>
                                        <span className={indexStyles.projectTools}>
                                            Tech stack: {p.tools.map(t => (<span>{t}</span>))}
                                        </span>
                                        <span className={indexStyles.projectPlatform}>
                                            Platform: <span>{p.platform}</span>
                                        </span>
                                    </div>
                                </div>
                            ))
                        }

                    </div>
                </article>




                {/* <article>
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
                </article> */}
                
            </section>
        </>
    );
}

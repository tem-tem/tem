import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import useD3 from '../src/hooks/useD3';

export default function Home() {
    useD3();
    return <div />;
}

import styles from "../styles/Home.module.css";
import Head from "next/head";
import Link from "next/link";
import {useRouter} from "next/router";


export default function Layout({children}) {
    const router = useRouter();
    return (
        <>
            <Link href="/">Home</Link>
            <br/>
            <Link href="/about">About</Link>
            <br/>
            <Link href={{
                pathname: '/course/[courseId]',
                query: {a: 1, courseId: 'course123'}
            }}>Course 1</Link>
            <br/>
            <a href="/" onClick={e => {
                e.preventDefault();
                router.push('/course/[courseId]', '/course/course456');
            }}>Course 2</a>
            <br/>
            <a href="/" onClick={e => {
                e.preventDefault();
                router.push({
                    pathname: '/course/[courseId]',
                    query: {
                        courseId: 'course789',
                        asd: 1
                    }
                });
            }}>Course 3</a>
            <br/>

            <button onClick={() => router.push('/course/button')}>go to course</button>
            <div className={styles.container}>
                <Head>
                    <title>Create Next App</title>
                    <link rel="icon" href="/favicon.ico"/>
                </Head>

                {children}
            </div>
        </>
    )
}

import {useRouter} from "next/router";
import Layout from "../../components/layout";
import fetch from 'node-fetch';



export default function Course(props) {
    const router = useRouter();
    console.log(router, props);
    const {query: {courseId}} = router;
    return (
        <Layout>
            <h1>{courseId}</h1>
        </Layout>
    )
}

Course.getInitialProps = async(...params) => {
    console.log(params);
    const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
    const data = await response.json();
    return {
        props: {
            data
        }
    }
};

import Layout from "../components/layout";


export default function About(props) {
    console.log(props);
    return (
        <Layout>
            <h1>About</h1>
        </Layout>
    )
}

About.getInitialProps = async({req}) => {
    return {
        props: {
            a: 1,
            b: req.asd
        }
    }
};

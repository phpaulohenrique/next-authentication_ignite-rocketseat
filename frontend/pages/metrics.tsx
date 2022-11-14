import { withSSRAuth } from "../utils/withSSRAuth";
import { setupAPIClient } from "../services/api";
import { Can } from "../components/Can";

export default function Metrics() {


    return (
        <>
            <h1>Metrics</h1>

            <Can permissions={["metrics.list"]}>
                <div>Metrics</div>
            </Can>
        </>
    );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
    const apiClient = setupAPIClient(ctx);
    const response = await apiClient.get("/me");


    return {
        props: {},
    };
}, {
    permissions: ['metrics.lidst'],
    roles: ['administrator']
})

import { parseCookies } from "nookies";
import { useContext, useEffect } from "react"
import { withSSRAuth } from "../utils/withSSRAuth";
import { AuthContext } from "../contexts/AuthContext"
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { useCan } from "../hooks/useCan";
import { Can } from "../components/Can";



export default function Dashboard(){

    const {user, signOut} = useContext(AuthContext)

    const userCanSeeMetrics = useCan({
        roles: ["editor", "administrator"],
    });


    useEffect(() => {
        const { "nextauth.token": token } = parseCookies();

        if (token) {
            api.get("/me").then((response) => {
                // console.log(response)

            }).catch((err) => console.log(err))
        }
    }, []);

    // console.log(user)

    return (
        <>
            <h1>Dashboard: {user?.email}</h1>

            <Can permissions={['metrics.list']}>
                <div>Metrics</div>

                <button onClick={signOut}>Sair</button>

            </Can>
        </>
    );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {

    const apiClient = setupAPIClient(ctx)
    const response = await apiClient.get("/me");

    // console.log('------------------------x---------------------')
    // console.log(response.data)
        

    return{
        props:{}
    }
})

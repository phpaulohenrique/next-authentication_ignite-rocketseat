import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { withSSRGuest } from "../utils/withSSRGuest";
import { FormEvent, useContext, useState } from "react"
import { AuthContext } from "../contexts/AuthContext";

import styles from './Home.module.scss'

export default function Home() {

    const [email, setEmail] = useState('diego@rocketseat.team')
    const [password, setPassword] = useState('123456');

    const {signIn} = useContext(AuthContext)


    const handleSignIn = async (event: FormEvent) => {

        event.preventDefault();

        const data = {
            email,
            password
        }

        signIn(data);
    }

    return (
        <div className={styles.container}>
            <form onSubmit={handleSignIn}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    
                />

                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Entrar</button>
            </form>
        </div>
    );

}

export const getServerSideProps = withSSRGuest(async (ctx) => {

    return{
        props:{

        }
    }
})



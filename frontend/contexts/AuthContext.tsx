import Router from "next/router";
import { createContext, ReactNode, useEffect, useState } from "react";
import { setCookie, parseCookies, destroyCookie } from "nookies";

import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";

type User = {
    email: string;
    permissions: string[];
    roles: string[];
};

type SignInCredentials = {
    email: string;
    password: string;
};

type AuthContextData = {
    signIn: (credentials: SignInCredentials) => Promise<void>;
    signOut: () => void;
    isAuthenticated: boolean;
    user: User | undefined;
};

type AuthProviderProps = {
    children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

let authChannel: BroadcastChannel

export function signOut(){
    destroyCookie(undefined, "nextauth.token");
    destroyCookie(undefined, "nextauth.refreshToken");

    authChannel.postMessage('signOut')

    Router.push("/");
}



export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User>();
    const isAuthenticated = !!user;

    useEffect(() => {

        authChannel = new BroadcastChannel("auth");

        authChannel.onmessage = (message) => {
            // console.log(message);
            switch(message.data){
                case 'signOut':
                    Router.push("/");
                    break;
                default:
                    break;
            }
        }
    }, [])

    useEffect(() => {
        const { "nextauth.token": token } = parseCookies();

        if (token) {
            api.get("/me").then((response) => {
                // console.log(response)

                const { email, permissions, roles } = response?.data;

                setUser({ email, permissions, roles });
            }).catch(() => {
                signOut()
            })
        }
    }, [])




    async function signIn({ email, password }: SignInCredentials) {
        // console.log(email, password)

        try {
            const response = await api.post("/sessions", {
                email,
                password,
            });

            const { token, refreshToken, permissions, roles } = response?.data;

            setCookie(undefined, "nextauth.token", token, {
                maxAge: 60 * 60 * 24 * 30,
                path: "/",
            });

            setCookie(undefined, "nextauth.refreshToken", refreshToken, {
                maxAge: 60 * 60 * 24 * 30,
                path: "/",
            });

            setUser({ email, permissions, roles });
            // console.log(response.data);

            api.defaults.headers["Authorization"] = `Bearer ${token}`;

            Router.push("/dashboard");
        } catch (error) {
            // console.log(erro)
        }
    }

    return (
        <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, user }}>
            {children}
        </AuthContext.Provider>
    );
}

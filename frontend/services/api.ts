import { AuthTokenError } from './errors/AuthTokenError';
import { parseCookies, setCookie } from "nookies";
import axios, { AxiosError } from "axios";
import { signOut } from "../contexts/AuthContext";

let isRefreshing = false;
let failedRequestQueue = [];

interface AxiosErrorResponse {
    code?: string;
}

export function setupAPIClient(ctx = undefined){

    let cookies = parseCookies(ctx);


    const api = axios.create({
        baseURL: "http://localhost:3333",
        // headers: {
        //     Authorization: `Bearer ${cookies["nextauth.token"]}`,
        // },
    });

    api.defaults.headers.common.Authorization = `Bearer ${cookies["nextauth.token"]}`;

    api.interceptors.response.use(
        (response) => {
            return response;
        },
        (error: AxiosError<AxiosErrorResponse>) => {
            // console.log(error);

            if (error.response?.status === 401) {
                if (error.response?.data?.code === "token.expired") {
                    cookies = parseCookies(ctx);

                    const { "nextauth.refreshToken": refreshToken } = cookies;
                    const originalConfig = error.config;

                    if (!isRefreshing) {
                        isRefreshing = true;

                        api.post("/refresh", {
                            refreshToken,
                        })
                            .then((response) => {
                                const { token } = response.data;

                                setCookie(ctx, "nextauth.token", token, {
                                    maxAge: 60 * 60 * 24 * 30, // 30 days
                                    path: "/",
                                });
                                setCookie(
                                    ctx,
                                    "nextauth.refreshToken",
                                    response.data.refreshToken,
                                    {
                                        maxAge: 60 * 60 * 24 * 30, // 30 days
                                        path: "/",
                                    }
                                );

                                api.defaults.headers.common.Authorization = `Bearer ${token}`;
                                // api.defaults.headers[
                                //     "Authorization"
                                // ] = `Bearer ${token}`

                                failedRequestQueue.forEach((request) =>
                                    request.onSuccess(token)
                                );
                                failedRequestQueue = [];
                            })
                            .catch((error) => {
                                failedRequestQueue.forEach((request) =>
                                    request.onError(error)
                                );
                                failedRequestQueue = [];

                                if (typeof window !== "undefined") {
                                    signOut();
                                }
                            })
                            .finally(() => {
                                isRefreshing = false;
                            });
                    }

                    return new Promise((resolve, reject) => {
                        failedRequestQueue.push({
                            onSuccess: (token: string) => {
                                if (!originalConfig?.headers) {
                                    return;
                                }
                                originalConfig.headers.Authorization = `Bearer ${token}`;
                                // originalConfig.headers["Authorization"] = `Bearer ${token}`;
                                resolve(api(originalConfig));
                            },
                            onError: (err: AxiosError) => {
                                reject(err);
                            },
                        });
                    });
                } else {
                    if (typeof window !== "undefined") {
                        signOut();
                    }else{
                        return Promise.reject(new AuthTokenError())
                    }
                }
            }

            return Promise.reject(error);
        }
    );


    return api
}
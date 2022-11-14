import jwtDecode from 'jwt-decode'
import {GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult} from 'next'
import { destroyCookie, parseCookies } from 'nookies'
import { AuthTokenError } from '../services/errors/AuthTokenError'
import { validateUserPermissions } from './validateUserPermissions'

type WithSSRAuthOptions = {
    permissions?: string[];
    roles?: string[]
}

export function withSSRAuth<P>(fn: GetServerSideProps<P>, options?: WithSSRAuthOptions){

    return async(ctx:GetServerSidePropsContext):Promise<GetServerSidePropsResult<P>> => {
        // console.log(ctx.req.cookies)

        const cookies = parseCookies(ctx)
        const token = cookies['nextauth.token']

        if (!token) {
            return {
                redirect: {
                    destination: "/",
                    permanent: false,
                },
            };
        }


        if(options){

            const user = jwtDecode<{permissions: string[], roles: string[]}>(token)
            
            // console.log(user);

            const { permissions, roles } = options;

            const userHasValidPermissions = validateUserPermissions({
                user,
                permissions,
                roles,
            });

            if(!userHasValidPermissions){
                return{
                    redirect: {
                        destination: '/dashboard', // redirect to a page that all users have access
                        permanent: false,
                    }
                }
            }

        }



        try {
            return await fn(ctx)
            
        } catch (err) {

            if(err instanceof AuthTokenError){
                
                destroyCookie(ctx, "nextauth.token");
                destroyCookie(ctx, "nextauth.refreshToken");
    
                return {
                    redirect: {
                        destination: "/",
                        permanent: false,
                    },
                }

            }
            
            return {
                redirect: {
                destination: '/error', // Em caso de um erro não esperado, você pode redirecionar para uma página publica de erro genérico
                permanent: false
                }
            }

        }

    }

}
import {GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult} from 'next'
import { parseCookies } from 'nookies'


// the pages 

export function withSSRGuest<P>(fn: GetServerSideProps<P>){

    return async(ctx:GetServerSidePropsContext):Promise<GetServerSidePropsResult<P>> => {
        // console.log(ctx.req.cookies)

        const cookies = parseCookies(ctx)

        if(cookies['nextauth.token']){
            return{
                redirect: {
                    destination: '/dashboard',
                    permanent: false,
                }
            }
        }

        return await fn(ctx)
    }

}
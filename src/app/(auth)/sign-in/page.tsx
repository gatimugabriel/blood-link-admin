import React, {Suspense} from 'react'
import AuthForm from '@/components/AuthForm'

export default function page() {
    return (
        <Suspense>
            <AuthForm type="sign-in"/>
        </Suspense>
    )
}

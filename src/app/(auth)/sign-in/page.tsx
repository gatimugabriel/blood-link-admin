import React, { Suspense } from 'react'
import AuthForm from '@/components/AuthForm'
import { PageLoading } from '@/components/page-loading'

export default function SignInPage() {
    return (
        <Suspense fallback={<PageLoading message="Loading sign-in..." />}>
            <AuthForm type="sign-in"/>
        </Suspense>
    )
}

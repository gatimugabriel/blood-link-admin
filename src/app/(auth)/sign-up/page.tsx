import AuthForm from '@/components/AuthForm'
import React, { Suspense } from 'react'
import { PageLoading } from '@/components/page-loading'

export default function SignUpPage() {
  return (
    <Suspense fallback={<PageLoading message="Loading sign-up..." />}>
      <AuthForm type="sign-up"/>
    </Suspense>
  )
}

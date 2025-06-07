interface SignInResult {
    accessToken: string
    refreshToken: string
}

interface SignInParams {
    email: string;
    password: string;
}

interface SignUpParams {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

interface SignUpResult {
    success: boolean
    message: string
    data?: any
}
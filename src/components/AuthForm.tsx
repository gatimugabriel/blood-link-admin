"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import FormField from "./FormField";
import { IconExclamationMark } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/actions/auth.action";

const authFormSchema = (type: FormType) => {
    return z.object({
        firstName: type === "sign-up" ? z.string().min(3) : z.string().optional(),
        lastName: type === "sign-up" ? z.string().min(3) : z.string().optional(),
        email: z.string().email(),
        password: z.string().min(3),
    });
};

const AuthForm = ({ type }: { type: FormType }) => {
    const router = useRouter()
    const formSchema = authFormSchema(type);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
        },
    });
    const isSignIn = type === "sign-in";


    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            if (type === "sign-in") {
                const result = await signIn(data);
                if (!result.success) {
                    toast.error(result.message || "Sign in failed", {
                        position: "top-center"
                    });
                    return;
                }
                    
                toast.success("Signed in successfully.", {
                    position: "top-left",
                });
                router.push("/dashboard");
            } else {
                const { firstName, lastName, email, password } = data
                const result = await signUp({ firstName, lastName, email, password });
                if (!result.success) {
                    toast.error(result.message);
                    return;
                }

                toast.success("Account created successfully. Check your email for verification.");
                router.push("/sign-in");
            }
        } catch (error) {
            toast.warning("There was an error", {
                description: error instanceof Error ? error.message : "Server error occurred",
                position: "top-center"
            });
        }

    }

    return (
        <div className="card-border lg:min-w-[566px]">
            <div className="flex flex-col gap-6 card py-14 px-10">
                <div className="flex flex-row gap-2 justify-center items-center">
                    <Image src="/logo.png" alt="logo" height={32} width={38} />
                    <h2 className="">BloodLink</h2>
                </div>

                <h3>Welcome Back!</h3>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full space-y-6 mt-4 form"
                    >
                        {!isSignIn && (
                            <FormField
                                control={form.control}
                                name="firstName"
                                label="FirstName"
                                placeholder="FirstName"
                                type="text"
                            />
                        )}

                        {!isSignIn && (
                            <FormField
                                control={form.control}
                                name="lastName"
                                label="LastName"
                                placeholder="LastName"
                                type="text"
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="email"
                            label="Email"
                            placeholder="Your email address"
                            type="email"
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            label="Password"
                            placeholder="Enter your password"
                            type="password"
                        />

                        <Button className="btn" type="submit" aria-disabled={form.formState.isSubmitting}>
                           {form.formState.isLoading || form.formState.isSubmitting ? "please wait..." : `${isSignIn ? "Sign In" : "Create an Account"}`}
                        </Button>

                        <div
                            className="flex h-8 items-end space-x-1"
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            {/* {form.formState.dirtyFields && (
                                <>
                                    <IconExclamationMark className="h-5 w-5 text-red-500" />
                                    <p className="text-sm text-red-500">form has errors</p>
                                </>
                            )} */}
                        </div>
                    </form>
                </Form>

                <p className="text-center">
                    {isSignIn ? "No account yet?" : "Have an account already?"}
                    <Link
                        href={!isSignIn ? "/sign-in" : "/sign-up"}
                        className="font-bold text-user-primary ml-1"
                    >
                        {!isSignIn ? "Sign In" : "Sign Up"}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default AuthForm;






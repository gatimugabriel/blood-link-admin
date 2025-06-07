'use client';

import {useBloodRequest} from "@/hooks/use-blood-requests";
import {useParams, useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {format, parseISO} from "date-fns";
import {AlertTriangle, ArrowLeft, Calendar, Clock, Droplet, MapPin, Phone, User} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton";

const statusColors = {
    open: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
    fulfilled: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
    closed: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
} as const;

const urgencyColors = {
    low: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
    medium: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
    high: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
} as const;

export function BloodRequestDetailClient() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const {data: bloodRequest, isLoading, error} = useBloodRequest(id);

    const formatDate = (dateString: string) => {
        try {
            const date = parseISO(dateString);
            return format(date, 'PPp');
        } catch (error) {
            return 'Invalid date';
        }
    };

    if (error) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Back
                </Button>
                <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-semibold text-red-600">Error</h2>
                        <p className="mt-2 text-gray-600">
                            {error instanceof Error ? error.message : 'Failed to load blood request details'}
                        </p>
                        <Button
                            variant="default"
                            onClick={() => router.push('/blood-requests')}
                            className="mt-4"
                        >
                            Return to Blood Requests
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Back
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {isLoading ? (
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-3/4"/>
                            <Skeleton className="h-4 w-1/2 mt-2"/>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-4 w-full"/>
                            <Skeleton className="h-4 w-full"/>
                            <Skeleton className="h-4 w-full"/>
                            <Skeleton className="h-4 w-full"/>
                        </CardContent>
                    </Card>
                ) : bloodRequest ? (
                    <>
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-2xl">Blood Request
                                            #{bloodRequest.id.slice(0, 8)}</CardTitle>
                                        <CardDescription>Created
                                            on {formatDate(bloodRequest.createdAt)}</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge variant="secondary" className={statusColors[bloodRequest.status]}>
                                            {bloodRequest.status.charAt(0).toUpperCase() + bloodRequest.status.slice(1)}
                                        </Badge>
                                        <Badge variant="secondary" className={urgencyColors[bloodRequest.urgency]}>
                                            {bloodRequest.urgency.charAt(0).toUpperCase() + bloodRequest.urgency.slice(1)}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Request Details</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <Droplet className="h-4 w-4 mr-2 text-red-500"/>
                                                <span className="font-medium">Blood Type:</span>
                                                <span className="ml-2">{bloodRequest.bloodGroup}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <AlertTriangle className="h-4 w-4 mr-2 text-amber-500"/>
                                                <span className="font-medium">Units Required:</span>
                                                <span className="ml-2">{bloodRequest.units}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-2 text-gray-500"/>
                                                <span className="font-medium">Created:</span>
                                                <span className="ml-2">{formatDate(bloodRequest.createdAt)}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="h-4 w-4 mr-2 text-gray-500"/>
                                                <span className="font-medium">Last Updated:</span>
                                                <span className="ml-2">{formatDate(bloodRequest.updatedAt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Patient Information</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center">
                                                <User className="h-4 w-4 mr-2 text-gray-500"/>
                                                <span className="font-medium">Patient Name:</span>
                                                <span className="ml-2">{bloodRequest.patientName}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Phone className="h-4 w-4 mr-2 text-gray-500"/>
                                                <span className="font-medium">Mobile Number:</span>
                                                <span className="ml-2">{bloodRequest.mobileNumber}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Location Information</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-start">
                                            <MapPin className="h-4 w-4 mr-2 mt-1 text-gray-500"/>
                                            <div>
                                                <span className="font-medium">Health Facility:</span>
                                                <span className="ml-2">{bloodRequest.healthFacility}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <MapPin className="h-4 w-4 mr-2 mt-1 text-gray-500"/>
                                            <div>
                                                <span className="font-medium">Address:</span>
                                                <span className="ml-2">{bloodRequest.requestLocation.address}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <MapPin className="h-4 w-4 mr-2 mt-1 text-gray-500"/>
                                            <div>
                                                <span className="font-medium">Coordinates:</span>
                                                <span className="ml-2">
                          {bloodRequest.requestLocation.latitude}, {bloodRequest.requestLocation.longitude}
                        </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => router.push('/blood-requests')}>
                                    Back to List
                                </Button>


                            </CardFooter>
                        </Card>
                    </>
                ) : (
                    <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold text-gray-600">Blood Request Not Found</h2>
                            <Button
                                variant="default"
                                onClick={() => router.push('/blood-requests')}
                                className="mt-4"
                            >
                                Return to Blood Requests
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
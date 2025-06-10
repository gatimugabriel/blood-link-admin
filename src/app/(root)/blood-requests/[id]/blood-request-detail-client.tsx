'use client';

import {useBloodRequest} from "@/hooks/use-blood-requests";
import {useParams, useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {format, parseISO} from "date-fns";
import {AlertTriangle, ArrowLeft, Calendar, Clock, Droplet, MapPin, Phone, User, Building2, Navigation, FileText} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton";
import {Separator} from "@/components/ui/separator";
import {BloodRequestMap} from "./blood-request-map";

const statusColors = {
    open: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20",
    fulfilled: "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20",
    closed: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20",
} as const;

const urgencyColors = {
    low: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20",
    medium: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20",
    high: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20",
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
            <div className="min-h-screen">
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
                        <Card className="w-full max-w-md">
                            <CardContent className="pt-6 text-center">
                                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4"/>
                                <h2 className="text-2xl font-semibold text-red-600 mb-2">Error</h2>
                                <p className="text-gray-600 mb-4">
                                    {error instanceof Error ? error.message : 'Failed to load blood request details'}
                                </p>
                                <Button
                                    variant="default"
                                    onClick={() => router.push('/blood-requests')}
                                >
                                    Return to Blood Requests
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex justify-between items-center">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4"/>
                        Back to Requests
                    </Button>
                </div>

                {isLoading ? (
                    <div className="space-y-6">
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
                    </div>
                ) : bloodRequest ? (
                    <div className="space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-3xl font-bold">
                                            Blood Request #{bloodRequest.id.slice(0, 8)}
                                        </CardTitle>
                                        <CardDescription className="text-lg mt-2">
                                            Created on {formatDate(bloodRequest.createdAt)}
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-3">
                                        <Badge variant="outline" className={`${statusColors[bloodRequest.status]} px-4 py-2 text-sm font-medium`}>
                                            {bloodRequest.status.charAt(0).toUpperCase() + bloodRequest.status.slice(1)}
                                        </Badge>
                                        <Badge variant="outline" className={`${urgencyColors[bloodRequest.urgency]} px-4 py-2 text-sm font-medium`}>
                                            {bloodRequest.urgency.charAt(0).toUpperCase() + bloodRequest.urgency.slice(1)} Priority
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <Droplet className="h-5 w-5 text-red-500"/>
                                            Request Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <Droplet className="h-5 w-5 text-red-500"/>
                                                        <span className="font-medium">Blood Type</span>
                                                    </div>
                                                    <span className="font-semibold text-lg">{bloodRequest.bloodGroup}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <AlertTriangle className="h-5 w-5 text-amber-500"/>
                                                        <span className="font-medium">Units Required</span>
                                                    </div>
                                                    <span className="font-semibold text-lg">{bloodRequest.units}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <Calendar className="h-5 w-5 text-blue-500"/>
                                                        <span className="font-medium">Created</span>
                                                    </div>
                                                    <span className="text-sm text-gray-500">{formatDate(bloodRequest.createdAt)}</span>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <Clock className="h-5 w-5 text-green-500"/>
                                                        <span className="font-medium ">Last Updated</span>
                                                    </div>
                                                    <span className="text-sm text-gray-500">{formatDate(bloodRequest.updatedAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <User className="h-5 w-5 text-blue-500"/>
                                            Patient Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <User className="h-5 w-5 text-gray-500"/>
                                                    <span className="font-medium ">Patient Name</span>
                                                </div>
                                                <span className="font-semibold">{bloodRequest.patientName}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <Phone className="h-5 w-5 text-gray-500"/>
                                                    <span className="font-medium ">Mobile Number</span>
                                                </div>
                                                <span className="font-semibold">{bloodRequest.mobileNumber}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <Building2 className="h-5 w-5 text-green-500"/>
                                            Location Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-start justify-between p-3 bg-muted rounded-lg">
                                                <div className="flex items-start gap-3">
                                                    <Building2 className="h-5 w-5 text-gray-500 mt-0.5"/>
                                                    <span className="font-medium">Health Facility</span>
                                                </div>
                                                <span className="font-semibold text-right max-w-xs">{bloodRequest.healthFacility}</span>
                                            </div>
                                            <div className="flex items-start justify-between p-3 bg-muted rounded-lg">
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5"/>
                                                    <span className="font-medium">Address</span>
                                                </div>
                                                <span className="font-semibold text-right max-w-xs">{bloodRequest.stringRequestLocation}</span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <Navigation className="h-5 w-5 text-gray-500"/>
                                                    <span className="font-medium">Coordinates</span>
                                                </div>
                                                <span className="font-mono text-sm">
                                                    {bloodRequest.requestLocation.coordinates[1].toFixed(6)}, {bloodRequest.requestLocation.coordinates[0].toFixed(6)}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <Card className="shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <MapPin className="h-5 w-5 text-green-500"/>
                                            Location Map
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-64 rounded-lg overflow-hidden border">
                                            <BloodRequestMap 
                                                latitude={bloodRequest.requestLocation.coordinates[0]}
                                                longitude={bloodRequest.requestLocation.coordinates[1]}
                                                facilityName={bloodRequest.healthFacility}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <FileText className="h-5 w-5 text-purple-500"/>
                                            Quick Actions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <Button className="w-full justify-start" variant="outline">
                                                <Phone className="mr-2 h-4 w-4"/>
                                                Contact Patient
                                            </Button>
                                            <Button className="w-full justify-start" variant="outline">
                                                <MapPin className="mr-2 h-4 w-4"/>
                                                Get Directions
                                            </Button>
                                            <Button className="w-full justify-start" variant="outline">
                                                <FileText className="mr-2 h-4 w-4"/>
                                                View Full Details
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Card className="w-full max-w-md mx-auto">
                        <CardContent className="pt-6 text-center">
                            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                            <h2 className="text-2xl font-semibold text-gray-600 mb-2">Blood Request Not Found</h2>
                            <p className="text-gray-500 mb-4">The requested blood request could not be found.</p>
                            <Button
                                variant="default"
                                onClick={() => router.push('/blood-requests')}
                            >
                                Return to Blood Requests
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
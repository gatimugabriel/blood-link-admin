'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDonation, useUpdateDonation } from '@/hooks/use-donations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Droplet, 
  MapPin, 
  Phone, 
  User, 
  Building2, 
  Navigation, 
  FileText, 
  Heart, 
  Mail,
  Award,
  TrendingUp,
  Shield,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const statusColors = {
  scheduled: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20",
  completed: "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20",
} as const;

const urgencyColors = {
  low: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20",
  medium: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20",
  high: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20",
} as const;

const requestForColors = {
  self: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20",
  other: "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border-indigo-500/20",
} as const;

export default function DonationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: donation, isLoading, error } = useDonation(params.id as string);
  const updateDonation = useUpdateDonation();

  const formatDate = (dateInput: string | Date) => {
    try {
      const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
      return format(date, 'PPp');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getPatientName = () => {
    if (donation?.request?.requestFor === 'self') {
      return `${donation.request.user?.firstName} ${donation.request.user?.lastName}`;
    }
    return donation?.request?.patientName || 'Not specified';
  };

  const getPatientContact = () => {
    if (donation?.request?.requestFor === 'self') {
      return donation.request?.mobileNumber || donation.request.user?.phone || 'Not specified';
    }
    return donation?.request?.mobileNumber || 'Not specified';
  };

  const handleStatusChange = async (status: 'completed' | 'cancelled') => {
    try {
      await updateDonation.mutateAsync({ id: params.id as string, status });
      toast.success('Donation status updated successfully');
    } catch (error) {
      toast.error('Failed to update donation status');
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
                  {error instanceof Error ? error.message : 'Failed to load donation details'}
                </p>
                <Button
                  variant="default"
                  onClick={() => router.push('/donations')}
                >
                  Return to Donations
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-32" />
          </div>
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
        </div>
      </div>
    );
  }

  if (!donation) {
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
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                <h2 className="text-2xl font-semibold text-gray-600 mb-2">Donation Not Found</h2>
                <p className="text-gray-500 mb-4">The requested donation could not be found.</p>
                <Button
                  variant="default"
                  onClick={() => router.push('/donations')}
                >
                  Return to Donations
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
            Back to Donations
          </Button>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl font-bold">
                    Donation #{donation.id.slice(0, 8)}
                  </CardTitle>
                  <CardTitle className="text-lg mt-2 text-muted-foreground">
                    Created on {formatDate(donation.createdAt)}
                  </CardTitle>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <Badge variant="outline" className={`${statusColors[donation.status]} px-4 py-2 text-sm font-medium`}>
                    {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                  </Badge>
                  {donation.request && (
                    <>
                      <Badge variant="outline" className={`${urgencyColors[donation.request.urgency as keyof typeof urgencyColors]} px-4 py-2 text-sm font-medium`}>
                        {donation.request.urgency.charAt(0).toUpperCase() + donation.request.urgency.slice(1)} Priority
                      </Badge>
                      <Badge variant="outline" className={`${requestForColors[donation.request.requestFor as keyof typeof requestForColors]} px-4 py-2 text-sm font-medium`}>
                        Request for {donation.request.requestFor.charAt(0).toUpperCase() + donation.request.requestFor.slice(1)}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Heart className="h-5 w-5 text-red-500"/>
                    Donation Details
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
                        <span className="font-semibold text-lg">{donation.request?.bloodType}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <Award className="h-5 w-5 text-amber-500"/>
                          <span className="font-medium">Donation Status</span>
                        </div>
                        <span className="font-semibold text-lg">{donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-blue-500"/>
                          <span className="font-medium">Created</span>
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(donation.createdAt)}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-green-500"/>
                          <span className="font-medium">Last Updated</span>
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(donation.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                  {donation.donationDate && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <Activity className="h-5 w-5 text-purple-500"/>
                          <span className="font-medium">Donation Date</span>
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(donation.donationDate)}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <User className="h-5 w-5 text-blue-500"/>
                    Donor Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-gray-500"/>
                        <span className="font-medium">Donor Name</span>
                      </div>
                      <span className="font-semibold">{donation.donor?.firstName} {donation.donor?.lastName}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-500"/>
                        <span className="font-medium">Email</span>
                      </div>
                      <span className="font-semibold">{donation.donor?.email}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-500"/>
                        <span className="font-medium">Phone</span>
                      </div>
                      <span className="font-semibold">{donation.donor?.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Droplet className="h-5 w-5 text-gray-500"/>
                        <span className="font-medium">Blood Group</span>
                      </div>
                      <span className="font-semibold">{donation.donor?.bloodGroup || 'Not specified'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Heart className="h-5 w-5 text-pink-500"/>
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-gray-500"/>
                        <span className="font-medium">Patient Name</span>
                      </div>
                      <span className="font-semibold">{getPatientName()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-500"/>
                        <span className="font-medium">Contact Number</span>
                      </div>
                      <span className="font-semibold">{getPatientContact()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {donation.request && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Building2 className="h-5 w-5 text-green-500"/>
                      Request Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-gray-500"/>
                          <span className="font-medium">Requester Name</span>
                        </div>
                        <span className="font-semibold">{donation.request.user?.firstName} {donation.request.user?.lastName}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-gray-500"/>
                          <span className="font-medium">Requester Email</span>
                        </div>
                        <span className="font-semibold">{donation.request.user?.email}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-gray-500"/>
                          <span className="font-medium">Health Facility</span>
                        </div>
                        <span className="font-semibold text-right max-w-xs">{donation.request.healthFacility}</span>
                      </div>
                      <div className="flex items-start justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-gray-500 mt-0.5"/>
                          <span className="font-medium">Request Location</span>
                        </div>
                        <span className="font-semibold text-right max-w-xs">{donation.request.stringRequestLocation}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Shield className="h-5 w-5 text-green-500"/>
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {donation.status === 'scheduled' && (
                      <>
                        <Button 
                          className="w-full justify-start" 
                          onClick={() => handleStatusChange('completed')}
                        >
                          <CheckCircle className="mr-2 h-4 w-4"/>
                          Mark as Completed
                        </Button>
                        <Button 
                          className="w-full justify-start" 
                          variant="destructive"
                          onClick={() => handleStatusChange('cancelled')}
                        >
                          <XCircle className="mr-2 h-4 w-4"/>
                          Cancel Donation
                        </Button>
                      </>
                    )}
                    {donation.status === 'completed' && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                        <CheckCircle className="h-5 w-5 text-green-500"/>
                        <span className="text-sm font-medium text-green-700">Donation Completed Successfully</span>
                      </div>
                    )}
                    {donation.status === 'cancelled' && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                        <XCircle className="h-5 w-5 text-red-500"/>
                        <span className="text-sm font-medium text-red-700">Donation Cancelled</span>
                      </div>
                    )}
                    <Separator />
                    <Button className="w-full justify-start" variant="outline">
                      <Phone className="mr-2 h-4 w-4"/>
                      Contact Donor
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <MapPin className="mr-2 h-4 w-4"/>
                      View Location
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="mr-2 h-4 w-4"/>
                      View Request Details
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <TrendingUp className="h-5 w-5 text-purple-500"/>
                    Donation Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-gray-500"/>
                        <span className="font-medium">Days Since Creation</span>
                      </div>
                      <span className="font-semibold">
                        {Math.floor((new Date().getTime() - new Date(donation.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                      </span>
                    </div>
                    {donation.donationDate && (
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <Activity className="h-5 w-5 text-gray-500"/>
                          <span className="font-medium">Days Since Donation</span>
                        </div>
                        <span className="font-semibold">
                          {Math.floor((new Date().getTime() - new Date(donation.donationDate).getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
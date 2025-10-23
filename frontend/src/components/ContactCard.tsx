'use client';

import React from 'react';
import { Phone, Mail, MapPin, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  region?: string;
  companyName?: string;
}

export interface ContactCardProps {
  contact: ContactInfo;
  title?: string;
  className?: string;
  showActions?: boolean;
  onCall?: (phone: string) => void;
  onEmail?: (email: string) => void;
}

export default function ContactCard({
  contact,
  title = "Informations de contact",
  className,
  showActions = true,
  onCall,
  onEmail
}: ContactCardProps) {
  const handleCall = () => {
    if (contact.phone && onCall) {
      onCall(contact.phone);
    } else if (contact.phone) {
      window.open(`tel:${contact.phone}`);
    }
  };

  const handleEmail = () => {
    if (contact.email && onEmail) {
      onEmail(contact.email);
    } else if (contact.email) {
      window.open(`mailto:${contact.email}`);
    }
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Name and Company */}
        <div className="space-y-1">
          <h3 className="font-medium text-foreground">{contact.name}</h3>
          {contact.companyName && (
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{contact.companyName}</span>
            </div>
          )}
        </div>

        {/* Contact Details */}
        <div className="space-y-3">
          {contact.phone && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{contact.phone}</span>
              </div>
              {showActions && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCall}
                  className="h-8 px-3"
                >
                  Appeler
                </Button>
              )}
            </div>
          )}

          {contact.email && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{contact.email}</span>
              </div>
              {showActions && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEmail}
                  className="h-8 px-3"
                >
                  Email
                </Button>
              )}
            </div>
          )}

          {contact.address && (
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                <div className="font-medium">{contact.address}</div>
                {contact.city && contact.region && (
                  <div className="text-muted-foreground">
                    {contact.city}, {contact.region}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="pt-2 border-t">
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            Contact disponible
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

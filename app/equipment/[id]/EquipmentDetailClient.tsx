"use client";

import { useSearchParams } from "next/navigation";
import { ArrowLeft, DollarSign, ScrollText, Shield, Sword } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/primitives/button";
import { Card, CardContent, CardHeader } from "@/components/primitives/card";
import { Badge } from "@/components/primitives/badge";
import {
  EquipmentItem,
  UserEquipment,
  AllEquipmentItem,
} from "@/lib/types/equipment";
import { EquipmentActionMenu } from "@/components/equipment/EquipmentActionMenu";
import { generateBackUrl } from "@/lib/utils";

interface EquipmentDetailClientProps {
  equipment: AllEquipmentItem;
  currentUserId?: string;
  isUserEquipment?: boolean;
}

export function EquipmentDetailClient({
  equipment,
  currentUserId,
  isUserEquipment,
}: EquipmentDetailClientProps) {
  const searchParams = useSearchParams();
  const backUrl = generateBackUrl(searchParams, "/equipment");

  // Check if current user owns this equipment
  const isOwner =
    isUserEquipment &&
    "user_id" in equipment &&
    equipment.user_id === currentUserId;

  return (
    <div className="container mx-auto py-6 px-4 lg:px-8 max-w-5xl">
      <Button asChild variant="ghost" className="mb-6 -ml-2">
        <Link href={backUrl} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Equipment
        </Link>
      </Button>

      <div className="flex flex-col gap-6">
        {/* Header */}
        <Card className="shadow-sm border">
          <CardHeader>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-3 capitalize">
                  {equipment.name}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="uppercase">
                    {equipment.item_type}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium capitalize">
                      {equipment.cost.amount} {equipment.cost.currency}
                    </span>
                  </div>
                </div>
              </div>
              {currentUserId && (
                <EquipmentActionMenu
                  equipment={equipment}
                  userId={currentUserId}
                  hideViewDetails
                />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {equipment.slot !== undefined && (
                <div className="flex items-center gap-2">
                  <ScrollText className="h-4 w-4 text-muted-foreground" />
                  <strong>Slots:</strong> {equipment.slot}
                </div>
              )}
              {equipment.damage && (
                <div className="flex items-center gap-2">
                  <Sword className="h-4 w-4 text-red-500" />
                  <strong>Damage:</strong> {equipment.damage}
                </div>
              )}
              {equipment.armor && (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <strong>Armor:</strong> {equipment.armor}
                </div>
              )}
              {equipment.attack_type && (
                <div className="flex items-center gap-2">
                  <strong>Attack Type:</strong> {equipment.attack_type}
                </div>
              )}
              {equipment.range && (
                <div className="flex items-center gap-2">
                  <strong>Range:</strong> {equipment.range}
                </div>
              )}
              {equipment.quantity && (
                <div className="flex items-center gap-2">
                  <strong>Quantity:</strong> {equipment.quantity}
                </div>
              )}
            </div>
            {equipment.properties && equipment.properties.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Properties</h3>
                <div className="flex flex-wrap gap-2">
                  {equipment.properties.map((prop, index) => (
                    <Badge key={index} variant="outline">
                      {prop}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

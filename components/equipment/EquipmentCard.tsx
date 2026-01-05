"use client";

import { Card, CardHeader, CardContent } from "@/components/primitives/card";
import { Badge } from "@/components/primitives/badge";
import { EquipmentItem } from "@/lib/types/equipment";
import { EquipmentActionMenu } from "./EquipmentActionMenu";
import Link from "next/link";
import { Shield, Sword, ScrollText, DollarSign, User } from "lucide-react";

interface EquipmentCardProps {
  item: EquipmentItem;
  currentUserId?: string;
  showActions?: boolean;
}

export function EquipmentCard({
  item,
  currentUserId,
  showActions = true,
}: EquipmentCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <Link href={`/equipment/${item.id}`} className="flex-1">
            <h3 className="text-xl font-semibold line-clamp-1 hover:underline">
              {item.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{item.item_type}</Badge>
            {showActions && currentUserId && (
              <EquipmentActionMenu equipment={item} userId={currentUserId} />
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1 mt-1">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">
              {item.cost.amount} {item.cost.currency}
            </span>
          </div>
          {item.source_type === "custom" && item.creator_name && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>Created by {item.creator_name}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <Link href={`/equipment/${item.id}`}>
        <CardContent className="p-4 border-t-2 dark:border-border">
          <div className="grid grid-cols-2 gap-2 text-sm">
            {item.slot !== undefined && (
              <div className="flex items-center gap-1">
                <ScrollText className="h-4 w-4 text-muted-foreground" />
                <span>Slots: {item.slot}</span>
              </div>
            )}
            {item.damage && (
              <div className="flex items-center gap-1">
                <Sword className="h-4 w-4 text-red-500" />
                <span>Damage: {item.damage}</span>
              </div>
            )}
            {item.armor && (
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-blue-500" />
                <span>AC: {item.armor}</span>
              </div>
            )}
            {item.attack_type && (
              <div className="flex items-center gap-1">
                <span>Attack Type: {item.attack_type}</span>
              </div>
            )}
            {item.range && (
              <div className="flex items-center gap-1">
                <span>Range: {item.range}</span>
              </div>
            )}
            {item.quantity && (
              <div className="flex items-center gap-1">
                <span>Qty: {item.quantity}</span>
              </div>
            )}
          </div>
          {item.properties && item.properties.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1">
              {item.properties.map((prop, index) => (
                <Badge key={index} variant="outline">
                  {prop}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}

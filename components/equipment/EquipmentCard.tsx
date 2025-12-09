"use client";

import { Card, CardHeader, CardContent } from "@/components/primitives/card";
import { Badge } from "@/components/primitives/badge";
import { EquipmentItem } from "@/lib/types/equipment";
import Link from "next/link"; // Assuming we might link to an equipment detail page later
import {
  Shield, // For armor class
  Sword, // For weapon damage
  ScrollText, // For properties
  DollarSign, // For cost
} from "lucide-react"; // Icons

interface EquipmentCardProps {
  item: EquipmentItem;
}

export function EquipmentCard({ item }: EquipmentCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <Link href={`/equipment/${item.id}`} className="block">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold line-clamp-1">{item.name}</h3>
            <Badge variant="secondary">{item.item_type}</Badge>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <DollarSign className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">
              {item.cost.amount} {item.cost.currency}
            </span>
          </div>
        </CardHeader>
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

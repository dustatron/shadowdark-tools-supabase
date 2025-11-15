"use client";

import { Heart, Shield, Footprints } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MonsterStatBlockProps {
  hitPoints: number;
  armorClass: number;
  speed: string;
  compact?: boolean;
}

export function MonsterStatBlock({
  hitPoints,
  armorClass,
  speed,
  compact = false,
}: MonsterStatBlockProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Heart size={16} className="text-red-500" />
          <span className="text-sm font-medium">{hitPoints}</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-blue-500" />
          <span className="text-sm font-medium">{armorClass}</span>
        </div>
        <div className="flex items-center gap-2">
          <Footprints size={16} className="text-green-500" />
          <span className="text-sm font-medium">{speed}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="shadow-sm ">
      <div className="grid grid-cols-3 md:grid-cols-9 gap-0">
        <div className="flex flex-col justify-start items-center border-l-4 border-b-4 border-t-4 border-black px-2 space-x-1">
          <p className="text-sm text-muted-foreground uppercase flex font-bold">
            <Footprints size={22} className="text-green-500 pr-1" />
            Move
          </p>
          <p className="text-xl font-bold">{speed}</p>
        </div>
        <div className="flex flex-col justify-start items-center  border-l-4 border-b-4 border-t-4 border-black space-x-1">
          <p className="text-md text-muted-foreground uppercase flex justify-center font-bold">
            <Heart size={22} className="text-red-500 pr-1" />
            HP
          </p>
          <p className="text-xl font-bold text-center">{hitPoints}</p>
        </div>
        <div className="flex flex-col justify-center items-center border-l-4 border-b-4 border-t-4 border-r-4 md:border-r-0 border-black space-x-1">
          <p className="flex text-md text-muted-foreground uppercase justify-center font-bold">
            <Shield size={22} className="text-blue-500 pr-1" />
            AC
          </p>
          <p className="text-xl font-bold text-center">{armorClass}</p>
        </div>
        <div className="justify-center items-center gap-2 border-l-4 border-b-4 border-t-4 border-black ">
          <p className="flex text-md font-bold text-muted-foreground uppercase justify-center bg-black text-gray-50">
            STR
          </p>
          <p className="text-xl font-bold text-center">+1</p>
        </div>
        <div className="justify-center items-center gap-2 border-l-4 border-b-4 border-t-4 border-black ">
          <p className="flex text-md font-bold text-muted-foreground uppercase justify-center bg-black text-gray-50">
            DEX
          </p>
          <p className="text-xl font-bold text-center">+1</p>
        </div>
        <div className="justify-center items-center gap-2 border-l-4 border-b-4 border-t-4 border-r-4 md:border-r-0 border-black ">
          <p className="flex text-md font-bold text-muted-foreground uppercase justify-center bg-black text-gray-50">
            CON
          </p>
          <p className="text-xl font-bold text-center">+1</p>
        </div>
        <div className="justify-center items-center gap-2 border-l-4 border-b-4 border-t-4 border-black ">
          <p className="flex text-md font-bold text-muted-foreground uppercase justify-center bg-black text-gray-50">
            INT
          </p>
          <p className="text-xl font-bold text-center">+1</p>
        </div>
        <div className="justify-center items-center gap-2 border-l-4 border-b-4 border-t-4 border-black ">
          <p className="flex text-md font-bold text-muted-foreground uppercase justify-center bg-black text-gray-50">
            WIS
          </p>
          <p className="text-xl font-bold text-center">+1</p>
        </div>
        <div className="justify-center items-center gap-2 border-l-4 border-b-4 border-t-4 border-r-4 border-black ">
          <p className="flex text-md font-bold text-muted-foreground uppercase justify-center bg-black text-gray-50">
            CHA
          </p>
          <p className="text-xl font-bold text-center">+1</p>
        </div>
      </div>
    </div>
  );
}

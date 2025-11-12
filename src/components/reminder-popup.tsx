"use client";

import type { Medicine } from "@/app/dashboard/page";
import { Button } from "@/components/ui/button";
import { PillIcon } from "@/components/icons";
import { Bell, Check, X } from "lucide-react";

interface ReminderPopupProps {
  reminder: Medicine;
  username: string;
  onTaken: () => void;
  onSnooze: () => void;
  onClose: () => void;
}

export function ReminderPopup({
  reminder,
  username,
  onTaken,
  onSnooze,
  onClose,
}: ReminderPopupProps) {
  return (
    <div className="reminder-overlay">
      <div className="reminder-popup relative text-center">
        <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-muted-foreground hover:text-foreground" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
        <div className="mx-auto h-28 w-28 flex items-center justify-center rounded-full bg-primary/10 mb-6 border-4 border-primary/20">
          <PillIcon className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">Time for your dose, {username}!</h2>
        <p className="mt-2 text-lg text-muted-foreground">
          Just a friendly reminder to take your medication.
        </p>
        <div className="my-8 p-6 bg-muted/50 rounded-lg text-center border-t border-b">
          <h3 className="text-2xl font-bold text-primary">{reminder.medicineName}</h3>
          <p className="text-md text-muted-foreground mt-1">
            <strong>Dosage:</strong> {reminder.dosage}
          </p>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={onTaken} size="lg" className="bg-green-600 hover:bg-green-700 text-white flex-1 text-lg py-6 shadow-lg hover:shadow-xl transition-shadow">
            <Check className="mr-2 h-6 w-6"/> I've Taken It
          </Button>
          <Button variant="outline" size="lg" onClick={onSnooze} className="flex-1 text-lg py-6">
            <Bell className="mr-2 h-5 w-5"/> Remind Me in 5m
          </Button>
        </div>
      </div>
    </div>
  );
}

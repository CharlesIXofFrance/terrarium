import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/Tabs';
import { BackgroundTab } from './tabs/BackgroundTab';
import { CurrentStatusTab } from './tabs/CurrentStatusTab';
import { CareerSettingsTab } from './tabs/CareerSettingsTab';

export function ProfileTabs() {
  return (
    <Tabs defaultValue="background" className="space-y-6">
      <TabsList className="w-full justify-start border-b border-gray-200 pb-px bg-transparent">
        <TabsTrigger value="background">My Background</TabsTrigger>
        <TabsTrigger value="status">My Current Status</TabsTrigger>
        <TabsTrigger value="settings">My Career Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="background" className="mt-6">
        <BackgroundTab />
      </TabsContent>

      <TabsContent value="status" className="mt-6">
        <CurrentStatusTab />
      </TabsContent>

      <TabsContent value="settings" className="mt-6">
        <CareerSettingsTab />
      </TabsContent>
    </Tabs>
  );
}

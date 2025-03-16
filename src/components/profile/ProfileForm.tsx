
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { NotificationPreference, User, supabase, updateNotificationPreferences, updateProfile } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ProfileForm() {
  const [user, setUser] = useState<User | null>(null);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreference | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [notificationFrequency, setNotificationFrequency] = useState<string>("daily");
  const [notificationTime, setNotificationTime] = useState<string>("09:00");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
          // Get profile data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
            
          if (profileData) {
            // Ensure notification_frequency has the correct type
            const typedProfileData: User = {
              ...profileData,
              notification_frequency: profileData.notification_frequency as 'daily' | 'weekly' | 'monthly',
            };
            setUser(typedProfileData);
            setFullName(profileData.full_name || "");
            setEmail(profileData.email || "");
            setNotificationFrequency(profileData.notification_frequency || "daily");
          }
          
          // Get notification preferences
          const { data: notificationData } = await supabase
            .from('notification_preferences')
            .select('*')
            .eq('user_id', authUser.id)
            .single();
            
          if (notificationData) {
            // Ensure frequency has the correct type
            const typedNotificationData: NotificationPreference = {
              ...notificationData,
              frequency: notificationData.frequency as 'daily' | 'weekly' | 'monthly',
            };
            setNotificationPrefs(typedNotificationData);
            setNotificationFrequency(notificationData.frequency);
            setNotificationTime(notificationData.time || "09:00");
            setNotificationsEnabled(notificationData.enabled);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Update profile
      await updateProfile(user.id, {
        full_name: fullName,
        notification_frequency: notificationFrequency as 'daily' | 'weekly' | 'monthly',
      });
      
      // Update notification preferences
      if (notificationPrefs) {
        await updateNotificationPreferences(user.id, {
          frequency: notificationFrequency as 'daily' | 'weekly' | 'monthly',
          time: notificationTime,
          enabled: notificationsEnabled,
        });
      }
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Please log in to manage your profile
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Manage your account settings and notification preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={saving}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled={true}
            />
            <p className="text-xs text-muted-foreground">
              Email can't be changed directly. Please contact support.
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Preferences</h3>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications" className="text-base">
              Enable Notifications
            </Label>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
              disabled={saving}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="frequency">Notification Frequency</Label>
            <Select
              disabled={saving || !notificationsEnabled}
              value={notificationFrequency}
              onValueChange={setNotificationFrequency}
            >
              <SelectTrigger id="frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time">Notification Time</Label>
            <Input
              id="time"
              type="time"
              value={notificationTime}
              onChange={(e) => setNotificationTime(e.target.value)}
              disabled={saving || !notificationsEnabled}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSaveProfile}
          disabled={saving}
          className="w-full sm:w-auto"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ShieldCheck } from 'lucide-react';

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security Settings</h1>
        <p className="text-muted-foreground">
          Manage your account security and privacy settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Password
            </CardTitle>
            <CardDescription>
              Update your password regularly to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" placeholder="Current password" />
            </div>

            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" placeholder="New password" />
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" placeholder="Confirm new password" />
            </div>

            <Button className="w-full">Update Password</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Two-Factor Authentication
            </CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p>Two-factor authentication is currently off</p>
                <p className="text-sm text-muted-foreground">
                  We recommend enabling this for better security
                </p>
              </div>
              <Switch />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Authentication Methods</p>
              <div className="flex items-center justify-between">
                <span>SMS</span>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <span>Authenticator App</span>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <span>Backup Codes</span>
                <Switch />
              </div>
            </div>

            <Button variant="outline" className="w-full">
              Configure Two-Factor Authentication
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>
              Manage your active sessions across different devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Current Session</p>
                  <p className="text-sm text-muted-foreground">This device</p>
                </div>
                <Button variant="outline" size="sm">
                  End Session
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Chrome on Mac</p>
                  <p className="text-sm text-muted-foreground">San Francisco, CA • 2 hours ago</p>
                </div>
                <Button variant="outline" size="sm">
                  End Session
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Firefox on Windows</p>
                  <p className="text-sm text-muted-foreground">New York, NY • 1 day ago</p>
                </div>
                <Button variant="outline" size="sm">
                  End Session
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
            <CardDescription>
              Control how your data is used and shared
          </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="data-sharing">Data Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Allow data sharing for product improvements
                </p>
              </div>
              <Switch id="data-sharing" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="activity-log">Activity Log</Label>
                <p className="text-sm text-muted-foreground">
                  Keep a log of your account activity
                </p>
              </div>
              <Switch id="activity-log" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="personalized-ads">Personalized Ads</Label>
                <p className="text-sm text-muted-foreground">
                  Show personalized advertisements
                </p>
              </div>
              <Switch id="personalized-ads" />
            </div>

            <Button variant="outline" className="w-full">
              Download Data Archive
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
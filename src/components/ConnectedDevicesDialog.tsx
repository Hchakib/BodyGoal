import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Smartphone, Monitor, Tablet, Trash2, Shield, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useDevices } from '../hooks/useDevices';
import { formatDistanceToNow } from 'date-fns';

interface ConnectedDevicesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConnectedDevicesDialog({ open, onOpenChange }: ConnectedDevicesDialogProps) {
  const { devices, loading, removeDevice, trustDevice } = useDevices();

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      default:
        return Monitor;
    }
  };

  const handleRemoveDevice = async (deviceId: string, isCurrent: boolean) => {
    if (isCurrent) {
      toast.error('Cannot remove current device');
      return;
    }

    if (!confirm('Are you sure you want to remove this device?')) {
      return;
    }

    try {
      await removeDevice(deviceId);
      toast.success('Device removed successfully');
    } catch (error) {
      toast.error('Failed to remove device');
    }
  };

  const handleToggleTrust = async (deviceId: string, currentTrust: boolean) => {
    try {
      await trustDevice(deviceId, !currentTrust);
      toast.success(currentTrust ? 'Device untrusted' : 'Device trusted');
    } catch (error) {
      toast.error('Failed to update device trust');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#151923] border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Connected Devices</DialogTitle>
          <DialogDescription className="text-gray-400">
            Manage devices that have accessed your account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {loading ? (
            <div className="text-center py-8 text-gray-400">
              Loading devices...
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-8">
              <Monitor className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No devices found</p>
            </div>
          ) : (
            devices.map((device) => {
              const DeviceIcon = getDeviceIcon(device.deviceType);
              const lastActiveText = device.lastActive 
                ? formatDistanceToNow(device.lastActive.toDate(), { addSuffix: true })
                : 'Unknown';

              return (
                <div
                  key={device.id}
                  className="bg-[#0B0B0F] border border-white/5 rounded-xl p-4 hover:border-[#22C55E]/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Device Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      device.isCurrent 
                        ? 'bg-gradient-to-br from-[#22C55E]/20 to-[#00D1FF]/20' 
                        : 'bg-white/5'
                    }`}>
                      <DeviceIcon className={`w-6 h-6 ${
                        device.isCurrent ? 'text-[#22C55E]' : 'text-gray-400'
                      }`} />
                    </div>

                    {/* Device Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white">{device.deviceName}</h4>
                        {device.isCurrent && (
                          <Badge className="bg-[#22C55E]/20 text-[#22C55E] border-0 text-xs">
                            Current
                          </Badge>
                        )}
                        {device.trusted && !device.isCurrent && (
                          <Badge className="bg-[#00D1FF]/20 text-[#00D1FF] border-0 text-xs">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Trusted
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        {device.browser} on {device.os}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Last active: {lastActiveText}</span>
                        {device.ipAddress && (
                          <span>IP: {device.ipAddress}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!device.isCurrent && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-[#00D1FF]"
                            onClick={() => handleToggleTrust(device.id, device.trusted)}
                            title={device.trusted ? 'Untrust device' : 'Trust device'}
                          >
                            {device.trusted ? (
                              <ShieldCheck className="w-4 h-4" />
                            ) : (
                              <Shield className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-red-500"
                            onClick={() => handleRemoveDevice(device.id, device.isCurrent)}
                            title="Remove device"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-4 border-t border-white/10">
          <div className="flex items-start gap-3 p-4 bg-[#00D1FF]/10 rounded-lg border border-[#00D1FF]/20">
            <Shield className="w-5 h-5 text-[#00D1FF] mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-white mb-1">Security Tip</p>
              <p className="text-xs text-gray-400">
                If you see a device you don't recognize, remove it immediately and change your password.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF]"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

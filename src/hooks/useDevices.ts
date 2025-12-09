import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  Timestamp,
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Device {
  id: string;
  deviceName: string;
  deviceType: string;
  browser: string;
  os: string;
  lastActive: Timestamp;
  ipAddress?: string;
  isCurrent: boolean;
  trusted: boolean;
}

export function useDevices() {
  const { currentUser } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setDevices([]);
      setLoading(false);
      return;
    }

    const devicesRef = collection(db, 'devices');
    const q = query(
      devicesRef,
      where('userId', '==', currentUser.uid),
      orderBy('lastActive', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const devicesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Device[];

      setDevices(devicesData);
      setLoading(false);
    });

    // Register current device if not already registered
    registerCurrentDevice();

    return () => unsubscribe();
  }, [currentUser]);

  const registerCurrentDevice = async () => {
    if (!currentUser) return;

    const deviceInfo = getDeviceInfo();
    const devicesRef = collection(db, 'devices');

    // Check if device already exists
    const existingDevice = devices.find(d => 
      d.deviceName === deviceInfo.deviceName && 
      d.browser === deviceInfo.browser
    );

    if (existingDevice) {
      // Update last active
      const deviceDoc = doc(db, 'devices', existingDevice.id);
      await updateDoc(deviceDoc, {
        lastActive: Timestamp.now(),
        isCurrent: true
      });
    } else {
      // Add new device
      await addDoc(devicesRef, {
        userId: currentUser.uid,
        ...deviceInfo,
        lastActive: Timestamp.now(),
        isCurrent: true,
        trusted: true,
        createdAt: Timestamp.now()
      });
    }
  };

  const removeDevice = async (deviceId: string) => {
    try {
      const deviceDoc = doc(db, 'devices', deviceId);
      await deleteDoc(deviceDoc);
    } catch (error) {
      console.error('Error removing device:', error);
      throw error;
    }
  };

  const trustDevice = async (deviceId: string, trusted: boolean) => {
    try {
      const deviceDoc = doc(db, 'devices', deviceId);
      await updateDoc(deviceDoc, { trusted });
    } catch (error) {
      console.error('Error updating device trust:', error);
      throw error;
    }
  };

  return {
    devices,
    loading,
    removeDevice,
    trustDevice,
    registerCurrentDevice
  };
}

function getDeviceInfo() {
  const ua = navigator.userAgent;
  
  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  else if (ua.includes('Opera')) browser = 'Opera';

  // Detect OS
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS')) os = 'iOS';

  // Detect device type
  let deviceType = 'Desktop';
  if (/Mobile|Android|iPhone/.test(ua)) deviceType = 'Mobile';
  else if (/Tablet|iPad/.test(ua)) deviceType = 'Tablet';

  const deviceName = `${os} ${deviceType}`;

  return {
    deviceName,
    deviceType,
    browser,
    os
  };
}

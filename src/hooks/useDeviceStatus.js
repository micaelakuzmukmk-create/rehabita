import { useEffect, useState } from 'react';
import { getDeviceStatus, subscribeDeviceStatus } from '@/lib/deviceStatus';

export default function useDeviceStatus() {
  const [status, setStatus] = useState(getDeviceStatus);

  useEffect(() => {
    setStatus(getDeviceStatus());
    return subscribeDeviceStatus(setStatus);
  }, []);

  return status;
}
import { useState, useEffect } from 'react';
import { isLocalhost } from '@utils/env';

export function useEnvironment() {
  const [environment, setEnvironment] = useState("production");

  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname.includes("alpha")) {
      setEnvironment("alpha");
    } else if (isLocalhost()) {
      setEnvironment("localhost");
    } else {
      setEnvironment("production");
    }
  }, []);

  return environment;
}

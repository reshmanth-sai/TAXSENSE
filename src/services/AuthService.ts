export class AuthService {
  private static isScriptLoaded = false;

  /**
   * Dynamically loads the Google Identity Services (GSI) script.
   */
  static loadGoogleGIS(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }

      if (this.isScriptLoaded || document.getElementById('google-gsi-client')) {
        this.isScriptLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.isScriptLoaded = true;
        resolve();
      };
      script.onerror = (err) => {
        console.error('Failed to load Google GIS script:', err);
        reject(err);
      };
      document.body.appendChild(script);
    });
  }

  /**
   * Helper to decode JWT payloads locally in a safe manner.
   */
  static decodeJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decoding JWT token:', e);
      return null;
    }
  }

  /**
   * Disables auto-select on Google Sign-In during logout.
   */
  static revokeGoogleSession(): void {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.disableAutoSelect();
      } catch (e) {
        console.error('Error disabling Google auto-select:', e);
      }
    }
  }
}

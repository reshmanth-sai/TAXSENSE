export class GoogleAuthService {
  private static isScriptLoaded = false;
  private static isInitialized = false;
  private static loginListener: ((response: any) => void) | null = null;
  private static scriptPromise: Promise<void> | null = null;

  /**
   * Loads the Google Identity Services SDK script once.
   */
  static loadScript(): Promise<void> {
    if (this.scriptPromise) {
      return this.scriptPromise;
    }

    this.scriptPromise = new Promise<void>((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }

      // Check if script element or global google namespace already exists
      if (this.isScriptLoaded || document.getElementById('google-gsi-client') || (window as any).google?.accounts?.id) {
        console.log('[GIS] Script already present or SDK loaded.');
        this.isScriptLoaded = true;
        resolve();
        return;
      }

      console.log('[GIS] Script Injected');
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('[GIS] Script Loaded');
        
        // Wait until window.google.accounts.id namespace is fully populated
        let checks = 0;
        const checkInterval = setInterval(() => {
          checks++;
          if ((window as any).google?.accounts?.id) {
            clearInterval(checkInterval);
            console.log('[GIS] Google Object Ready');
            this.isScriptLoaded = true;
            resolve();
          } else if (checks > 50) { // 5.0 seconds timeout
            clearInterval(checkInterval);
            console.error('[GIS] Script loaded but window.google.accounts.id not found');
            reject(new Error('Google Identity SDK failed to initialize.'));
          }
        }, 100);
      };

      script.onerror = (err) => {
        console.error('[GIS] Failed to load script:', err);
        reject(err);
      };

      document.body.appendChild(script);
    });

    return this.scriptPromise;
  }

  /**
   * Initializes the Google Identity client exactly once.
   */
  static async initialize(clientId: string, callback: (response: any) => void): Promise<void> {
    await this.loadScript();

    // Register or update the credential callback listener dynamically
    this.loginListener = callback;

    if (this.isInitialized) {
      console.log('[GIS] Already Initialized');
      return;
    }

    console.log('[GIS] Initializing');
    const google = (window as any).google;
    if (!google?.accounts?.id) {
      throw new Error('Google Identity SDK namespace is missing.');
    }

    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => {
        console.log('[GIS] Credential callback triggered');
        if (this.loginListener) {
          this.loginListener(response);
        }
      }
    });

    this.isInitialized = true;
    console.log('[GIS] Initialized Successfully');
  }

  /**
   * Safely renders the Google button in the container with retry back-off loops and DOM painted frame checks.
   */
  static async renderButton(
    containerId: string, 
    options: { theme?: 'outline' | 'filled_blue' | 'filled_black'; size?: 'small' | 'medium' | 'large'; width?: number } = {}
  ): Promise<void> {
    let retries = 0;
    const maxRetries = 5;
    const intervals = [100, 250, 500, 1000, 2000];

    const tryRender = (): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        // Wait two full animation frame paint cycles to guarantee DOM is rendered and visible
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const container = document.getElementById(containerId);
            if (!container) {
              console.warn(`[GIS] Container #${containerId} not found. Retry ${retries + 1}/${maxRetries}`);
              reject(new Error('Container element not found'));
              return;
            }

            console.log('[GIS] Container Found');
            const google = (window as any).google;
            if (!google?.accounts?.id || !this.isInitialized) {
              console.warn(`[GIS] Google SDK not initialized. Retry ${retries + 1}/${maxRetries}`);
              reject(new Error('Google SDK not initialized'));
              return;
            }

            try {
              console.log('[GIS] Rendering Button');
              // Clear container to prevent duplicate iframes
              container.innerHTML = '';
              
              google.accounts.id.renderButton(
                container,
                {
                  theme: options.theme || 'outline',
                  size: options.size || 'large',
                  width: options.width || 240,
                  shape: 'pill',
                  text: 'signin_with'
                }
              );
              
              console.log('[GIS] Button Rendered');
              resolve();
            } catch (err) {
              console.error('[GIS] Exception during renderButton:', err);
              reject(err);
            }
          });
        });
      });
    };

    const attempt = async () => {
      try {
        await tryRender();
      } catch (err) {
        if (retries < maxRetries) {
          const delay = intervals[retries];
          retries++;
          await new Promise(r => setTimeout(r, delay));
          await attempt();
        } else {
          console.error('[GIS] Render button failed after max retries.');
          throw new Error('Google Sign-In button rendering failed');
        }
      }
    };

    await attempt();
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
      console.error('[GIS] Error decoding JWT:', e);
      return null;
    }
  }

  /**
   * Disables auto-select on Google Sign-In during logout.
   */
  static revokeSession(): void {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.disableAutoSelect();
        console.log('[GIS] Revoked session');
      } catch (e) {
        console.error('[GIS] Error revoking session:', e);
      }
    }
  }
}

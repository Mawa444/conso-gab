/**
 * Device Detection Utility
 * Détecte le type d'appareil de l'utilisateur
 */

export type DeviceType = 'mobile' | 'desktop' | 'tablet';

export class DeviceDetector {
  private static cachedDeviceType: DeviceType | null = null;

  /**
   * Détecte le type d'appareil
   */
  static detect(): DeviceType {
    if (this.cachedDeviceType) {
      return this.cachedDeviceType;
    }

    const ua = navigator.userAgent;
    
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      this.cachedDeviceType = 'tablet';
    } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      this.cachedDeviceType = 'mobile';
    } else {
      this.cachedDeviceType = 'desktop';
    }

    return this.cachedDeviceType;
  }

  /**
   * Vérifie si l'appareil est mobile
   */
  static isMobile(): boolean {
    return this.detect() === 'mobile';
  }

  /**
   * Vérifie si l'appareil est desktop
   */
  static isDesktop(): boolean {
    return this.detect() === 'desktop';
  }

  /**
   * Vérifie si l'appareil est tablet
   */
  static isTablet(): boolean {
    return this.detect() === 'tablet';
  }

  /**
   * Obtient le user agent
   */
  static getUserAgent(): string {
    return navigator.userAgent;
  }
}

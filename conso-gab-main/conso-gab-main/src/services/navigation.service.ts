export interface NavigationContext {
  currentMode: string;
  currentBusinessId: string | null;
}

export type NavigateFunction = (to: string, options?: { replace?: boolean; state?: any }) => void;

export class NavigationService {
  static navigateToProfile(navigate: NavigateFunction, context: NavigationContext): void {
    if (context.currentMode === "business" && context.currentBusinessId) {
      navigate(`/business/${context.currentBusinessId}`);
    } else {
      navigate('/consumer/profile');
    }
  }

  static navigateToHome(navigate: NavigateFunction): void {
    navigate('/consumer/home');
  }

  static navigateToMap(navigate: NavigateFunction): void {
    navigate('/consumer/map');
  }

  static navigateToBusiness(navigate: NavigateFunction, businessId: string): void {
    navigate(`/business/${businessId}`);
  }

  static navigateToProduct(navigate: NavigateFunction, productId: string): void {
    navigate(`/product/${productId}`);
  }

  static navigateToMessaging(navigate: NavigateFunction): void {
    navigate('/messaging');
  }

  static navigateToCatalogs(navigate: NavigateFunction): void {
    navigate('/catalogs');
  }

  static navigateToCategory(navigate: NavigateFunction, categoryId: string): void {
    navigate(`/category/${categoryId}`);
  }

  static navigateToEntreprises(navigate: NavigateFunction): void {
    navigate('/entreprises');
  }

  static navigateToCreateBusiness(navigate: NavigateFunction): void {
    navigate('/entreprises/create');
  }

  static navigateToBusinessDashboard(navigate: NavigateFunction, businessId: string): void {
    navigate(`/business/${businessId}/dashboard`);
  }

  static navigateToBusinessSettings(navigate: NavigateFunction, businessId: string): void {
    navigate(`/business/${businessId}/settings`);
  }

  static navigateToBusinessProfile(navigate: NavigateFunction, businessId: string): void {
    navigate(`/business/${businessId}/profile`);
  }

  static navigateToCreateCatalog(navigate: NavigateFunction, businessId: string): void {
    navigate(`/business/${businessId}/catalogues`);
  }

  static navigateToConversation(navigate: NavigateFunction, conversationId: string): void {
    navigate(`/messaging/${conversationId}`);
  }

  static getTabPath(tab: string): string {
    switch (tab) {
      case 'home':
        return '/consumer/home';
      case 'map':
        return '/consumer/map';
      case 'profile':
        return '/consumer/profile';
      default:
        return '/consumer/home';
    }
  }

  static shouldRedirectProfileToBusiness(context: NavigationContext): boolean {
    return context.currentMode === "business" && Boolean(context.currentBusinessId);
  }

  static getProfileRedirectPath(context: NavigationContext): string | null {
    if (this.shouldRedirectProfileToBusiness(context)) {
      return `/business/${context.currentBusinessId}`;
    }
    return null;
  }
}
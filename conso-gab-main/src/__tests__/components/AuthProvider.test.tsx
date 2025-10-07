import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event"; // Pour simuler les interactions utilisateur
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import React from "react";

// --- Mock Supabase ---
// Définir le type de la fonction de nettoyage pour le mock
type Unsubscribe = () => void;
const mockUnsubscribe: Unsubscribe = vi.fn();
let authStateChangeCallback: (event: string, session: any) => void = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      // Les mocks des fonctions de Supabase
      getSession: vi.fn(),
      onAuthStateChange: vi.fn((callback: any) => {
        // Capture la fonction de rappel pour la simuler plus tard
        authStateChangeCallback = callback;
        return {
          data: {
            subscription: {
              unsubscribe: mockUnsubscribe, // Renvoyer une fonction de nettoyage mockée
            },
          },
        };
      }),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
  },
}));

// Mock d'un utilisateur Supabase simple
const mockUser = {
  id: "user-123",
  email: "test@example.com",
};

// Composant de Test (inchangé)
const TestComponent = () => {
  const { user, loading, signIn, signOut } = useAuth();

  // Pour le test de déconnexion, affichons un bouton de déconnexion uniquement si l'utilisateur est présent
  return (
    <div>
      <div data-testid="loading">{loading ? "loading" : "loaded"}</div>
      <div data-testid="user">{user ? user.email : "no-user"}</div>
      <button onClick={() => signIn("test@example.com", "password")}>Sign In</button>
      {user && (
        <button data-testid="sign-out-btn" onClick={signOut}>
          Sign Out
        </button>
      )}
    </div>
  );
};

describe("AuthProvider", () => {
  const user = userEvent.setup();
  let consoleSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Le mock d'erreur console est crucial pour les tests d'erreurs
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Configurer le comportement initial de base pour tous les tests
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  // --- NOUVEAU/AMÉLIORÉ : Test initial de la session et du chargement ---
  it("should initialize with session user and transition from loading to loaded", async () => {
    // ARRANGE: Simuler une session existante
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: mockUser } as any },
      error: null,
    });

    // ACT
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // ASSERT 1: Vérifier l'état de chargement initial
    expect(screen.getByTestId("loading")).toHaveTextContent("loading");
    expect(screen.getByTestId("user")).toHaveTextContent("no-user");

    // ASSERT 2: Vérifier l'état après le chargement
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
    });

    // ASSERT 3: Vérifier que l'utilisateur est chargé
    expect(screen.getByTestId("user")).toHaveTextContent("test@example.com");
  });

  // --- AMÉLIORÉ : Test de la gestion de l'état de chargement asynchrone ---
  it("should handle loading state asynchronously", async () => {
    // ARRANGE: Simuler un délai de 100ms pour getSession
    vi.mocked(supabase.auth.getSession).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                data: { session: null },
                error: null,
              }),
            100,
          ),
        ),
    );

    // ACT
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // ASSERT 1: État initial
    expect(screen.getByTestId("loading")).toHaveTextContent("loading");

    // ASSERT 2: État final
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      expect(screen.getByTestId("user")).toHaveTextContent("no-user");
    });
  });

  // --- AMÉLIORÉ : Test du Sign In ---
  it("should call signInWithPassword and update user state", async () => {
    // ARRANGE: Mock le retour de Supabase après la connexion
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: mockUser as any, session: {} as any },
      error: null,
    });

    // ACT
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // Simuler le clic sur le bouton de connexion
    const signInButton = screen.getByText("Sign In");
    await user.click(signInButton);

    // ASSERT 1: Vérifier que la fonction Supabase est appelée avec les bons paramètres
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password",
    });

    // ASSERT 2: Simuler la mise à jour de l'état (normalement gérée par onAuthStateChange)
    // Ici, on simule l'événement qui suit une connexion réussie
    authStateChangeCallback("SIGNED_IN", { session: { user: mockUser } as any });

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("test@example.com");
    });
  });

  // --- NOUVEAU : Test de gestion d'erreur de connexion ---
  it("should handle sign in error and remain logged out", async () => {
    // ARRANGE: Simuler une erreur de connexion Supabase
    const mockError = { name: "AuthApiError", message: "Invalid credentials" };
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: mockError as any,
    });

    // ACT
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // Vérifier l'état initial
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("loaded"));
    expect(screen.getByTestId("user")).toHaveTextContent("no-user");

    // Tenter de se connecter
    await user.click(screen.getByText("Sign In"));

    // ASSERT: Vérifier que l'état utilisateur n'a PAS changé
    // On s'attend à ce que le code log l'erreur (d'où le consoleSpy)
    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("no-user");
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("[Auth] Login error:"), mockError);
    });
  });

  // --- AMÉLIORÉ : Test de la déconnexion ---
  it("should call signOut and update user state to null", async () => {
    // ARRANGE: Commencer avec un utilisateur connecté
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: mockUser } as any },
      error: null,
    });
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

    // ACT
    const { rerender } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // Attendre le chargement initial
    await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("loaded"));

    // ASSERT 1: L'utilisateur est connecté
    expect(screen.getByTestId("user")).toHaveTextContent("test@example.com");

    // ACT 2: Déconnexion
    await user.click(screen.getByTestId("sign-out-btn"));

    // ASSERT 2: Vérifier l'appel à Supabase
    expect(supabase.auth.signOut).toHaveBeenCalled();

    // ACT 3: Simuler l'événement de déconnexion post-appel
    authStateChangeCallback("SIGNED_OUT", { session: null, user: null });

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("no-user");
    });
  });

  // --- NOUVEAU : Test du nettoyage de l'abonnement ---
  it("should unsubscribe on component unmount to prevent memory leaks", () => {
    // ACT
    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // ASSERT: S'assurer que le mockUnsubscribe n'a PAS été appelé
    expect(mockUnsubscribe).not.toHaveBeenCalled();

    // ACT 2: Démonter le composant
    unmount();

    // ASSERT 2: L'abonnement doit être nettoyé
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});

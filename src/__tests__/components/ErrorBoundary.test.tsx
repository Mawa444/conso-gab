import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "@/components/error/ErrorBoundary"; // Assurez-vous que ce chemin est correct
import React from "react";

// --- Composant de Test avec typage ---
// Composant qui lance une erreur
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    // Le composant doit lancer une VRAIE erreur pour que l'ErrorBoundary la capture
    throw new Error("Test boundary error");
  }
  return <div>Contenu normal de l'enfant</div>;
};

describe("ErrorBoundary", () => {
  // --- Gestion de console.error pour les tests d'erreurs ---

  // Utiliser vi.SpyOn pour suivre les appels et les empêcher de polluer la console de test
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    // 'spyOn' permet d'écraser la fonction ET de conserver la capacité de l'analyser.
    // L'ErrorBoundary DOIT appeler console.error lors de la capture.
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    // Restaurer la fonction originale après tous les tests
    errorSpy.mockRestore();
  });

  // Assurez-vous que le mock de console.error est bien réinitialisé entre les tests si vous vérifiez le nombre d'appels

  // --- Tests ---

  it("should render children when there is no error", () => {
    // ACT
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>,
    );

    // ASSERT
    // Utilisation de queryByText car c'est un contenu normal
    expect(screen.queryByText(/Contenu normal de l'enfant/i)).toBeInTheDocument();
    // Vérifier que le message d'erreur N'EST PAS visible
    expect(screen.queryByText(/Une erreur est survenue/i)).not.toBeInTheDocument();

    // On s'attend à ce que console.error n'ait pas été appelée dans ce cas
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("should render default error UI when an error occurs in the children", () => {
    // ACT
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    // ASSERT
    // Utilisation de getByText pour le message d'erreur
    expect(screen.getByText(/Une erreur est survenue/i)).toBeInTheDocument();

    // Vérifier que l'ErrorBoundary a bien loggé l'erreur
    // L'appel attendu est 2 fois (pour componentDidCatch et console.error de React)
    expect(errorSpy).toHaveBeenCalled();
  });

  it("should render custom fallback when provided and an error occurs", () => {
    // ARRANGE
    const customMessage = "Message d’erreur personnalisé";
    const customFallback = <h1>{customMessage}</h1>;

    // ACT
    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    // ASSERT
    expect(screen.getByText(customMessage)).toBeInTheDocument();
    // Vérifier que le contenu par défaut N'EST PAS rendu
    expect(screen.queryByText(/Une erreur est survenue/i)).not.toBeInTheDocument();
  });

  it("should call console.error with the correct error details", () => {
    // ACT
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>,
    );

    // ASSERT
    // Vérifier que le contenu loggé contient bien le message de l'erreur lancée
    const expectedErrorMessage = "Test boundary error";

    // La vérification exacte dépend de votre implémentation de l'ErrorBoundary,
    // mais on peut vérifier que l'objet 'Error' a été passé à console.error
    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({ message: expectedErrorMessage }),
      expect.anything(), // Pour le info object de React
    );
  });
});

/* NOTE IMPORTANTE: 
  Si votre ErrorBoundary utilise le hook React 18 `useErrorBoundary` 
  ou si vous utilisez un système basé sur des fonctions (pas une classe),
  il pourrait ne pas supporter la prop `fallback` ou nécessiter une autre approche.
  Les tests ci-dessus sont optimaux pour une ErrorBoundary basée sur une **Classe** avec `componentDidCatch`.
*/

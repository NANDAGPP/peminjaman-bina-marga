import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { LoadingScreen } from "../components/Common/LoadingScreen";
import { CookieConsent } from "../components/Common/CookieConsent";

describe("LoadingScreen Component", () => {
  it("renders the loading screen with Bina Marga logo and text when isLoading is true", () => {
    render(<LoadingScreen isLoading={true} minDuration={2000} />);
    
    expect(screen.getByAltText(/Logo Dinas PU Bina Marga/i)).toBeInTheDocument();
    expect(screen.getByText(/Dinas Pekerjaan Umum Bina Marga/i)).toBeInTheDocument();
    expect(screen.getByText(/Memuat Sistem Peminjaman Aset.../i)).toBeInTheDocument();
  });

  it("calls onFinish and hides after fading out when isLoading is false", () => {
    vi.useFakeTimers();
    const handleFinish = vi.fn();
    render(
      <LoadingScreen isLoading={false} minDuration={100} onFinish={handleFinish} />
    );

    expect(screen.getByAltText(/Logo Dinas PU Bina Marga/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(150); // triggers fadeOut
    });
    act(() => {
      vi.advanceTimersByTime(600); // completes fadeOut
    });

    expect(handleFinish).toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe("CookieConsent Component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  it("shows cookie consent banner after initial delay when not previously consented", () => {
    render(<CookieConsent />);
    
    expect(screen.queryByText(/Persetujuan Cookie & Privasi/i)).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/Persetujuan Cookie & Privasi/i)).toBeInTheDocument();
    expect(screen.getByText(/Terima Semua/i)).toBeInTheDocument();
    expect(screen.getByText(/Hanya Esensial/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("saves consent and hides banner when clicking 'Terima Semua'", () => {
    render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const acceptBtn = screen.getByText(/Terima Semua/i);
    fireEvent.click(acceptBtn);

    expect(localStorage.getItem("bina_marga_cookie_consent")).toBe("all");
    expect(screen.queryByText(/Persetujuan Cookie & Privasi/i)).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("saves essential consent and hides banner when clicking 'Hanya Esensial'", () => {
    render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const essentialBtn = screen.getByText(/Hanya Esensial/i);
    fireEvent.click(essentialBtn);

    expect(localStorage.getItem("bina_marga_cookie_consent")).toBe("essential");
    expect(screen.queryByText(/Persetujuan Cookie & Privasi/i)).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("toggles cookie detail explanations", () => {
    render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const toggleBtn = screen.getByText(/Pelajari jenis cookie/i);
    fireEvent.click(toggleBtn);

    expect(screen.getByText(/Cookie Esensial \(Wajib\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Cookie Preferensi/i)).toBeInTheDocument();
    vi.useRealTimers();
  });
});

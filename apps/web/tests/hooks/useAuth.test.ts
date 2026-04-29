import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mockLogin = vi.fn();
const mockLogout = vi.fn();
const mockUpdateUser = vi.fn();

const useAuth = () => {
  const [user, setUser] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const result = await mockLogin({ email, password });
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
      localStorage.setItem('token', result.token);
    }
    setIsLoading(false);
    return result;
  };

  const logout = () => {
    mockLogout();
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  const updateUser = (updates: any) => {
    mockUpdateUser(updates);
    setUser((prev: any) => ({ ...prev, ...updates }));
  };

  return { user, isLoading, isAuthenticated, login, logout, updateUser };
};

describe('useAuth Hook', () => {
  it('initial state has no user', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('login sets user and authentication state', async () => {
    mockLogin.mockResolvedValueOnce({
      success: true,
      user: { id: 'usr_123', email: 'teacher@school.edu.pk', role: 'TEACHER' },
      token: 'mock_token_123',
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('teacher@school.edu.pk', 'password123');
    });

    expect(result.current.user).toEqual({
      id: 'usr_123',
      email: 'teacher@school.edu.pk',
      role: 'TEACHER',
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('login handles failure', async () => {
    mockLogin.mockResolvedValueOnce({
      success: false,
      error: 'Invalid credentials',
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('wrong@school.edu.pk', 'wrongpass');
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('logout clears user state', async () => {
    mockLogin.mockResolvedValueOnce({
      success: true,
      user: { id: 'usr_123', role: 'TEACHER' },
      token: 'token123',
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('teacher@school.edu.pk', 'password123');
    });

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(mockLogout).toHaveBeenCalled();
  });

  it('updateUser modifies user data', async () => {
    mockLogin.mockResolvedValueOnce({
      success: true,
      user: { id: 'usr_123', name: 'Old Name', role: 'TEACHER' },
      token: 'token123',
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('teacher@school.edu.pk', 'password123');
    });

    act(() => {
      result.current.updateUser({ name: 'New Name' });
    });

    expect(result.current.user.name).toBe('New Name');
    expect(result.current.user.id).toBe('usr_123');
    expect(mockUpdateUser).toHaveBeenCalledWith({ name: 'New Name' });
  });

  it('sets loading state during login', async () => {
    mockLogin.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({
      success: true,
      user: { id: 'usr_123' },
      token: 'token',
    }), 100)));

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login('test@school.edu.pk', 'pass');
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });

    expect(result.current.isLoading).toBe(false);
  });
});

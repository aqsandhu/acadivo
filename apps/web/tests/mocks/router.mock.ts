import { vi } from 'vitest';

export const mockUseNavigate = vi.fn();

export const mockUseLocation = vi.fn().mockReturnValue({
  pathname: '/dashboard',
  search: '',
  hash: '',
  state: null,
});

export const mockUseParams = vi.fn().mockReturnValue({
  id: 'std_001',
});

export const mockUseSearchParams = vi.fn().mockReturnValue([
  new URLSearchParams('?page=1&limit=10'),
  vi.fn(),
]);

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockUseNavigate,
    useLocation: () => mockUseLocation(),
    useParams: () => mockUseParams(),
    useSearchParams: () => mockUseSearchParams(),
  };
});

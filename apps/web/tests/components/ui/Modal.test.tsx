import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../test-utils';

const MockModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
}> = ({ isOpen, onClose, title, children, footer, size = 'md', closeOnOverlayClick = true, closeOnEsc = true }) => {
  if (!isOpen) return null;

  return (
    <div data-testid="modal-overlay" onClick={() => closeOnOverlayClick && onClose()}>
      <div data-testid="modal-content" className={`modal-${size}`} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div data-testid="modal-header">
            <h2>{title}</h2>
            <button data-testid="modal-close-btn" onClick={onClose} aria-label="Close modal">
              ×
            </button>
          </div>
        )}
        <div data-testid="modal-body">{children}</div>
        {footer && <div data-testid="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

describe('Modal Component', () => {
  it('does not render when closed', () => {
    render(
      <MockModal isOpen={false} onClose={vi.fn()}>
        Modal content
      </MockModal>
    );
    expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
  });

  it('renders when open', () => {
    render(
      <MockModal isOpen={true} onClose={vi.fn()}>
        Modal content
      </MockModal>
    );
    expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
    expect(screen.getByTestId('modal-body')).toHaveTextContent('Modal content');
  });

  it('renders with title', () => {
    render(
      <MockModal isOpen={true} onClose={vi.fn()} title="Confirm Action">
        Content
      </MockModal>
    );
    expect(screen.getByTestId('modal-header')).toBeInTheDocument();
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
  });

  it('renders with footer', () => {
    render(
      <MockModal isOpen={true} onClose={vi.fn()} footer={<button>Save</button>}>
        Content
      </MockModal>
    );
    expect(screen.getByTestId('modal-footer')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('calls onClose when clicking close button', () => {
    const handleClose = vi.fn();
    render(
      <MockModal isOpen={true} onClose={handleClose} title="Test">
        Content
      </MockModal>
    );
    fireEvent.click(screen.getByTestId('modal-close-btn'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('closes on overlay click when enabled', () => {
    const handleClose = vi.fn();
    render(
      <MockModal isOpen={true} onClose={handleClose} closeOnOverlayClick={true}>
        Content
      </MockModal>
    );
    fireEvent.click(screen.getByTestId('modal-overlay'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not close on overlay click when disabled', () => {
    const handleClose = vi.fn();
    render(
      <MockModal isOpen={true} onClose={handleClose} closeOnOverlayClick={false}>
        Content
      </MockModal>
    );
    fireEvent.click(screen.getByTestId('modal-overlay'));
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('does not close when clicking modal content', () => {
    const handleClose = vi.fn();
    render(
      <MockModal isOpen={true} onClose={handleClose}>
        Content
      </MockModal>
    );
    fireEvent.click(screen.getByTestId('modal-body'));
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(
      <MockModal isOpen={true} onClose={vi.fn()} size="sm">
        Small
      </MockModal>
    );
    expect(screen.getByTestId('modal-content')).toHaveClass('modal-sm');

    rerender(
      <MockModal isOpen={true} onClose={vi.fn()} size="lg">
        Large
      </MockModal>
    );
    expect(screen.getByTestId('modal-content')).toHaveClass('modal-lg');

    rerender(
      <MockModal isOpen={true} onClose={vi.fn()} size="xl">
        Extra Large
      </MockModal>
    );
    expect(screen.getByTestId('modal-content')).toHaveClass('modal-xl');
  });

  it('renders complex content', () => {
    render(
      <MockModal isOpen={true} onClose={vi.fn()} title="Student Form">
        <form data-testid="student-form">
          <input data-testid="name-input" placeholder="Name" />
          <input data-testid="roll-input" placeholder="Roll Number" />
        </form>
      </MockModal>
    );
    expect(screen.getByTestId('student-form')).toBeInTheDocument();
    expect(screen.getByTestId('name-input')).toBeInTheDocument();
    expect(screen.getByTestId('roll-input')).toBeInTheDocument();
  });

  it('renders with action buttons in footer', () => {
    render(
      <MockModal
        isOpen={true}
        onClose={vi.fn()}
        title="Delete?"
        footer={
          <>
            <button data-testid="cancel-btn">Cancel</button>
            <button data-testid="confirm-btn">Delete</button>
          </>
        }
      >
        Are you sure?
      </MockModal>
    );
    expect(screen.getByTestId('cancel-btn')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-btn')).toBeInTheDocument();
  });
});

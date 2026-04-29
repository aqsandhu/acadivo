import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../test-utils';
import { Modal } from '@/components/ui/Modal';

describe('Modal Component (Real)', () => {
  it('does not render when open is false', () => {
    render(
      <Modal open={false} onClose={vi.fn()}>
        Modal Content
      </Modal>
    );
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('renders when open is true', () => {
    render(
      <Modal open={true} onClose={vi.fn()}>
        Modal Content
      </Modal>
    );
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('renders with title and description', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Modal Title" description="Modal Description">
        Body
      </Modal>
    );
    expect(screen.getByText('Modal Title')).toBeInTheDocument();
    expect(screen.getByText('Modal Description')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} onClose={handleClose}>
        Content
      </Modal>
    );
    const closeBtn = screen.getByLabelText('Close dialog');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} onClose={handleClose}>
        Content
      </Modal>
    );
    const backdrop = screen.getByText('Content').parentElement?.previousElementSibling;
    if (backdrop) fireEvent.click(backdrop);
    expect(handleClose).toHaveBeenCalled();
  });

  it('does not show close button when showCloseButton is false', () => {
    render(
      <Modal open={true} onClose={vi.fn()} showCloseButton={false}>
        Content
      </Modal>
    );
    expect(screen.queryByLabelText('Close dialog')).not.toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(
      <Modal open={true} onClose={vi.fn()} size="sm" title="Small">
        Small modal
      </Modal>
    );
    expect(screen.getByText('Small modal')).toBeInTheDocument();

    rerender(
      <Modal open={true} onClose={vi.fn()} size="lg" title="Large">
        Large modal
      </Modal>
    );
    expect(screen.getByText('Large modal')).toBeInTheDocument();
  });

  it('renders footer content', () => {
    render(
      <Modal open={true} onClose={vi.fn()} footer={<button>Save</button>}>
        Body
      </Modal>
    );
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('has dialog role for accessibility', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Accessible">
        Accessible content
      </Modal>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

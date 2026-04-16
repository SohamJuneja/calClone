import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../ui/Modal';

describe('<Modal />', () => {
  const onClose = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('does not render when isOpen=false', () => {
    render(
      <Modal isOpen={false} onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>,
    );
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
  });

  it('renders when isOpen=true', () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="Hello Modal">
        <p>Modal body</p>
      </Modal>,
    );
    expect(screen.getByText('Hello Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal body')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="T" description="Some description">
        <p>Body</p>
      </Modal>,
    );
    expect(screen.getByText('Some description')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="T">
        <p>Body</p>
      </Modal>,
    );
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape is pressed', () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="T">
        <p>Body</p>
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('applies correct size class for lg', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={onClose} size="lg">
        <p>Big modal</p>
      </Modal>,
    );
    expect(container.querySelector('.max-w-2xl')).toBeInTheDocument();
  });
});

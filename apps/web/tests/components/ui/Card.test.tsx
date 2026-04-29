import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../test-utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

describe('Card Component (Real)', () => {
  it('renders Card with content', () => {
    render(
      <Card data-testid="card">
        <CardContent>Card Body</CardContent>
      </Card>
    );
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByText('Card Body')).toBeInTheDocument();
  });

  it('renders full Card structure', () => {
    render(
      <Card data-testid="full-card">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card Content</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>
    );
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
    expect(screen.getByText('Card Footer')).toBeInTheDocument();
  });

  it('applies custom className to Card', () => {
    render(<Card className="custom-card" data-testid="styled-card">Styled</Card>);
    expect(screen.getByTestId('styled-card')).toHaveClass('custom-card');
  });

  it('CardHeader renders with proper structure', () => {
    render(
      <Card>
        <CardHeader data-testid="header">
          <CardTitle>Title</CardTitle>
        </CardHeader>
      </Card>
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('CardContent renders children', () => {
    render(
      <Card>
        <CardContent>
          <p data-testid="paragraph">Paragraph</p>
        </CardContent>
      </Card>
    );
    expect(screen.getByTestId('paragraph')).toBeInTheDocument();
  });

  it('renders complex nested content', () => {
    render(
      <Card data-testid="complex-card">
        <CardHeader>
          <CardTitle>Student Profile</CardTitle>
          <CardDescription>View student details</CardDescription>
        </CardHeader>
        <CardContent>
          <div data-testid="student-name">John Doe</div>
          <div data-testid="student-grade">Grade 10</div>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    );
    expect(screen.getByTestId('complex-card')).toBeInTheDocument();
    expect(screen.getByTestId('student-name')).toHaveTextContent('John Doe');
    expect(screen.getByTestId('student-grade')).toHaveTextContent('Grade 10');
  });
});

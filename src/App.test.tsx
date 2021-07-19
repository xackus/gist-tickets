import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

test('renders title', () => {
  render(<App />);
  const titleElement = screen.getByText('Tickety');
  expect(titleElement).toBeInTheDocument();
});

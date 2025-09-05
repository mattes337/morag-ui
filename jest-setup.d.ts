import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(...classNames: string[]): R;
      toHaveAttribute(name: string, value?: string): R;
      toHaveTextContent(text: string): R;
      toBeDisabled(): R;
      toHaveLength(length: number): R;
      toHaveStyle(style: Record<string, any> | string): R;
    }
  }
}
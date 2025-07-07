import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import WS from 'jest-websocket-mock';
import LiveKPIs from './LiveKPIs';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

// Mock the recharts library to avoid rendering errors in a JSDOM environment
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: '100%', height: '100%' }}>{children}</div>
    ),
  };
});

describe('LiveKPIs', () => {
  let server: WS;

  beforeEach(() => {
    server = new WS('ws://localhost:3000');
  });

  afterEach(() => {
    WS.clean();
    if (server && server.server) {
      server.server.close();
    }
  });

  test('should connect to WebSocket and display metrics', async () => {
    jest.setTimeout(10000);
    const theme = extendTheme();
    render(
      <ChakraProvider theme={theme}>
        <LiveKPIs />
      </ChakraProvider>
    );

    // Wait for the connection to be established
    await server.connected;
    console.log('Mock WebSocket server connected.');

    // Initial state
    expect(screen.getByText('Connecting to metrics stream...')).toBeInTheDocument();

    // Send mock data
    const mockMetrics = {
      slaPercentage: 0.95,
      messagesPerMinute: 20,
      sentiment: { positive: 50, negative: 10, neutral: 40 },
    };
    server.send(JSON.stringify(mockMetrics));

    // Wait for the component to update and assert the new state
    await waitFor(() => {
      // Check for SLA percentage, formatted to 2 decimal places by the component
      expect(screen.getByText('0.95%')).toBeInTheDocument();
      // Check for Messages/Min, also formatted
      expect(screen.getByText('20.00')).toBeInTheDocument();
    });

    // Ensure the connecting message is gone
    expect(screen.queryByText('Connecting to metrics stream...')).not.toBeInTheDocument();
  });
});

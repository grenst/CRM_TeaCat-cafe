import React, { useEffect, useState, useRef } from 'react';
import { Box, Text, SimpleGrid } from '@chakra-ui/react';
import { Stat, StatLabel, StatNumber, StatHelpText, StatArrow } from '@chakra-ui/stat';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface MetricsData {
  messagesPerMinute: number;
  slaPercentage: number;
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

const COLORS = ['#0088FE', '#FFBB28', '#FF8042'];

const LiveKPIs: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Only create a new WebSocket if one doesn't already exist
    if (!wsRef.current) {
      const ws = new WebSocket('ws://localhost:3000');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to WebSocket');
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data: MetricsData = JSON.parse(event.data);
          setMetrics(data);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
          setError('Failed to parse metrics data.');
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('WebSocket connection error.');
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setError('WebSocket disconnected.');
      };
    }

    return () => {
      // This cleanup runs when the component unmounts.
      // In Strict Mode, it runs after the first render, and then the effect runs again.
      // We only want to close the WebSocket if it's still the one we created.
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      // Crucially, do NOT set wsRef.current = null here.
      // This allows the ref to persist across Strict Mode's double invocation.
      // It will only be truly null when the component unmounts and the ref is garbage collected.
    };
  }, []);

  const sentimentData = (metrics && metrics.sentiment) ? [
    { name: 'Positive', value: metrics.sentiment.positive },
    { name: 'Negative', value: metrics.sentiment.negative },
    { name: 'Neutral', value: metrics.sentiment.neutral },
  ] : [];

  return (
    <Box p={4}>
      <Text fontSize="2xl" mb={4}>Live KPIs</Text>
      {error && <Text color="red.500">Error: {error}</Text>}
      {!metrics && !error && <Text>Connecting to metrics stream...</Text>}

      {metrics && (
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
          <Stat>
            <StatLabel>Messages/Min</StatLabel>
            <StatNumber>{metrics.messagesPerMinute.toFixed(2)}</StatNumber>
            <StatHelpText>
              <StatArrow type='increase' />
              Real-time
            </StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>SLA %</StatLabel>
            <StatNumber>{metrics.slaPercentage.toFixed(2)}%</StatNumber>
            <StatHelpText>
              <StatArrow type='increase' />
              Real-time
            </StatHelpText>
          </Stat>

          <Box>
            <Text fontSize="lg" mb={2}>Sentiment</Text>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </SimpleGrid>
      )}
    </Box>
  );
};

export default LiveKPIs;
import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000/metrics');

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

    return () => {
      ws.close();
    };
  }, []);

  const sentimentData = metrics ? [
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

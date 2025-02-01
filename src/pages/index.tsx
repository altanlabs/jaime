import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_in_7d: {
    price: number[];
  };
}

interface ChartData {
  value: number;
  index: number;
  timestamp: string;
}

interface SelectedPoints {
  [key: string]: {
    start: number;
    end: number;
  } | undefined;
}

export default function CryptoPage() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [selectedPoints, setSelectedPoints] = useState<SelectedPoints>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true'
        );
        const data = await response.json();
        setCryptoData(data);
      } catch (error) {
        console.error('Error fetching crypto data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseDown = (cryptoId: string, value: number) => {
    setSelectedPoints(prev => ({
      ...prev,
      [cryptoId]: { start: value, end: value }
    }));
  };

  const handleMouseMove = (cryptoId: string, value: number) => {
    if (selectedPoints[cryptoId]) {
      setSelectedPoints(prev => ({
        ...prev,
        [cryptoId]: { ...prev[cryptoId]!, end: value }
      }));
    }
  };

  const handleMouseUp = () => {
    // Mantener los puntos seleccionados
  };

  const calculateGrowth = (start: number, end: number) => {
    return ((end - start) / start * 100).toFixed(2);
  };

  const formatTimestamp = (index: number) => {
    const date = new Date();
    date.setDate(date.getDate() - (168 - index) / 24); // 168 horas = 7 días
    return date.toLocaleDateString();
  };

  const CustomTooltip = ({ active, payload, cryptoId }: any) => {
    if (active && payload && payload.length) {
      const currentValue = payload[0].value;
      const selectedRange = selectedPoints[cryptoId];
      
      return (
        <div className="bg-blue-900/90 p-4 rounded-lg shadow-lg border border-blue-500/30">
          <p className="text-blue-200">Precio: ${currentValue.toFixed(2)}</p>
          <p className="text-blue-200">Fecha: {formatTimestamp(payload[0].payload.index)}</p>
          {selectedRange && (
            <p className="text-blue-200">
              Cambio: {calculateGrowth(selectedRange.start, selectedRange.end)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black p-6">
      <h1 className="text-4xl font-bold text-blue-400 mb-8 text-center">
        Crypto Dashboard
      </h1>
      <p className="text-center text-blue-300 mb-8">
        Arrastra en el gráfico para medir el % de crecimiento entre dos puntos
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cryptoData.map((crypto) => {
          const chartData: ChartData[] = crypto.sparkline_in_7d.price.map((price, index) => ({
            value: price,
            index,
            timestamp: formatTimestamp(index),
          }));

          const selected = selectedPoints[crypto.id];

          return (
            <motion.div
              key={crypto.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-6 bg-blue-900/20 backdrop-blur-lg border-blue-500/30 hover:border-blue-400/50 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-300">{crypto.name}</h2>
                    <p className="text-blue-400 uppercase">{crypto.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-200">
                      ${crypto.current_price.toLocaleString()}
                    </p>
                    <p
                      className={`${
                        crypto.price_change_percentage_24h >= 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {crypto.price_change_percentage_24h.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      onMouseDown={(e) => e && handleMouseDown(crypto.id, e.activePayload?.[0].value)}
                      onMouseMove={(e) => e && handleMouseMove(crypto.id, e.activePayload?.[0].value)}
                      onMouseUp={handleMouseUp}
                    >
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#60A5FA"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6, fill: "#93C5FD" }}
                      />
                      <XAxis 
                        dataKey="timestamp"
                        hide 
                      />
                      <YAxis hide domain={['auto', 'auto']} />
                      <Tooltip
                        content={<CustomTooltip cryptoId={crypto.id} />}
                      />
                      {selected && (
                        <>
                          <ReferenceLine
                            y={selected.start}
                            stroke="#60A5FA"
                            strokeDasharray="3 3"
                          />
                          <ReferenceLine
                            y={selected.end}
                            stroke="#60A5FA"
                            strokeDasharray="3 3"
                          />
                        </>
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {selected && (
                  <div className="mt-4 text-center text-blue-300">
                    Crecimiento: {calculateGrowth(selected.start, selected.end)}%
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
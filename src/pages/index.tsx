import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Clock } from '@/components/blocks/clock';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
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

export default function CryptoPage() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true'
        );
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        console.log('Fetched data:', data); // Para debugging
        setCryptoData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (value: number) => {
    if (value >= 1000) {
      return `$${value.toLocaleString()}`;
    } else if (value >= 1) {
      return `$${value.toFixed(2)}`;
    } else {
      return `$${value.toFixed(6)}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black p-6 flex items-center justify-center">
        <div className="text-blue-400 text-xl">Cargando datos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black p-6 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black p-6">
      <Clock />
      <h1 className="text-4xl font-bold text-blue-400 mb-8 text-center">
        Crypto Dashboard
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cryptoData.map((crypto) => {
          const chartData = crypto.sparkline_in_7d.price.map((price, index) => ({
            time: index,
            price: price
          }));

          return (
            <motion.div
              key={crypto.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-6 bg-blue-900/20 backdrop-blur-lg border-blue-500/30">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-300">{crypto.name}</h2>
                    <p className="text-blue-400 uppercase">{crypto.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-200">
                      {formatPrice(crypto.current_price)}
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

                <div className="h-[200px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#60A5FA"
                        strokeWidth={2}
                        dot={false}
                      />
                      <XAxis dataKey="time" hide />
                      <YAxis
                        orientation="right"
                        tick={{ fill: '#93C5FD' }}
                        tickFormatter={formatPrice}
                      />
                      <Tooltip
                        formatter={(value: number) => [formatPrice(value), 'Precio']}
                        contentStyle={{
                          backgroundColor: 'rgba(30, 58, 138, 0.9)',
                          border: '1px solid rgba(96, 165, 250, 0.3)',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#93C5FD' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
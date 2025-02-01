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
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';
import { RSI } from 'technicalindicators';

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

type TimeFrame = '1H' | '4H' | '1D' | '1W';

export default function CryptoPage() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1D');
  const [showRSI, setShowRSI] = useState<boolean>(true);

  const calculateRSI = (prices: number[]): number[] => {
    const rsi = new RSI({
      values: prices,
      period: 14
    });
    return rsi.getResult();
  };

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

  useEffect(() => {
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

  const calculateYDomain = (prices: number[]) => {
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const price = payload[0].value;
      const rsi = payload[1]?.value;
      
      return (
        <div className="bg-blue-900/90 p-4 rounded-lg shadow-lg border border-blue-500/30">
          <p className="text-blue-200">Precio: {formatPrice(price)}</p>
          {rsi && <p className="text-blue-200">RSI: {rsi.toFixed(2)}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black p-6">
      <Clock />
      <h1 className="text-4xl font-bold text-blue-400 mb-8 text-center">
        Crypto Dashboard
      </h1>
      <div className="flex justify-center gap-4 mb-8">
        <Button
          onClick={() => setShowRSI(!showRSI)}
          variant={showRSI ? "default" : "outline"}
          className={`${showRSI ? 'bg-blue-600' : 'text-blue-400'}`}
        >
          RSI
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cryptoData.map((crypto) => {
          const prices = crypto.sparkline_in_7d.price;
          const rsiValues = calculateRSI(prices);
          const yDomain = calculateYDomain(prices);
          
          const chartData = prices.map((price, index) => ({
            price,
            rsi: rsiValues[index] || 0,
          }));

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
                <div className="flex flex-col gap-2">
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData}>
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke="#60A5FA"
                          strokeWidth={2}
                          dot={false}
                        />
                        <XAxis hide />
                        <YAxis 
                          orientation="right"
                          domain={yDomain}
                          tick={{ fill: '#93C5FD' }}
                          tickFormatter={formatPrice}
                          width={80}
                        />
                        <Tooltip content={<CustomTooltip />} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {showRSI && (
                    <div className="h-[100px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData}>
                          <XAxis hide />
                          <YAxis
                            domain={[0, 100]}
                            orientation="right"
                            tick={{ fill: '#93C5FD' }}
                            tickCount={5}
                            width={40}
                          />
                          <ReferenceLine y={30} stroke="#60A5FA" strokeDasharray="3 3" />
                          <ReferenceLine y={70} stroke="#60A5FA" strokeDasharray="3 3" />
                          <Area
                            type="monotone"
                            dataKey="rsi"
                            stroke="#F87171"
                            fill="#F87171"
                            fillOpacity={0.2}
                          />
                          <Tooltip content={<CustomTooltip />} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
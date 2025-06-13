
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getSales } from '@/integrations/supabase/db';
import type { Database } from '@/integrations/supabase/types';

type Sale = Database['public']['Tables']['sales']['Row'];

interface ChartData {
  name: string;
  penjualan: number;
  margin: number;
}

interface FlexibleChartProps {
  title: string;
  description: string;
  dataKey: 'penjualan' | 'margin';
  chartType: 'bar' | 'line';
}

const FlexibleChart: React.FC<FlexibleChartProps> = ({ title, description, dataKey, chartType }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [period, setPeriod] = useState('daily');
  const [timeRange, setTimeRange] = useState('current');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSales = async () => {
      try {
        setLoading(true);
        const salesData = await getSales();
        setSales(salesData || []);
      } catch (error) {
        console.error('Error loading sales data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, []);

  const chartData = useMemo(() => {
    if (!sales.length) return [];

    const now = new Date();
    const data: ChartData[] = [];

    if (period === 'daily') {
      const days = 7;
      const startDate = new Date(now);
      
      if (timeRange === 'previous') {
        startDate.setDate(now.getDate() - (days * 2));
      } else {
        startDate.setDate(now.getDate() - days);
      }

      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
        const daySales = sales.filter(s => {
          const saleDate = new Date(s.sale_date);
          return saleDate.toDateString() === date.toDateString() && s.status === 'completed';
        });

        data.push({
          name: dayName,
          penjualan: daySales.reduce((sum, sale) => sum + sale.total_amount, 0),
          margin: daySales.reduce((sum, sale) => sum + sale.total_margin, 0)
        });
      }
    } else if (period === 'weekly') {
      const weeks = 4;
      for (let i = 0; i < weeks; i++) {
        const weekStart = new Date(now);
        const weekOffset = timeRange === 'previous' ? weeks + i : i;
        weekStart.setDate(now.getDate() - (weekOffset * 7));
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const weekSales = sales.filter(s => {
          const saleDate = new Date(s.sale_date);
          return saleDate >= weekStart && saleDate <= weekEnd && s.status === 'completed';
        });

        data.push({
          name: `Minggu ${weeks - i}`,
          penjualan: weekSales.reduce((sum, sale) => sum + sale.total_amount, 0),
          margin: weekSales.reduce((sum, sale) => sum + sale.total_margin, 0)
        });
      }
    } else if (period === 'monthly') {
      const months = 6;
      for (let i = 0; i < months; i++) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - (timeRange === 'previous' ? months + i : i), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - (timeRange === 'previous' ? months + i : i) + 1, 0);

        const monthSales = sales.filter(s => {
          const saleDate = new Date(s.sale_date);
          return saleDate >= monthStart && saleDate <= monthEnd && s.status === 'completed';
        });

        data.push({
          name: monthStart.toLocaleDateString('id-ID', { month: 'short' }),
          penjualan: monthSales.reduce((sum, sale) => sum + sale.total_amount, 0),
          margin: monthSales.reduce((sum, sale) => sum + sale.total_margin, 0)
        });
      }
    } else if (period === 'yearly') {
      const years = 3;
      for (let i = 0; i < years; i++) {
        const year = now.getFullYear() - (timeRange === 'previous' ? years + i : i);
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year, 11, 31);

        const yearSales = sales.filter(s => {
          const saleDate = new Date(s.sale_date);
          return saleDate >= yearStart && saleDate <= yearEnd && s.status === 'completed';
        });

        data.push({
          name: year.toString(),
          penjualan: yearSales.reduce((sum, sale) => sum + sale.total_amount, 0),
          margin: yearSales.reduce((sum, sale) => sum + sale.total_margin, 0)
        });
      }
    }

    return data.reverse();
  }, [sales, period, timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Harian</SelectItem>
                <SelectItem value="weekly">Mingguan</SelectItem>
                <SelectItem value="monthly">Bulanan</SelectItem>
                <SelectItem value="yearly">Tahunan</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Sekarang</SelectItem>
                <SelectItem value="previous">Sebelumnya</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'bar' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
              <Bar dataKey={dataKey} fill={dataKey === 'penjualan' ? '#3b82f6' : '#10b981'} />
            </BarChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={dataKey === 'penjualan' ? '#3b82f6' : '#10b981'} 
                strokeWidth={2} 
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default FlexibleChart;

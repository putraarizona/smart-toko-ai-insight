
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Send, Sparkles, HelpCircle, TrendingUp, Package } from 'lucide-react';

const SmartAssistant = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Selamat datang di SmartToko AI Assistant! 🤖 Saya siap membantu Anda menganalisis data toko. Apa yang ingin Anda ketahui?'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const suggestedQueries = [
    "Produk mana yang paling untung bulan ini?",
    "Berapa stok MP-XK-M32-C minggu ini?",
    "Tampilkan barang yang stoknya di bawah 10",
    "Analisis penjualan kategori baby care",
    "Prediksi restock untuk minggu depan",
    "Supplier mana yang paling murah untuk diaper?"
  ];

  const handleSendQuery = () => {
    if (!query.trim()) return;

    setIsLoading(true);
    const newUserMessage = {
      id: messages.length + 1,
      type: 'user',
      content: query
    };

    setMessages(prev => [...prev, newUserMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(query);
      const newAIMessage = {
        id: messages.length + 2,
        type: 'assistant',
        content: aiResponse
      };
      
      setMessages(prev => [...prev, newAIMessage]);
      setIsLoading(false);
    }, 1500);

    setQuery('');
  };

  const generateAIResponse = (userQuery: string) => {
    const lowerQuery = userQuery.toLowerCase();
    
    if (lowerQuery.includes('paling untung') || lowerQuery.includes('profit')) {
      return `📊 **Analisis Profitabilitas Bulan Ini:**

**Top 3 Produk Paling Menguntungkan:**
1. **MP-XK-M32-C** (Baby Milk Powder Premium)
   - Margin: 42.5% | Laba: Rp 1,250,000
   
2. **BP-XT-L45-A** (Baby Bottle Set)
   - Margin: 38.2% | Laba: Rp 890,000
   
3. **KD-MN-S12-B** (Kids Diaper Large)
   - Margin: 35.8% | Laba: Rp 720,000

💡 **Rekomendasi:** Focus marketing pada kategori Baby Care karena memiliki margin tertinggi!`;
    }
    
    if (lowerQuery.includes('mp-xk-m32-c') || lowerQuery.includes('stok')) {
      return `📦 **Status Stok MP-XK-M32-C:**

**Minggu Ini:**
- Stok Awal: 45 unit
- Penjualan: 30 unit
- **Stok Tersisa: 15 unit** ⚠️

**Prediksi & Rekomendasi:**
- Rata-rata penjualan: 5.2 unit/hari
- Prediksi habis: 2-3 hari
- **Perlu restock 50+ unit segera!**

🔍 **Supplier Terbaik:** CV Mitra Jaya (Rp 85,000/unit)`;
    }
    
    if (lowerQuery.includes('stok') && lowerQuery.includes('bawah')) {
      return `🚨 **Produk dengan Stok < 10:**

1. **KD-MN-S12-B** - 8 unit (Kritis!)
2. **TP-MN-X45-Z** - 6 unit (Kritis!)
3. **BF-KL-W23-R** - 9 unit (Rendah)

**Total:** 3 produk perlu attention segera

📋 **Action Items:**
- Restock KD-MN-S12-B minimum 50 unit
- Contact supplier untuk TP-MN-X45-Z
- Monitor BF-KL-W23-R closely`;
    }
    
    if (lowerQuery.includes('baby care') || lowerQuery.includes('kategori')) {
      return `👶 **Analisis Kategori Baby Care:**

**Performance Bulan Ini:**
- Total Sales: Rp 4,250,000 (↑15% vs bulan lalu)
- Margin Rate: 36.8%
- Best Seller: Baby Milk Powder Premium

**Trend Analysis:**
- Puncak penjualan: Hari Jumat & Sabtu
- Growth rate: +15% month-over-month
- Customer retention: 78%

🎯 **Opportunity:** Tambah varian premium untuk meningkatkan AOV!`;
    }
    
    return `🤖 Terima kasih atas pertanyaan Anda! Saya sedang memproses data untuk memberikan insight yang akurat. 

Beberapa hal yang bisa saya bantu:
- Analisis profitabilitas produk
- Status stok real-time
- Prediksi restock
- Perbandingan supplier
- Trend penjualan

Silakan tanyakan hal yang lebih spesifik untuk mendapatkan insight yang lebih detail! 📊`;
  };

  const handleSuggestedQuery = (suggestion: string) => {
    setQuery(suggestion);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Brain className="w-8 h-8 text-smart-purple" />
            <span>Smart Assistant</span>
          </h1>
          <p className="text-gray-600 mt-1">AI-powered assistant untuk analisis bisnis real-time</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="smart-card h-[600px] flex flex-col">
            <CardHeader className="bg-gradient-smart text-white rounded-t-xl">
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>SmartToko AI</span>
                <div className="flex items-center space-x-1 ml-auto">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Online</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-smart-blue text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-900 rounded-bl-none'
                      }`}
                    >
                      <div className="whitespace-pre-line text-sm">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-4 rounded-lg rounded-bl-none">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-600">AI sedang berpikir...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Tanyakan apa saja tentang toko Anda..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendQuery()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendQuery}
                    disabled={!query.trim() || isLoading}
                    className="smart-button"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Questions */}
          <Card className="smart-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-smart-orange" />
                <span>Pertanyaan Populer</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedQueries.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuery(suggestion)}
                  className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="smart-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-smart-green" />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">Penjualan Hari Ini</p>
                <p className="text-lg font-bold text-green-900">Rp 2.45M</p>
                <p className="text-xs text-green-600">↑ 12% vs kemarin</p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Total Produk</p>
                <p className="text-lg font-bold text-blue-900">1,247</p>
                <p className="text-xs text-blue-600">23 perlu restock</p>
              </div>
              
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-sm font-medium text-orange-800">Margin Rata-rata</p>
                <p className="text-lg font-bold text-orange-900">34.7%</p>
                <p className="text-xs text-orange-600">Target: 35%</p>
              </div>
            </CardContent>
          </Card>

          {/* AI Features */}
          <Card className="smart-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-smart-purple" />
                <span>AI Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3 p-2 bg-purple-50 rounded-lg">
                <Package className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Auto Categorization</p>
                  <p className="text-xs text-gray-600">Produk baru otomatis dikategorikan</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Smart Pricing</p>
                  <p className="text-xs text-gray-600">Rekomendasi harga optimal</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                <Sparkles className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Predictive Analytics</p>
                  <p className="text-xs text-gray-600">Prediksi demand & trends</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SmartAssistant;

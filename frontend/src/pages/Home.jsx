import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, TrendingDown, Zap, Shield } from 'lucide-react';

function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="container mx-auto px-4 py-6">
                <nav className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Smart Deal Finder
                    </h1>
                    <div className="space-x-4">
                        <Link
                            to="/login"
                            className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition"
                        >
                            Log In
                        </Link>
                        <Link
                            to="/signup"
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
                        >
                            Sign Up
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <main className="container mx-auto px-4 py-20">
                <div className="text-center max-w-4xl mx-auto">
                    <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                        Find the <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Best Deals</span>
                        <br />
                        Across Every Platform
                    </h2>
                    <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                        AI-powered shopping assistant that compares prices from Amazon, Flipkart, eBay, and more to save you money on every purchase.
                    </p>

                    <button
                        onClick={() => navigate('/signup')}
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition shadow-lg hover:shadow-xl"
                    >
                        Start Saving Now
                    </button>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
                    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            <Search className="text-blue-600" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Smart Search</h3>
                        <p className="text-gray-600">
                            AI-powered product matching across multiple e-commerce platforms for accurate results.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                            <TrendingDown className="text-purple-600" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Best Prices</h3>
                        <p className="text-gray-600">
                            Real-time price comparison showing you the lowest prices and best deals available.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <Zap className="text-green-600" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Instant Results</h3>
                        <p className="text-gray-600">
                            Get price comparisons in seconds through our conversational AI chatbot interface.
                        </p>
                    </div>
                </div>

                {/* Supported Platforms */}
                <div className="mt-20 text-center">
                    <p className="text-gray-500 mb-6">Comparing prices across</p>
                    <div className="flex flex-wrap justify-center gap-8">
                        {['Amazon', 'Flipkart', 'eBay', 'Snapdeal', 'Myntra', 'Croma'].map((platform) => (
                            <div key={platform} className="px-6 py-3 bg-white rounded-lg shadow font-semibold text-gray-700">
                                {platform}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Home;

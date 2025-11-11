import React, { useState } from 'react';
import { PDCIcon } from './icons/Icons';

interface LoginScreenProps {
    onLogin: (email: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoginMode, setIsLoginMode] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple validation for mock login
        if (email.trim() && password.trim()) {
            onLogin(email);
        } else {
            alert("Please enter both email and password.");
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                     <PDCIcon />
                     <h1 className="text-3xl font-bold text-gray-200 mt-4">PDCI Dashboard</h1>
                     <p className="text-gray-400">Institutional-Grade Data Center Supply Chain Intelligence</p>
                </div>

                <div className="glass-panel p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="user@pdci.ai"
                                className="w-full mt-1 bg-black/20 border border-white/10 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                                required
                            />
                        </div>
                         <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-400">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full mt-1 bg-black/20 border border-white/10 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                                required
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="w-full neuro-button bg-accent-blue text-white font-bold py-3 px-4 transition-transform hover:scale-105"
                            >
                                {isLoginMode ? 'Login' : 'Create Account'}
                            </button>
                        </div>
                    </form>

                     <div className="text-center mt-6">
                        <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-sm text-gray-400 hover:text-accent-blue hover:underline">
                            {isLoginMode ? 'Need an account? Sign Up' : 'Already have an account? Login'}
                        </button>
                    </div>
                </div>
                <p className="text-center text-xs text-gray-600 mt-6">
                    Special access required. For institutional inquiries, contact PDCI.
                    <br />
                    Admin access: admin@pdci.ai
                </p>
            </div>
        </div>
    );
};

export default LoginScreen;

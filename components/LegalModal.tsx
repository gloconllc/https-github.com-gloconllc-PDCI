/*
 * PDCI: Institutional-Grade Data Center Supply Chain Intelligence
 *
 * Core logic and intellectual property by Wilton John Picou, III, Co-Founder of GloCon Solutions, LLLC.
 *
 * This software is for institutional use only. All rights reserved.
 */
import React from 'react';
import { CloseIcon, ShieldIcon } from './icons/Icons';

interface LegalModalProps {
    onClose: () => void;
}

const LegalModal: React.FC<LegalModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="legal-modal-title">
            <div className="glass-panel w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center">
                    <h2 id="legal-modal-title" className="text-xl font-bold text-gray-100 flex items-center gap-2">
                        <ShieldIcon />
                        Legal & Compliance Center
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-white/10" aria-label="Close Legal & Compliance modal">
                        <CloseIcon />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto text-sm text-gray-300">
                    <div className="space-y-6">
                        <section>
                            <h3 className="font-bold text-lg text-accent-blue mb-2">Proprietary Notice & Intellectual Property</h3>
                            <p>This software, the PDCI Dashboard, including its source code, algorithms, data structures, proprietary metrics (including but not limited to Universal Score, Criticality, SCSI, Graham Score, Psych Score, and Buy Rank), and user interface, constitutes the exclusive intellectual property of Wilton John Picou, III, and GloCon Solutions, LLLC. All rights are reserved worldwide. This software is a trade secret and is protected by copyright law and international treaties. Unauthorized reproduction, reverse engineering, decompilation, disassembly, or distribution of this software, or any portion of it, is strictly prohibited and may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under the law.</p>
                        </section>

                        <section>
                            <h3 className="font-bold text-lg text-accent-blue mb-2">PDCI Core Philosophy (The Algorithm)</h3>
                            <p>The analytical engine of this platform is built upon a multi-disciplinary curriculum inspired by advanced degrees (MBA, PhD) in Finance and Statistics, combined with principles of behavioral psychology. This philosophy is executed through a historical framework that analyzes past technological revolutions—from the Industrial Revolution's steam power and the PC boom's microprocessors to the dot-com era's internet infrastructure. By identifying the "picks and shovels" (e.g., the steel for railways, the silicon for chips) that enabled these past booms, the PDCI algorithm pinpoints the analogous, critical suppliers for today's AI infrastructure buildout.</p>
                            <p className="mt-2">The overarching strategy is to identify "outlier" opportunities by performing exceptionally granular analysis of the global data center supply chain. This is metaphorically akin to observing two data center parking lots and questioning not just the similarities (e.g., solar panels), but the entire supply chain behind those components—from the publicly-traded paint company whose coatings are used, to the specific plastics in a server rack panel, and the manufacturer of that plastic. This "go deeper than the norm" approach, combined with a "psychology score" based on purchasing behaviors and historical cultural theories, allows the PDCI algorithm to determine confidence levels with a unique, proprietary edge. This system is designed to move beyond obvious "blue-chip" analysis and uncover the critical, often overlooked, nodes of the supply chain where true value and risk reside. This complex algorithmic framework is not static; it is continuously refined with each data scrape and analysis cycle, ensuring the platform's strategic edge adapts to an ever-changing market landscape.</p>
                        </section>
                        
                        <section>
                            <h3 className="font-bold text-lg text-gray-200 mb-2">Investment Philosophy: Active vs. Passive</h3>
                            <p>Modern investing is largely defined by two opposing philosophies: active management and passive (index) investing. Understanding this dichotomy is crucial to leveraging the PDCI Dashboard effectively.</p>
                            <h4 className="font-semibold text-gray-100 mt-3">The Rise of Passive Investing</h4>
                            <p className="mt-1">Pioneered by John C. Bogle of Vanguard, who launched the first public index fund in 1976, passive investing was a revolutionary idea. Instead of trying to beat the market by picking individual stocks, an index fund simply aims to match the performance of a broad market index, like the S&P 500. This strategy, once derided as "Bogle's Folly," has grown into a multi-trillion dollar industry based on a few powerful advantages:</p>
                            <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                                <li><strong>Low Costs:</strong> Index funds have extremely low expense ratios because they don't require expensive teams of analysts.</li>
                                <li><strong>Diversification:</strong> A single fund can provide ownership in hundreds or thousands of companies, reducing single-stock risk.</li>
                                <li><strong>Proven Performance:</strong> Decades of data show that the majority of active fund managers (often 85% or more) fail to outperform their benchmark index over long periods. For most investors, a low-cost index fund is a statistically superior strategy.</li>
                            </ul>
                             <h4 className="font-semibold text-gray-100 mt-3">The PDCI Approach: A Tool for Active Alpha Generation</h4>
                             <p className="mt-1">The PDCI Dashboard is fundamentally a tool for sophisticated <strong className="text-accent-blue">active management</strong>. It operates on the premise that while the market as a whole is difficult to beat, specific, deeply researched opportunities exist for investors willing to perform granular due diligence. Our philosophy is not to dispute the effectiveness of passive investing, but to provide the institutional-grade intelligence required to be in the minority of active investors who <strong className="text-accent-blue">do</strong> outperform.</p>
                             <p className="mt-2">By focusing on identifying "outliers" and "picks and shovels" within the hyper-growth sector of AI data center infrastructure, the PDCI platform is designed to generate <strong className="text-accent-blue">alpha</strong>—returns in excess of a passive benchmark. This approach carries higher concentration risk than an index fund and requires conviction. The proprietary scores and deep analytical tools within this dashboard are designed to build that conviction and help you identify opportunities that a broad market index, by its very nature, cannot effectively capture.</p>
                        </section>

                        <section>
                            <h3 className="font-bold text-lg text-gray-200 mb-2">Terms of Service</h3>
                            <p>This application is provided for informational and analytical purposes only, intended for institutional use by authorized personnel. The data and analysis presented are based on proprietary models and publicly available information, and should not be considered as financial advice or a recommendation to buy or sell any security. GloCon Solutions, LLLC is not a registered investment advisor. Your use of this platform is subject to the terms and conditions agreed upon in your institutional licensing agreement.</p>
                        </section>

                        <section>
                            <h3 className="font-bold text-lg text-gray-200 mb-2">Global Data Privacy & Compliance</h3>
                            <p>PDCI is committed to global compliance with data privacy regulations, including but not limited to GDPR (General Data Protection Regulation) and CCPA (California Consumer Privacy Act). This application does not collect, store, or process personal user data beyond what is necessary for authentication and session management. All user-generated content, such as portfolio selections, is stored securely and is not shared with third parties. We continuously monitor international regulations to ensure our platform remains compliant in all jurisdictions of operation.</p>
                        </section>

                        <section>
                            <h3 className="font-bold text-lg text-gray-200 mb-2">Accessibility Statement (ADA Compliance)</h3>
                            <p>We are committed to making our application accessible to all users, regardless of ability. This application aims to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 level AA. We have implemented ARIA (Accessible Rich Internet Applications) attributes, ensured keyboard navigability, and maintained sufficient color contrast. If you encounter any accessibility barriers, please contact your institutional administrator so we can address the issue promptly.</p>
                        </section>

                        <section>
                            <h3 className="font-bold text-lg text-gray-200 mb-2">Disclaimer</h3>
                            <p>The information provided by the PDCI Dashboard is for informational purposes only and does not constitute investment advice, financial advice, trading advice, or any other sort of advice. You should not treat any of the content as such. GloCon Solutions, LLLC does not recommend that any security should be bought, sold, or held by you. Nothing on this platform should be taken as an offer to buy, sell or hold a security. You should conduct your own due diligence and consult a professional financial advisor before making any investment decisions.</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegalModal;
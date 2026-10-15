import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-sm text-purple-200 leading-relaxed">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-white mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <h1 className="text-3xl font-extrabold text-white mb-6">Refund Policy</h1>
      <p className="text-xs text-purple-400 font-mono mb-8">14-Day Money-Back Guarantee</p>

      <div className="space-y-6 bg-[#0f0b24] border border-purple-900/40 p-8 rounded-3xl">
        <section>
          <h2 className="text-lg font-bold text-white mb-2">14-Day Guarantee</h2>
          <p>
            We stand behind the quality and reliability of SaaS Motion Pro. If you experience technical incompatibilities with your After Effects setup that our technical support team cannot resolve within 14 days of purchase, we will promptly refund your order.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">Refund Processing</h2>
          <p>
            Upon refund approval, the issued commercial license key will be permanently marked as revoked in the global registry, and connected workstations will automatically be deactivated.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">How to Request a Refund</h2>
          <p>
            Email support@saasmotionpro.com with your license key, purchase email, and a brief description of the issue.
          </p>
        </section>
      </div>
    </div>
  );
}

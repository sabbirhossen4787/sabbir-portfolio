'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function OrderStatusRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (orderId) {
      router.replace(`/saas-motion-pro/checkout?orderId=${encodeURIComponent(orderId)}`);
    } else {
      router.replace('/saas-motion-pro/checkout');
    }
  }, [orderId, router]);

  return (
    <div className="py-24 text-center text-purple-300 text-sm">
      Loading order status...
    </div>
  );
}

export default function OrderStatusPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-purple-300 text-sm">Loading order status...</div>}>
      <OrderStatusRedirect />
    </Suspense>
  );
}
